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
        const startDate = searchParams.get("startDate") || undefined;
        const endDate = searchParams.get("endDate") || undefined;

        const trips = await prisma.businessTrip.findMany({
            where: {
                ...(employeeId && { employeeId }),
                ...(status && { status }),
                ...(startDate && { startDate: { gte: new Date(startDate) } }),
                ...(endDate && { endDate: { lte: new Date(endDate) } }),
            },
            include: {
                expenses: {
                    orderBy: { expenseDate: "desc" },
                },
                budget: {
                    select: { totalBudget: true, usedBudget: true },
                },
            },
            orderBy: { startDate: "desc" },
        });

        return NextResponse.json({ success: true, data: trips });
    } catch (error) {
        console.error("Error fetching business trips:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch business trips" },
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

        const trip = await prisma.businessTrip.create({
            data: {
                employeeId: body.employeeId,
                title: body.title,
                purpose: body.purpose,
                destination: body.destination,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                budgetId: body.budgetId,
                notes: body.notes,
            },
            include: {
                expenses: true,
            },
        });

        return NextResponse.json({ success: true, data: trip }, { status: 201 });
    } catch (error) {
        console.error("Error creating business trip:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create business trip" },
            { status: 500 }
        );
    }
}
