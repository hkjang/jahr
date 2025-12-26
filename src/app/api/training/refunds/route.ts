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

        const refunds = await prisma.trainingRefund.findMany({
            where: {
                ...(employeeId && { employeeId }),
                ...(status && { status }),
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: refunds });
    } catch (error) {
        console.error("Error fetching training refunds:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch training refunds" },
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

        const refund = await prisma.trainingRefund.create({
            data: {
                employeeId: body.employeeId,
                trainingId: body.trainingId,
                externalCourse: body.externalCourse,
                amount: body.amount,
                requestedAmount: body.requestedAmount,
                completionCertUrl: body.completionCertUrl,
            },
        });

        return NextResponse.json({ success: true, data: refund }, { status: 201 });
    } catch (error) {
        console.error("Error creating training refund:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create training refund" },
            { status: 500 }
        );
    }
}
