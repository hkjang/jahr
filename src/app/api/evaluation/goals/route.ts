import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 목표수립 API
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get("employeeId");
        const periodId = searchParams.get("periodId");
        const status = searchParams.get("status");

        const goals = await prisma.goalSetting.findMany({
            where: {
                ...(employeeId && { employeeId }),
                ...(periodId && { periodId }),
                ...(status && { status }),
            },
            include: {
                employee: {
                    include: {
                        user: { select: { name: true, email: true } },
                        position: true,
                    },
                },
                period: true,
                approvals: {
                    orderBy: { level: "asc" },
                },
                interimReviews: {
                    orderBy: { reviewDate: "desc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: goals });
    } catch (error) {
        console.error("Error fetching goals:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch goals" },
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

        const goal = await prisma.goalSetting.create({
            data: {
                employeeId: body.employeeId,
                periodId: body.periodId,
                goalTitle: body.goalTitle,
                goalDescription: body.goalDescription,
                measurableTarget: body.measurableTarget,
                targetValue: body.targetValue,
                weight: body.weight,
            },
            include: {
                employee: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
        });

        return NextResponse.json({ success: true, data: goal }, { status: 201 });
    } catch (error) {
        console.error("Error creating goal:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create goal" },
            { status: 500 }
        );
    }
}
