import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 공제 규칙 관리 API
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const deductions = await prisma.deductionRule.findMany({
            where: { isActive: true },
            orderBy: { type: "asc" },
        });

        return NextResponse.json({ success: true, data: deductions });
    } catch (error) {
        console.error("Error fetching deduction rules:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch deduction rules" },
            { status: 500 }
        );
    }
}
