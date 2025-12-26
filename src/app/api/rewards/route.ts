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
        const type = searchParams.get("type") || undefined;

        const records = await prisma.rewardPunishment.findMany({
            where: {
                ...(employeeId && { employeeId }),
                ...(type && { type }),
            },
            orderBy: { date: "desc" },
        });

        return NextResponse.json({ success: true, data: records });
    } catch (error) {
        console.error("Error fetching rewards/punishments:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch records" },
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

        const record = await prisma.rewardPunishment.create({
            data: {
                employeeId: body.employeeId,
                type: body.type,
                category: body.category,
                title: body.title,
                description: body.description,
                date: new Date(body.date),
                severity: body.severity,
                expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
                documentUrl: body.documentUrl,
                issuedBy: session.user.id,
            },
        });

        return NextResponse.json({ success: true, data: record }, { status: 201 });
    } catch (error) {
        console.error("Error creating reward/punishment:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create record" },
            { status: 500 }
        );
    }
}
