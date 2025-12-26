import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 현재 로그인한 사용자의 직원 정보 조회
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const employee = await prisma.employee.findFirst({
            where: {
                user: {
                    id: session.user.id,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                organization: true,
                position: true,
                jobTitle: true,
            },
        });

        if (!employee) {
            return NextResponse.json(
                { error: "Employee not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: employee });
    } catch (error) {
        console.error("Error fetching employee profile:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch employee profile" },
            { status: 500 }
        );
    }
}
