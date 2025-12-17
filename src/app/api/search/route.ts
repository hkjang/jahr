import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 검색 결과 그룹 타입
interface SearchResultGroup {
  type: "employee" | "department" | "document";
  label: string;
  items: Array<{
    id: string;
    type: "employee" | "department" | "document";
    title: string;
    subtitle?: string;
    meta?: string;
    href: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ groups: [] });
    }

    const groups: SearchResultGroup[] = [];

    // 1. 직원 검색 (사번, 이름)
    const employees = await prisma.user.findMany({
      where: {
        OR: [
          { employeeId: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
        status: "ACTIVE",
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        employee: {
          select: {
            organization: {
              select: { name: true },
            },
            position: {
              select: { name: true },
            },
          },
        },
      },
      take: 5,
    });

    if (employees.length > 0) {
      groups.push({
        type: "employee",
        label: "직원",
        items: employees.map((emp) => ({
          id: emp.id,
          type: "employee",
          title: emp.name,
          subtitle: emp.employee
            ? `${emp.employee.organization.name} · ${emp.employee.position.name}`
            : undefined,
          meta: emp.employeeId,
          href: `/admin/employees/${emp.id}`,
        })),
      });
    }

    // 2. 부서 검색
    const departments = await prisma.organization.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
        ],
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        level: true,
        _count: {
          select: { employees: true },
        },
      },
      take: 5,
    });

    if (departments.length > 0) {
      groups.push({
        type: "department",
        label: "조직",
        items: departments.map((dept) => ({
          id: dept.id,
          type: "department",
          title: dept.name,
          subtitle: dept.code,
          meta: `${dept._count.employees}명`,
          href: `/admin/organization?id=${dept.id}`,
        })),
      });
    }

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
