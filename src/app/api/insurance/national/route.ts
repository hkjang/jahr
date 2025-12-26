import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 4대보험 현황 조회 및 관리 API
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get("employeeId");
        const insuranceType = searchParams.get("insuranceType");
        const yearMonth = searchParams.get("yearMonth");

        if (yearMonth) {
            // 월별 납부 내역 조회
            const payments = await prisma.insurancePayment.findMany({
                where: {
                    yearMonth,
                    ...(employeeId && {
                        employeeInsurance: { employeeId },
                    }),
                },
                include: {
                    employeeInsurance: {
                        include: {
                            employee: {
                                include: {
                                    user: { select: { name: true, employeeId: true } },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            // 월별 집계
            const summary = {
                totalEmployeeAmount: payments.reduce(
                    (sum, p) => sum + Number(p.employeeAmount),
                    0
                ),
                totalEmployerAmount: payments.reduce(
                    (sum, p) => sum + Number(p.employerAmount),
                    0
                ),
                totalAmount: payments.reduce((sum, p) => sum + Number(p.totalAmount), 0),
                paidCount: payments.filter((p) => p.isPaid).length,
                unpaidCount: payments.filter((p) => !p.isPaid).length,
            };

            return NextResponse.json({
                success: true,
                data: { payments, summary },
            });
        }

        // 직원별 보험 가입 현황
        const insurances = await prisma.employeeInsurance.findMany({
            where: {
                ...(employeeId && { employeeId }),
                ...(insuranceType && { insuranceType }),
            },
            include: {
                employee: {
                    include: {
                        user: { select: { name: true, employeeId: true } },
                        organization: { select: { name: true } },
                    },
                },
                payments: {
                    take: 12,
                    orderBy: { yearMonth: "desc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: insurances });
    } catch (error) {
        console.error("Error fetching insurance:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch insurance data" },
            { status: 500 }
        );
    }
}

/**
 * 보험료 계산 API
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { employeeId, yearMonth, standardIncome } = body;

        // 당월 요율 조회
        const insuranceRates = await prisma.nationalInsurance.findMany({
            where: { isActive: true },
        });

        const results = [];

        for (const rate of insuranceRates) {
            // 직원 보험 정보 조회
            const empInsurance = await prisma.employeeInsurance.findUnique({
                where: {
                    employeeId_insuranceType: {
                        employeeId,
                        insuranceType: rate.type,
                    },
                },
            });

            if (!empInsurance || empInsurance.status !== "ACTIVE") continue;

            // 보험료 계산
            const income = standardIncome || Number(empInsurance.standardIncome);
            const employeeAmount = income * Number(rate.employeeRate);
            const employerAmount = income * Number(rate.employerRate);
            const totalAmount = employeeAmount + employerAmount;

            // 납부 기록 생성/업데이트
            const payment = await prisma.insurancePayment.upsert({
                where: {
                    employeeInsuranceId_yearMonth: {
                        employeeInsuranceId: empInsurance.id,
                        yearMonth,
                    },
                },
                update: {
                    standardIncome: income,
                    employeeAmount,
                    employerAmount,
                    totalAmount,
                },
                create: {
                    employeeInsuranceId: empInsurance.id,
                    yearMonth,
                    standardIncome: income,
                    employeeAmount,
                    employerAmount,
                    totalAmount,
                },
            });

            results.push(payment);
        }

        return NextResponse.json({ success: true, data: results });
    } catch (error) {
        console.error("Error calculating insurance:", error);
        return NextResponse.json(
            { success: false, error: "Failed to calculate insurance" },
            { status: 500 }
        );
    }
}
