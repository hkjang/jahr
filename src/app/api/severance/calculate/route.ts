import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 퇴직금 조회 및 계산 API
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get("employeeId");

        if (!employeeId) {
            return NextResponse.json(
                { error: "Employee ID required" },
                { status: 400 }
            );
        }

        const severancePay = await prisma.severancePay.findUnique({
            where: { employeeId },
            include: {
                employee: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
                intermediateSettlements: {
                    orderBy: { settlementDate: "desc" },
                },
            },
        });

        // 퇴직연금 정보
        const retirementPension = await prisma.retirementPension.findMany({
            where: { employeeId, isActive: true },
        });

        return NextResponse.json({
            success: true,
            data: {
                severancePay,
                retirementPension,
            },
        });
    } catch (error) {
        console.error("Error fetching severance pay:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch severance pay" },
            { status: 500 }
        );
    }
}

/**
 * 퇴직금 계산
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { employeeId, calculationDate } = body;

        // 직원 정보
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: { user: true },
        });

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }

        // 재직 일수 계산
        const hireDate = new Date(employee.hireDate);
        const calcDate = calculationDate ? new Date(calculationDate) : new Date();
        const serviceDays = Math.floor(
            (calcDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // 평균임금 계산 (최근 3개월 급여 기준)
        const threeMonthsAgo = new Date(calcDate);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const recentSalaries = await prisma.salary.findMany({
            where: {
                employeeId,
                createdAt: {
                    gte: threeMonthsAgo,
                    lte: calcDate,
                },
            },
            orderBy: { yearMonth: "desc" },
            take: 3,
        });

        const totalIncome = recentSalaries.reduce(
            (sum, s) => sum + Number(s.totalEarnings),
            0
        );
        const averageWage = recentSalaries.length > 0 ? totalIncome / recentSalaries.length : 0;

        // 퇴직금 계산: (1일 평균임금 × 30일) × (재직일수 / 365)
        const dailyWage = averageWage / 30;
        const calculatedAmount = (dailyWage * 30 * serviceDays) / 365;

        // 중간정산 차감
        const intermediateSettlements = await prisma.intermediateSettlement.findMany({
            where: {
                severancePay: { employeeId },
            },
        });

        const paidAmount = intermediateSettlements.reduce(
            (sum, s) => sum + Number(s.amount),
            0
        );

        const netAmount = Math.max(0, calculatedAmount - paidAmount);

        // 퇴직금 정보 업데이트
        const severancePay = await prisma.severancePay.upsert({
            where: { employeeId },
            update: {
                averageWage,
                serviceDays,
                calculatedAmount,
                paidAmount,
                accumulatedAmount: netAmount,
                lastCalculatedAt: new Date(),
            },
            create: {
                employeeId,
                averageWage,
                serviceDays,
                calculatedAmount,
                paidAmount,
                accumulatedAmount: netAmount,
                lastCalculatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                severancePay,
                calculation: {
                    hireDate: employee.hireDate,
                    calculationDate: calcDate,
                    serviceDays,
                    averageWage,
                    dailyWage,
                    calculatedAmount,
                    paidAmount,
                    netAmount,
                },
            },
        });
    } catch (error) {
        console.error("Error calculating severance pay:", error);
        return NextResponse.json(
            { success: false, error: "Failed to calculate severance pay" },
            { status: 500 }
        );
    }
}
