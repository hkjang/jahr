import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get("employeeId") || undefined;
        const status = searchParams.get("status") || undefined;

        const promotions = await prisma.promotion.findMany({
            where: {
                ...(employeeId && { employeeId }),
                ...(status && { status }),
            },
            orderBy: { effectiveDate: "desc" },
        });

        return NextResponse.json({ success: true, data: promotions });
    } catch (error) {
        console.error("Error fetching promotions:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch promotions" },
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

        const hasPermission = session.user.permissions?.includes("employee:write:all");
        if (!hasPermission) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();

        const promotion = await prisma.promotion.create({
            data: {
                employeeId: body.employeeId,
                fromPositionId: body.fromPositionId,
                toPositionId: body.toPositionId,
                effectiveDate: new Date(body.effectiveDate),
                reason: body.reason,
                performanceScore: body.performanceScore,
            },
        });

        return NextResponse.json({ success: true, data: promotion }, { status: 201 });
    } catch (error) {
        console.error("Error creating promotion:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create promotion" },
            { status: 500 }
        );
    }
}
