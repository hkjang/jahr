import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// KCB 출입 시스템 webhook endpoint
export async function POST(request: NextRequest) {
    try {
        // Webhook secret validation
        const secret = request.headers.get("x-kcb-secret");
        if (secret !== process.env.KCB_WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
        }

        const body = await request.json();
        const { employeeId, eventType, eventTime, location, device } = body;

        // KCB 로그 저장
        const kcbLog = await prisma.kCBLog.create({
            data: {
                employeeId,
                eventType,
                eventTime: new Date(eventTime),
                location,
                device,
                rawData: body,
            },
        });

        // 근태 기록 자동 생성/업데이트
        const date = new Date(eventTime).toISOString().split("T")[0];

        const attendance = await prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId,
                    date: new Date(date),
                },
            },
            create: {
                employeeId,
                date: new Date(date),
                checkIn: eventType === "ENTRY" ? new Date(eventTime) : undefined,
                checkOut: eventType === "EXIT" ? new Date(eventTime) : undefined,
            },
            update: {
                checkOut: eventType === "EXIT" ? new Date(eventTime) : undefined,
            },
        });

        // KCB 로그 업데이트 (processed = true)
        await prisma.kCBLog.update({
            where: { id: kcbLog.id },
            data: {
                processed: true,
                attendanceId: attendance.id,
            },
        });

        return NextResponse.json({
            success: true,
            data: { kcbLogId: kcbLog.id, attendanceId: attendance.id },
        });
    } catch (error) {
        console.error("Error processing KCB webhook:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process KCB event" },
            { status: 500 }
        );
    }
}
