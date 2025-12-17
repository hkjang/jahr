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
    const flat = searchParams.get("flat") === "true";

    const organizations = await prisma.organization.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              include: {
                children: { where: { isActive: true } },
                _count: { select: { employees: true } },
              },
            },
            _count: { select: { employees: true } },
          },
        },
        _count: { select: { employees: true } },
      },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });

    if (flat) {
      // 평면 리스트로 반환
      const allOrgs = await prisma.organization.findMany({
        where: { isActive: true },
        orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
      });
      return NextResponse.json({ success: true, data: allOrgs });
    }

    // 최상위 조직만 필터링 (트리 구조)
    const rootOrgs = organizations.filter((org: { parentId: string | null }) => !org.parentId);

    return NextResponse.json({ success: true, data: rootOrgs });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch organizations" },
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

    const organization = await prisma.organization.create({
      data: body,
    });

    return NextResponse.json({ success: true, data: organization }, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
