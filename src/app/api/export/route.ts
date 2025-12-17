import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 엑셀 CSV 생성 헬퍼
function generateCSV(data: Record<string, unknown>[], columns: { key: string; label: string }[]): string {
  const header = columns.map((c) => c.label).join(",");
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const value = row[c.key];
        // 쉼표나 줄바꿈이 있으면 따옴표로 감싸기
        if (typeof value === "string" && (value.includes(",") || value.includes("\n"))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      })
      .join(",")
  );
  return [header, ...rows].join("\n");
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // employees, attendance, salary, leaves

    let csvContent = "";
    let filename = "export.csv";

    switch (type) {
      case "employees": {
        const employees = await prisma.employee.findMany({
          include: {
            user: { select: { name: true, email: true, employeeId: true, phoneNumber: true } },
            organization: { select: { name: true } },
            position: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        const columns = [
          { key: "employeeId", label: "사번" },
          { key: "name", label: "이름" },
          { key: "email", label: "이메일" },
          { key: "phone", label: "전화번호" },
          { key: "organization", label: "소속" },
          { key: "position", label: "직급" },
          { key: "hireDate", label: "입사일" },
          { key: "employmentType", label: "고용형태" },
        ];

        const data = employees.map((e) => ({
          employeeId: e.user.employeeId,
          name: e.user.name,
          email: e.user.email,
          phone: e.user.phoneNumber || "",
          organization: e.organization.name,
          position: e.position.name,
          hireDate: e.hireDate.toISOString().split("T")[0],
          employmentType: e.employmentType,
        }));

        csvContent = generateCSV(data, columns);
        filename = `employees_${new Date().toISOString().split("T")[0]}.csv`;
        break;
      }

      case "attendance": {
        const yearMonth = searchParams.get("yearMonth") || new Date().toISOString().slice(0, 7).replace("-", "");
        const year = parseInt(yearMonth.slice(0, 4));
        const month = parseInt(yearMonth.slice(4, 6));

        const attendance = await prisma.attendance.findMany({
          where: {
            date: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
          include: {
            employee: {
              include: {
                user: { select: { name: true, employeeId: true } },
              },
            },
          },
          orderBy: [{ date: "asc" }, { createdAt: "asc" }],
        });

        const columns = [
          { key: "date", label: "날짜" },
          { key: "employeeId", label: "사번" },
          { key: "name", label: "이름" },
          { key: "checkIn", label: "출근시간" },
          { key: "checkOut", label: "퇴근시간" },
          { key: "status", label: "상태" },
          { key: "workMinutes", label: "근무시간(분)" },
        ];

        const data = attendance.map((a) => ({
          date: a.date.toISOString().split("T")[0],
          employeeId: a.employee.user.employeeId,
          name: a.employee.user.name,
          checkIn: a.checkIn ? a.checkIn.toISOString().slice(11, 16) : "",
          checkOut: a.checkOut ? a.checkOut.toISOString().slice(11, 16) : "",
          status: a.status,
          workMinutes: a.workMinutes || 0,
        }));

        csvContent = generateCSV(data, columns);
        filename = `attendance_${yearMonth}.csv`;
        break;
      }

      case "salary": {
        const yearMonth = searchParams.get("yearMonth") || new Date().toISOString().slice(0, 7).replace("-", "");

        const salaries = await prisma.salary.findMany({
          where: { yearMonth },
          include: {
            employee: {
              include: {
                user: { select: { name: true, employeeId: true } },
                organization: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        const columns = [
          { key: "employeeId", label: "사번" },
          { key: "name", label: "이름" },
          { key: "organization", label: "소속" },
          { key: "baseSalary", label: "기본급" },
          { key: "bonus", label: "상여금" },
          { key: "totalEarnings", label: "총지급액" },
          { key: "totalDeductions", label: "공제액" },
          { key: "netSalary", label: "실수령액" },
        ];

        const data = salaries.map((s) => ({
          employeeId: s.employee.user.employeeId,
          name: s.employee.user.name,
          organization: s.employee.organization.name,
          baseSalary: Number(s.baseSalary),
          bonus: Number(s.bonus),
          totalEarnings: Number(s.totalEarnings),
          totalDeductions: Number(s.totalDeductions),
          netSalary: Number(s.netSalary),
        }));

        csvContent = generateCSV(data, columns);
        filename = `salary_${yearMonth}.csv`;
        break;
      }

      case "leaves": {
        const year = searchParams.get("year") || new Date().getFullYear().toString();

        const leaves = await prisma.leave.findMany({
          where: {
            startDate: {
              gte: new Date(parseInt(year), 0, 1),
              lt: new Date(parseInt(year) + 1, 0, 1),
            },
          },
          include: {
            employee: {
              include: {
                user: { select: { name: true, employeeId: true } },
              },
            },
          },
          orderBy: { startDate: "desc" },
        });

        const columns = [
          { key: "employeeId", label: "사번" },
          { key: "name", label: "이름" },
          { key: "type", label: "휴가유형" },
          { key: "startDate", label: "시작일" },
          { key: "endDate", label: "종료일" },
          { key: "days", label: "일수" },
          { key: "status", label: "상태" },
          { key: "reason", label: "사유" },
        ];

        const data = leaves.map((l) => ({
          employeeId: l.employee.user.employeeId,
          name: l.employee.user.name,
          type: l.type,
          startDate: l.startDate.toISOString().split("T")[0],
          endDate: l.endDate.toISOString().split("T")[0],
          days: l.days,
          status: l.status,
          reason: l.reason || "",
        }));

        csvContent = generateCSV(data, columns);
        filename = `leaves_${year}.csv`;
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid export type" },
          { status: 400 }
        );
    }

    // UTF-8 BOM 추가 (한글 깨짐 방지)
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export data" },
      { status: 500 }
    );
  }
}
