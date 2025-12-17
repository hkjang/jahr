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
    const yearMonth = searchParams.get("yearMonth") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }
    if (yearMonth) {
      where.yearMonth = yearMonth;
    }

    const [salaries, total] = await Promise.all([
      prisma.salary.findMany({
        where,
        include: {
          employee: {
            include: {
              user: {
                select: { name: true, employeeId: true },
              },
              organization: { select: { name: true } },
              position: { select: { name: true } },
            },
          },
        },
        orderBy: [{ yearMonth: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.salary.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: salaries,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching salaries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch salaries" },
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasPermission = (session.user as any).permissions?.includes("salary:write:all");
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { employeeId, yearMonth, baseSalary, bonus, allowances, deductions, totalEarnings, totalDeductions, netSalary } = body;

    // Upsert 로직
    const existing = await prisma.salary.findFirst({
      where: { employeeId, yearMonth },
    });

    let salary;
    if (existing) {
      salary = await prisma.salary.update({
        where: { id: existing.id },
        data: {
          baseSalary,
          bonus: bonus || 0,
          allowances: allowances || {},
          deductions: deductions || {},
          totalEarnings: totalEarnings || baseSalary,
          totalDeductions: totalDeductions || 0,
          netSalary: netSalary || baseSalary,
        },
      });
    } else {
      salary = await prisma.salary.create({
        data: {
          employeeId,
          yearMonth,
          baseSalary,
          bonus: bonus || 0,
          allowances: allowances || {},
          deductions: deductions || {},
          totalEarnings: totalEarnings || baseSalary,
          totalDeductions: totalDeductions || 0,
          netSalary: netSalary || baseSalary,
        },
      });
    }

    return NextResponse.json({ success: true, data: salary }, { status: 201 });
  } catch (error) {
    console.error("Error creating salary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create salary" },
      { status: 500 }
    );
  }
}
