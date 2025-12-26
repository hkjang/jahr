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
        const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
        const status = searchParams.get("status") || undefined;

        const idps = await prisma.iDP.findMany({
            where: {
                ...(employeeId && { employeeId }),
                ...(year && { year }),
                ...(status && { status }),
            },
            include: {
                goals: {
                    include: {
                        progress: {
                            orderBy: { recordedAt: "desc" },
                            take: 1,
                        },
                    },
                    orderBy: { sortOrder: "asc" },
                },
            },
            orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        });

        return NextResponse.json({ success: true, data: idps });
    } catch (error) {
        console.error("Error fetching IDPs:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch IDPs" },
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

        const idp = await prisma.iDP.create({
            data: {
                employeeId: body.employeeId,
                year: body.year,
                status: body.status || "DRAFT",
                overallGoal: body.overallGoal,
            },
            include: {
                goals: true,
            },
        });

        return NextResponse.json({ success: true, data: idp }, { status: 201 });
    } catch (error) {
        console.error("Error creating IDP:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create IDP" },
            { status: 500 }
        );
    }
}
