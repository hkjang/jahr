import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 그룹웨어 전자결재 상태 동기화 webhook
export async function POST(request: NextRequest) {
    try {
        // Webhook secret validation
        const secret = request.headers.get("x-groupware-secret");
        if (secret !== process.env.GROUPWARE_WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
        }

        const body = await request.json();
        const { externalApprovalId, status, updatedAt } = body;

        // ExternalApprovalLink 찾기
        const link = await prisma.externalApprovalLink.findFirst({
            where: { externalApprovalId },
        });

        if (!link) {
            return NextResponse.json(
                { error: "Approval link not found" },
                { status: 404 }
            );
        }

        // 상태 매핑
        const statusMapping: Record<string, string> = {
            PENDING: "PENDING",
            APPROVED: "APPROVED",
            REJECTED: "REJECTED",
            CANCELLED: "CANCELLED",
        };

        const mappedStatus = statusMapping[status] || "PENDING";

        // 내부 결재 상태 업데이트
        await prisma.approval.update({
            where: { id: link.localApprovalId },
            data: {
                status: mappedStatus as any,
                completedAt: mappedStatus !== "PENDING" ? new Date(updatedAt) : null,
            },
        });

        // 동기화 링크 업데이트
        await prisma.externalApprovalLink.update({
            where: { id: link.id },
            data: {
                status: "SYNCED",
                lastSyncAt: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing groupware webhook:", error);
        return NextResponse.json(
            { success: false, error: "Failed to sync approval status" },
            { status: 500 }
        );
    }
}
