import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const periods = await prisma.evaluationPeriod.findMany({
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ success: true, data: periods });
  } catch (error) {
    console.error("Error fetching evaluation periods:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch evaluation periods" },
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
    const { name, type, year, startDate, endDate } = body;

    const period = await prisma.evaluationPeriod.create({
      data: {
        name,
        type,
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ success: true, data: period }, { status: 201 });
  } catch (error) {
    console.error("Error creating evaluation period:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create evaluation period" },
      { status: 500 }
    );
  }
}
