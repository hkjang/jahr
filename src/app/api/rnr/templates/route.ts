import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const templates = await prisma.rnRTemplate.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: templates });
    } catch (error) {
        console.error("Error fetching R&R templates:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch R&R templates" },
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

        const template = await prisma.rnRTemplate.create({
            data: {
                name: body.name,
                description: body.description,
                category: body.category,
                organizationLevel: body.organizationLevel,
                templateData: body.templateData,
            },
        });

        return NextResponse.json({ success: true, data: template }, { status: 201 });
    } catch (error) {
        console.error("Error creating R&R template:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create R&R template" },
            { status: 500 }
        );
    }
}
