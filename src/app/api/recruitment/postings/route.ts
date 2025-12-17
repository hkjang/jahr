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
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;

    const [postings, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        include: {
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.jobPosting.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: postings,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching job postings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job postings" },
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
    const {
      title, organizationId, positionId, description, requirements,
      benefits, salaryRange, employmentType, location
    } = body;

    const posting = await prisma.jobPosting.create({
      data: {
        title,
        organizationId,
        positionId,
        description,
        requirements,
        benefits,
        salaryRange,
        employmentType,
        location,
        status: "DRAFT",
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: posting }, { status: 201 });
  } catch (error) {
    console.error("Error creating job posting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create job posting" },
      { status: 500 }
    );
  }
}
