import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 복리후생 신청 API
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get("employeeId");
        const categoryId = searchParams.get("categoryId");
        const status = searchParams.get("status");

        const applications = await prisma.welfareApplication.findMany({
            where: {
                ...(employeeId && { employeeId }),
                ...(categoryId && { categoryId }),
                ...(status && { status }),
            },
            include: {
                employee: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
                category: true,
            },
            orderBy: { requestDate: "desc" },
        });

        return NextResponse.json({ success: true, data: applications });
    } catch (error) {
        console.error("Error fetching welfare applications:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch applications" },
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

        // 복리후생 신청
        const application = await prisma.welfareApplication.create({
            data: {
                employeeId: body.employeeId,
                categoryId: body.categoryId,
                amount: body.amount,
                details: body.details,
                attachments: body.attachments,
            },
            include: {
                category: true,
            },
        });

        // 그룹웨어 전자결재 연동 (선택사항)
        if (body.createApproval) {
            // TODO: 그룹웨어 API 호출하여 결재 생성
            // const approvalId = await createGroupwareApproval({ ... });
            // await prisma.welfareApplication.update({
            //   where: { id: application.id },
            //   data: { externalApprovalId: approvalId },
            // });
        }

        return NextResponse.json({ success: true, data: application }, { status: 201 });
    } catch (error) {
        console.error("Error creating welfare application:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create application" },
            { status: 500 }
        );
    }
}
