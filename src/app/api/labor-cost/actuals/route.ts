import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hasPermission = session.user.permissions?.includes("employee:read:all");
        if (!hasPermission) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const yearMonth = searchParams.get("yearMonth") || undefined;
        const organizationId = searchParams.get("organizationId") || undefined;

        const actuals = await prisma.laborCostActual.findMany({
            where: {
                ...(yearMonth && { yearMonth }),
                ...(organizationId && { organizationId }),
            },
            orderBy: { yearMonth: "desc" },
        });

        return NextResponse.json({ success: true, data: actuals });
    } catch (error) {
        console.error("Error fetching labor cost actuals:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch labor cost actuals" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hasPermission = session.user.permissions?.includes("salary:write:all");
        if (!hasPermission) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();

        // 예측과 비교하여 variance 계산
        const forecast = await prisma.laborCostForecast.findUnique({
            where: {
                yearMonth_organizationId: {
                    yearMonth: body.yearMonth,
                    organizationId: body.organizationId || null,
                },
            },
        });

        const variance = forecast
            ? parseFloat(body.totalActual) - parseFloat(forecast.totalCost)
            : 0;

        const variancePercent = forecast && parseFloat(forecast.totalCost) > 0
            ? (variance / parseFloat(forecast.totalCost)) * 100
            : 0;

        const actual = await prisma.laborCostActual.create({
            data: {
                yearMonth: body.yearMonth,
                organizationId: body.organizationId,
                baseSalaryActual: body.baseSalaryActual,
                bonusActual: body.bonusActual,
                benefitsActual: body.benefitsActual,
                totalActual: body.totalActual,
                variance,
                variancePercent,
                notes: body.notes,
            },
        });

        return NextResponse.json({ success: true, data: actual }, { status: 201 });
    } catch (error) {
        console.error("Error creating labor cost actual:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create labor cost actual" },
            { status: 500 }
        );
    }
}
