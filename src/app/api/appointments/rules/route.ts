import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hasPermission = session.user.permissions?.includes("organization:read:all");
        if (!hasPermission) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const appointmentTypes = searchParams.get("appointmentType") || undefined;

        const rules = await prisma.appointmentRule.findMany({
            where: {
                isActive: true,
                ...(appointmentType && { appointmentType }),
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: rules });
    } catch (error) {
        console.error("Error fetching appointment rules:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch appointment rules" },
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

        const rule = await prisma.appointmentRule.create({
            data: {
                code: body.code,
                name: body.name,
                description: body.description,
                appointmentType: body.appointmentType,
                conditions: body.conditions,
                validations: body.validations,
                autoApprovalRules: body.autoApprovalRules,
            },
        });

        return NextResponse.json({ success: true, data: rule }, { status: 201 });
    } catch (error) {
        console.error("Error creating appointment rule:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create appointment rule" },
            { status: 500 }
        );
    }
}
