import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Pay-band 조회 및 관리 API
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const positionId = searchParams.get("positionId");

        const payBands = await prisma.payBand.findMany({
            where: {
                isActive: true,
                ...(positionId && { positionId }),
            },
            include: {
                position: true,
            },
            orderBy: { effectiveDate: "desc" },
        });

        return NextResponse.json({ success: true, data: payBands });
    } catch (error) {
        console.error("Error fetching pay bands:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch pay bands" },
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

        const payBand = await prisma.payBand.create({
            data: {
                positionId: body.positionId,
                grade: body.grade,
                minSalary: body.minSalary,
                midSalary: body.midSalary,
                maxSalary: body.maxSalary,
                effectiveDate: new Date(body.effectiveDate),
            },
            include: {
                position: true,
            },
        });

        return NextResponse.json({ success: true, data: payBand }, { status: 201 });
    } catch (error) {
        console.error("Error creating pay band:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create pay band" },
            { status: 500 }
        );
    }
}
