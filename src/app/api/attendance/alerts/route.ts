// 근태 알림 API 라우트
// 근태 이상 알림 조회 및 해결

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

// 근태 알림 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get("employeeId");
    const alertType = searchParams.get("alertType");
    const isResolved = searchParams.get("isResolved");
    const days = searchParams.get("days") || "30";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const startDate = subDays(new Date(), parseInt(days));

    const where = {
      date: { gte: startOfDay(startDate) },
      ...(employeeId && { employeeId }),
      ...(alertType && { alertType }),
      ...(isResolved !== null && { isResolved: isResolved === "true" }),
    };

    const [alerts, total] = await Promise.all([
      prisma.attendanceAlert.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.attendanceAlert.count({ where }),
    ]);

    // 통계
    const stats = await prisma.attendanceAlert.groupBy({
      by: ["alertType"],
      where: { date: { gte: startOfDay(startDate) } },
      _count: { _all: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        items: alerts,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      stats: stats.reduce(
        (acc, s) => ({ ...acc, [s.alertType]: s._count._all }),
        {} as Record<string, number>
      ),
    });
  } catch (error) {
    console.error("Get attendance alerts error:", error);
    return NextResponse.json(
      { success: false, error: "근태 알림 조회 실패" },
      { status: 500 }
    );
  }
}

// 알림 해결 처리
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, resolvedBy } = body;

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: "alertId가 필요합니다" },
        { status: 400 }
      );
    }

    const alert = await prisma.attendanceAlert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedBy: resolvedBy || "SYSTEM",
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: alert,
      message: "알림이 해결 처리되었습니다",
    });
  } catch (error) {
    console.error("Resolve attendance alert error:", error);
    return NextResponse.json(
      { success: false, error: "알림 해결 처리 실패" },
      { status: 500 }
    );
  }
}
