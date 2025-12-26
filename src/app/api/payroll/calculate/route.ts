import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 급여 계산 API
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { employeeId, yearMonth } = body;

        // 직원 정보 조회
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                position: true,
                user: true,
            },
        });

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }

        // 기본급 (기존 급여 또는 Pay-band 기준)
        const existingSalary = await prisma.salary.findUnique({
            where: { employeeId_yearMonth: { employeeId, yearMonth } },
        });

        const baseSalary = existingSalary
            ? Number(existingSalary.baseSalary)
            : 3000000; // 기본값 (실제로는 Pay-band 에서 가져와야 함)

        // 수당 계산
        const allowanceRules = await prisma.allowanceRule.findMany({
            where: { isActive: true },
        });

        const allowances: Record<string, number> = {};
        let totalAllowances = 0;

        for (const rule of allowanceRules) {
            let amount = 0;

            switch (rule.type) {
                case "FIXED":
                    amount = Number(rule.baseAmount || 0);
                    break;
                case "RATIO":
                    // 기본급 대비 비율
                    const ratio = (rule.calculationFormula as any)?.ratio || 0;
                    amount = baseSalary * ratio;
                    break;
                case "VARIABLE":
                    // 변동 수당 (근태, 성과 등에 따라)
                    amount = 0; // TODO: 복잡한 계산 로직
                    break;
            }

            if (amount > 0) {
                allowances[rule.name] = amount;
                totalAllowances += amount;
            }
        }

        // 총 지급액
        const totalEarnings = baseSalary + totalAllowances;

        // 공제 계산
        const deductionRules = await prisma.deductionRule.findMany({
            where: { isActive: true },
        });

        const deductions: Record<string, number> = {};
        let totalDeductions = 0;

        for (const rule of deductionRules) {
            let amount = 0;

            if (rule.type === "INSURANCE") {
                // 4대보험 조회
                const insurancePayments = await prisma.insurancePayment.findMany({
                    where: {
                        yearMonth,
                        employeeInsurance: { employeeId },
                    },
                });

                amount = insurancePayments.reduce(
                    (sum, p) => sum + Number(p.employeeAmount),
                    0
                );
            } else if (rule.type === "TAX") {
                // 간이세액표 기준 (간략화)
                const taxableIncome = totalEarnings;
                amount = taxableIncome * 0.06; // 6% 가정 (실제로는 누진세율 적용)
            }

            if (amount > 0) {
                deductions[rule.name] = amount;
                totalDeductions += amount;
            }
        }

        // 실수령액
        const netSalary = totalEarnings - totalDeductions;

        // 급여 기록 생성/업데이트
        const salary = await prisma.salary.upsert({
            where: { employeeId_yearMonth: { employeeId, yearMonth } },
            update: {
                baseSalary,
                bonus: 0,
                allowances,
                deductions,
                totalEarnings,
                totalDeductions,
                netSalary,
            },
            create: {
                employeeId,
                yearMonth,
                baseSalary,
                bonus: 0,
                allowances,
                deductions,
                totalEarnings,
                totalDeductions,
                netSalary,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                salary,
                breakdown: {
                    baseSalary,
                    allowances,
                    totalAllowances,
                    totalEarnings,
                    deductions,
                    totalDeductions,
                    netSalary,
                },
            },
        });
    } catch (error) {
        console.error("Error calculating payroll:", error);
        return NextResponse.json(
            { success: false, error: "Failed to calculate payroll" },
            { status: 500 }
        );
    }
}
