import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 목표 승인 API
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { level, approverId, status, comments } = body;

        // 승인 기록 생성 또는 업데이트
        const approval = await prisma.goalApproval.upsert({
            where: {
                // Composite unique key would be ideal
                id: body.approvalId || "new",
            },
            create: {
                goalId: id,
                level,
                approverId,
                status,
                comments,
                approvedAt: status === "APPROVED" ? new Date() : null,
            },
            update: {
                status,
                comments,
                approvedAt: status === "APPROVED" ? new Date() : null,
            },
        });

        // 목표 상태 업데이트
        let goalStatus = "SUBMITTED";
        if (status === "APPROVED") {
            if (level === 1) {
                goalStatus = "LEVEL1_APPROVED";
            } else if (level === 2) {
                goalStatus = "FINAL_APPROVED";
            }
        } else if (status === "REJECTED") {
            goalStatus = "REJECTED";
        }

        const goal = await prisma.goalSetting.update({
            where: { id },
            data: { status: goalStatus },
            include: {
                approvals: {
                    orderBy: { level: "asc" },
                },
            },
        });

        return NextResponse.json({ success: true, data: { goal, approval } });
    } catch (error) {
        console.error("Error approving goal:", error);
        return NextResponse.json(
            { success: false, error: "Failed to approve goal" },
            { status: 500 }
        );
    }
}
