import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 수당 규칙 관리 API
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const allowances = await prisma.allowanceRule.findMany({
            where: { isActive: true },
            orderBy: { code: "asc" },
        });

        return NextResponse.json({ success: true, data: allowances });
    } catch (error) {
        console.error("Error fetching allowance rules:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch allowance rules" },
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

        const body = await request.json();

        const allowance = await prisma.allowanceRule.create({
            data: {
                code: body.code,
                name: body.name,
                type: body.type,
                baseAmount: body.baseAmount,
                calculationFormula: body.calculationFormula,
                isTaxable: body.isTaxable ?? true,
                isRetirementIncluded: body.isRetirementIncluded ?? true,
                applicablePositions: body.applicablePositions || [],
                description: body.description,
            },
        });

        return NextResponse.json({ success: true, data: allowance }, { status: 201 });
    } catch (error) {
        console.error("Error creating allowance rule:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create allowance rule" },
            { status: 500 }
        );
    }
}
