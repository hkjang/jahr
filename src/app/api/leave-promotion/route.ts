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
        const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;

        const campaigns = await prisma.leavePromotionCampaign.findMany({
            where: {
                ...(year && { year }),
                isActive: true,
            },
            include: {
                targets: {
                    where: {
                        notificationSent: false,
                    },
                    take: 10,
                },
                _count: {
                    select: { targets: true },
                },
            },
            orderBy: { year: "desc" },
        });

        return NextResponse.json({ success: true, data: campaigns });
    } catch (error) {
        console.error("Error fetching leave promotion campaigns:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch campaigns" },
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

        const hasPermission = session.user.permissions?.includes("leave:write:all");
        if (!hasPermission) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();

        const campaign = await prisma.leavePromotionCampaign.create({
            data: {
                year: body.year,
                name: body.name,
                description: body.description,
                targetOrganizations: body.targetOrganizations,
                minUnusedDays: body.minUnusedDays,
                promotionPeriodStart: new Date(body.promotionPeriodStart),
                promotionPeriodEnd: new Date(body.promotionPeriodEnd),
            },
        });

        return NextResponse.json({ success: true, data: campaign }, { status: 201 });
    } catch (error) {
        console.error("Error creating leave promotion campaign:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create campaign" },
            { status: 500 }
        );
    }
}
