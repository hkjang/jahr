import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const positions = await prisma.position.findMany({
      where: { isActive: true },
      orderBy: { level: "asc" },
    });

    return NextResponse.json({ success: true, data: positions });
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch positions" },
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

    const position = await prisma.position.create({
      data: body,
    });

    return NextResponse.json({ success: true, data: position }, { status: 201 });
  } catch (error) {
    console.error("Error creating position:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create position" },
      { status: 500 }
    );
  }
}
