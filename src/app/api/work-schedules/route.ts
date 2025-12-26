import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const templates = await prisma.workScheduleTemplate.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: { assignments: true },
                },
            },
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ success: true, data: templates });
    } catch (error) {
        console.error("Error fetching work schedules:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch schedules" },
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

        const hasPermission = session.user.permissions?.includes("system:write:all");
        if (!hasPermission) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();

        const template = await prisma.workScheduleTemplate.create({
            data: {
                code: body.code,
                name: body.name,
                scheduleType: body.scheduleType,
                coreHoursStart: body.coreHoursStart,
                coreHoursEnd: body.coreHoursEnd,
                dailyWorkHours: body.dailyWorkHours || 8,
                weeklyWorkHours: body.weeklyWorkHours || 40,
                flexibilityRules: body.flexibilityRules,
            },
        });

        return NextResponse.json({ success: true, data: template }, { status: 201 });
    } catch (error) {
        console.error("Error creating work schedule:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create schedule" },
            { status: 500 }
        );
    }
}
