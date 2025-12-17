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
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const requesterId = searchParams.get("requesterId") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (requesterId) where.requesterId = requesterId;

    const [approvals, total] = await Promise.all([
      prisma.approval.findMany({
        where,
        include: {
          requester: {
            select: { name: true, employeeId: true },
          },
          lines: {
            include: {
              approver: {
                select: { name: true },
              },
            },
            orderBy: { sequence: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.approval.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: approvals,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching approvals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch approvals" },
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
    const { type, title, content, approverIds } = body;

    // 문서번호 생성 (YYYYMMDD-TYPE-NNNN)
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, "");
    const typePrefix = type.slice(0, 3).toUpperCase();
    const count = await prisma.approval.count({
      where: {
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    });
    const docNumber = `${datePrefix}-${typePrefix}-${String(count + 1).padStart(4, "0")}`;

    const approval = await prisma.approval.create({
      data: {
        docNumber,
        type,
        title,
        content,
        requesterId: session.user.id,
        status: "PENDING",
        currentStep: 1,
        lines: {
          create: approverIds.map((approverId: string, index: number) => ({
            sequence: index + 1,
            approverId,
            status: index === 0 ? "PENDING" : "PENDING",
          })),
        },
      },
      include: {
        lines: {
          include: {
            approver: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: approval }, { status: 201 });
  } catch (error) {
    console.error("Error creating approval:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create approval" },
      { status: 500 }
    );
  }
}
