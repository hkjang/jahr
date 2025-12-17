import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 현재 연도/월
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const yearMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;

    // 통계 데이터 수집
    const [
      totalEmployees,
      activeEmployees,
      newHiresThisMonth,
      resignationsThisMonth,
      departmentStats,
      attendanceStats,
      leaveStats,
      approvalStats,
    ] = await Promise.all([
      // 전체 직원 수
      prisma.employee.count(),
      // 재직 직원 수
      prisma.employee.count({
        where: { user: { status: "ACTIVE" } },
      }),
      // 이번 달 신규 입사자
      prisma.employee.count({
        where: {
          hireDate: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
      }),
      // 이번 달 퇴사자
      prisma.appointment.count({
        where: {
          type: "RESIGNATION",
          effectiveDate: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
      }),
      // 부서별 인원
      prisma.organization.findMany({
        where: { level: "DEPARTMENT", isActive: true },
        select: {
          id: true,
          name: true,
          _count: { select: { employees: true } },
        },
      }),
      // 이번 달 근태 통계
      prisma.attendance.groupBy({
        by: ["status"],
        where: {
          date: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
        _count: true,
      }),
      // 이번 달 휴가 통계
      prisma.leave.groupBy({
        by: ["status"],
        where: {
          createdAt: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
        _count: true,
        _sum: { days: true },
      }),
      // 결재 통계
      prisma.approval.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    // 월별 입퇴사 추이 (최근 6개월)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - 1 - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;

      const [hires, resignations] = await Promise.all([
        prisma.employee.count({
          where: {
            hireDate: {
              gte: targetDate,
              lt: new Date(year, month, 1),
            },
          },
        }),
        prisma.appointment.count({
          where: {
            type: "RESIGNATION",
            effectiveDate: {
              gte: targetDate,
              lt: new Date(year, month, 1),
            },
          },
        }),
      ]);

      monthlyTrend.push({
        month: `${year}-${String(month).padStart(2, "0")}`,
        hires,
        resignations,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalEmployees,
          activeEmployees,
          newHiresThisMonth,
          resignationsThisMonth,
        },
        departmentStats: departmentStats.map((d) => ({
          name: d.name,
          count: d._count.employees,
        })),
        attendanceStats: attendanceStats.map((a) => ({
          status: a.status,
          count: a._count,
        })),
        leaveStats: leaveStats.map((l) => ({
          status: l.status,
          count: l._count,
          totalDays: l._sum.days || 0,
        })),
        approvalStats: approvalStats.map((a) => ({
          status: a.status,
          count: a._count,
        })),
        monthlyTrend,
        period: yearMonth,
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
