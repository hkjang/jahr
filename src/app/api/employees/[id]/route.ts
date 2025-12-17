import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            name: true,
            phoneNumber: true,
            birthDate: true,
            profileImage: true,
            status: true,
            roles: {
              include: { role: true },
            },
          },
        },
        organization: true,
        position: true,
        jobTitle: true,
        job: true,
        educations: { orderBy: { startDate: "desc" } },
        careers: { orderBy: { startDate: "desc" } },
        families: true,
        documents: { orderBy: { uploadedAt: "desc" } },
        appointments: {
          orderBy: { effectiveDate: "desc" },
          take: 10,
        },
        leaveBalances: {
          where: { year: new Date().getFullYear() },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { user: userData, ...employeeData } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      const employee = await tx.employee.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!employee) {
        throw new Error("Employee not found");
      }

      if (userData) {
        await tx.user.update({
          where: { id: employee.userId },
          data: userData,
        });
      }

      const updated = await tx.employee.update({
        where: { id },
        data: {
          ...employeeData,
          ...(employeeData.hireDate && { hireDate: new Date(employeeData.hireDate) }),
        },
        include: {
          user: true,
          organization: true,
          position: true,
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = session.user.permissions?.includes("employee:write:all");
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Soft delete: 사용자 상태를 INACTIVE로 변경
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: employee.userId },
      data: { status: "INACTIVE" },
    });

    return NextResponse.json({ success: true, message: "Employee deactivated" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
