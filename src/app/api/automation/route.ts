// 자동화 API 라우트
// 자동화 규칙 CRUD 및 실행

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AutomationEngine, processScheduledAppointments } from "@/lib/automation";
import { attendanceMonitor } from "@/lib/attendance-monitor";

// 자동화 규칙 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const isActive = searchParams.get("isActive");

    const rules = await prisma.automationRule.findMany({
      where: {
        ...(type && { type: type as never }),
        ...(isActive !== null && { isActive: isActive === "true" }),
      },
      include: {
        _count: {
          select: { logs: true },
        },
      },
      orderBy: [{ type: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    console.error("Get automation rules error:", error);
    return NextResponse.json(
      { success: false, error: "자동화 규칙 조회 실패" },
      { status: 500 }
    );
  }
}

// 자동화 규칙 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, trigger, actions, schedule, isActive, priority } = body;

    if (!name || !type || !trigger || !actions) {
      return NextResponse.json(
        { success: false, error: "필수 필드가 누락되었습니다" },
        { status: 400 }
      );
    }

    const rule = await prisma.automationRule.create({
      data: {
        name,
        description,
        type,
        trigger,
        actions,
        schedule,
        isActive: isActive ?? true,
        priority: priority ?? 0,
        createdBy: "SYSTEM", // TODO: 실제 사용자 ID로 변경
      },
    });

    return NextResponse.json({
      success: true,
      data: rule,
      message: "자동화 규칙이 생성되었습니다",
    });
  } catch (error) {
    console.error("Create automation rule error:", error);
    return NextResponse.json(
      { success: false, error: "자동화 규칙 생성 실패" },
      { status: 500 }
    );
  }
}

// 자동화 실행 엔드포인트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, employeeId, appointmentId } = body;

    let result;

    switch (action) {
      case "onboarding":
        if (!employeeId) {
          return NextResponse.json(
            { success: false, error: "employeeId가 필요합니다" },
            { status: 400 }
          );
        }
        result = await AutomationEngine.executeOnboarding(employeeId, "SYSTEM");
        break;

      case "offboarding":
        if (!employeeId) {
          return NextResponse.json(
            { success: false, error: "employeeId가 필요합니다" },
            { status: 400 }
          );
        }
        result = await AutomationEngine.executeOffboarding(employeeId, "SYSTEM");
        break;

      case "appointment":
        if (!appointmentId) {
          return NextResponse.json(
            { success: false, error: "appointmentId가 필요합니다" },
            { status: 400 }
          );
        }
        result = await AutomationEngine.executeAppointment(appointmentId, "SYSTEM");
        break;

      case "scheduled-appointments":
        result = await processScheduledAppointments();
        break;

      case "attendance-check":
        const date = body.date ? new Date(body.date) : new Date();
        const alerts = await attendanceMonitor.checkDailyAttendance(date);
        const patterns = await attendanceMonitor.checkPatterns();
        const allAlerts = [...alerts, ...patterns];
        const savedCount = await attendanceMonitor.saveAlerts(allAlerts);
        result = {
          alertsDetected: allAlerts.length,
          alertsSaved: savedCount,
          alerts: allAlerts,
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: "유효하지 않은 액션입니다" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Execute automation error:", error);
    return NextResponse.json(
      { success: false, error: "자동화 실행 실패" },
      { status: 500 }
    );
  }
}
