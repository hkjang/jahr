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

        const absences = await prisma.absenceOfLeave.findMany({
            where: {
                ...(employeeId && { employeeId }),
                ...(status && { status }),
            },
            orderBy: { startDate: "desc" },
        });

        return NextResponse.json({ success: true, data: absences });
    } catch (error) {
        console.error("Error fetching absences:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch absences" },
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

        const absence = await prisma.absenceOfLeave.create({
            data: {
                employeeId: body.employeeId,
                absenceType: body.absenceType,
                startDate: new Date(body.startDate),
                endDate: body.endDate ? new Date(body.endDate) : null,
                expectedReturnDate: new Date(body.expectedReturnDate),
                reason: body.reason,
                relatedDocuments: body.relatedDocuments,
            },
        });

        return NextResponse.json({ success: true, data: absence }, { status: 201 });
    } catch (error) {
        console.error("Error creating absence:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create absence" },
            { status: 500 }
        );
    }
}
