import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: 내 교육 조회
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    });

    if (!user?.employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    const trainings = await prisma.training.findMany({
      where: { employeeId: user.employee.id },
      include: {
        course: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: trainings });
  } catch (error) {
    console.error("Error fetching my trainings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trainings" },
      { status: 500 }
    );
  }
}

// POST: 교육 신청
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    });

    if (!user?.employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { courseId, startDate } = body;

    // 중복 신청 확인
    const existing = await prisma.training.findFirst({
      where: {
        employeeId: user.employee.id,
        courseId,
        status: { in: ["ENROLLED", "IN_PROGRESS"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // 정원 확인
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { trainings: true } } },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.maxCapacity && course._count.trainings >= course.maxCapacity) {
      return NextResponse.json(
        { success: false, error: "Course is full" },
        { status: 400 }
      );
    }

    const training = await prisma.training.create({
      data: {
        employeeId: user.employee.id,
        courseId,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: "ENROLLED",
      },
      include: { course: true },
    });

    return NextResponse.json({ success: true, data: training }, { status: 201 });
  } catch (error) {
    console.error("Error enrolling in training:", error);
    return NextResponse.json(
      { success: false, error: "Failed to enroll in training" },
      { status: 500 }
    );
  }
}

// DELETE: 교육 취소
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trainingId = searchParams.get("id");

    if (!trainingId) {
      return NextResponse.json(
        { success: false, error: "Training ID required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    });

    const training = await prisma.training.findFirst({
      where: {
        id: trainingId,
        employeeId: user?.employee?.id,
        status: "ENROLLED",
      },
    });

    if (!training) {
      return NextResponse.json(
        { success: false, error: "Training not found or cannot be cancelled" },
        { status: 404 }
      );
    }

    await prisma.training.update({
      where: { id: trainingId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling training:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel training" },
      { status: 500 }
    );
  }
}
