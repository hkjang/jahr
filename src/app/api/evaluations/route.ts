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
    const periodId = searchParams.get("periodId") || undefined;
    const employeeId = searchParams.get("employeeId") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (periodId) where.periodId = periodId;
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        include: {
          employee: {
            include: {
              user: { select: { name: true, employeeId: true } },
              organization: { select: { name: true } },
              position: { select: { name: true } },
            },
          },
          period: true,
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.evaluation.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: evaluations,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch evaluations" },
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
    const { employeeId, periodId, items, selfComment } = body;

    const evaluation = await prisma.evaluation.create({
      data: {
        employeeId,
        periodId,
        status: "SELF_EVALUATION",
        selfComment,
        items: {
          create: items.map((item: { category: string; name: string; weight: number; selfScore?: number; selfComment?: string }) => ({
            category: item.category,
            name: item.name,
            weight: item.weight,
            selfScore: item.selfScore,
            selfComment: item.selfComment,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: evaluation }, { status: 201 });
  } catch (error) {
    console.error("Error creating evaluation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create evaluation" },
      { status: 500 }
    );
  }
}
