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
        const category = searchParams.get("category") || undefined;
        const level = searchParams.get("level") || undefined;

        const rnrs = await prisma.rnR.findMany({
            where: {
                isActive: true,
                ...(category && { category }),
                ...(level && { level }),
            },
            include: {
                assignments: {
                    take: 10,
                    orderBy: { assignedAt: "desc" },
                },
                _count: {
                    select: { assignments: true },
                },
            },
            orderBy: [{ category: "asc" }, { level: "asc" }, { name: "asc" }],
        });

        return NextResponse.json({ success: true, data: rnrs });
    } catch (error) {
        console.error("Error fetching R&Rs:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch R&Rs" },
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

        const hasPermission = session.user.permissions?.includes("organization:write:all");
        if (!hasPermission) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();

        const rnr = await prisma.rnR.create({
            data: {
                code: body.code,
                name: body.name,
                description: body.description,
                category: body.category,
                level: body.level,
            },
        });

        return NextResponse.json({ success: true, data: rnr }, { status: 201 });
    } catch (error) {
        console.error("Error creating R&R:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create R&R" },
            { status: 500 }
        );
    }
}
