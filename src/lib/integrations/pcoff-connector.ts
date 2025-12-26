/**
 * PC-Off 시간외 근무 관리 시스템 연동 서비스
 */

import prisma from "@/lib/prisma";

interface PCOffLog {
    employeeId: string;
    date: string;
    startTime: string;
    endTime: string;
    workMinutes: number;
    breakMinutes: number;
    location: string;
}

export class PCOffConnector {
    private apiUrl: string;
    private apiKey: string;

    constructor() {
        this.apiUrl = process.env.PCOFF_API_URL || "";
        this.apiKey = process.env.PCOFF_API_KEY || "";
    }

    /**
     * PC-Off 시스템에서 로그 동기화
     */
    async syncLogs(startDate: Date, endDate: Date): Promise<void> {
        try {
            // PC-Off API 호출 (실제 구현 시)
            const logs = await this.fetchLogsFromPCOff(startDate, endDate);

            for (const log of logs) {
                await this.processLog(log);
            }

            console.log(`✅ Synced ${logs.length} PC-Off logs`);
        } catch (error) {
            console.error("Error syncing PC-Off logs:", error);
            throw error;
        }
    }

    /**
     * PC-Off에서 로그 가져오기 (Mock)
     */
    private async fetchLogsFromPCOff(
        startDate: Date,
        endDate: Date
    ): Promise<PCOffLog[]> {
        // 실제 구현 시 PC-Off API 호출
        // const response = await fetch(`${this.apiUrl}/logs`, {
        //   headers: { Authorization: `Bearer ${this.apiKey}` },
        //   method: 'POST',
        //   body: JSON.stringify({ startDate, endDate }),
        // });
        // return response.json();

        // Mock 데이터
        return [];
    }

    /**
     * 로그 처리 및 근태 기록 업데이트
     */
    private async processLog(log: PCOffLog): Promise<void> {
        const workMinutes = log.workMinutes - log.breakMinutes;
        const standardMinutes = 8 * 60; // 8시간
        const overtimeMinutes = Math.max(0, workMinutes - standardMinutes);

        // 근태 기록 생성/업데이트
        const attendance = await prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId: log.employeeId,
                    date: new Date(log.date),
                },
            },
            create: {
                employeeId: log.employeeId,
                date: new Date(log.date),
                checkIn: new Date(`${log.date}T${log.startTime}`),
                checkOut: new Date(`${log.date}T${log.endTime}`),
                workMinutes,
                status: "PRESENT",
            },
            update: {
                checkIn: new Date(`${log.date}T${log.startTime}`),
                checkOut: new Date(`${log.date}T${log.endTime}`),
                workMinutes,
            },
        });

        // 초과근무 기록
        if (overtimeMinutes > 0) {
            await prisma.overtime.upsert({
                where: {
                    employeeId_date: {
                        employeeId: log.employeeId,
                        date: new Date(log.date),
                    },
                },
                create: {
                    employeeId: log.employeeId,
                    date: new Date(log.date),
                    overtimeType: "WEEKDAY",
                    startTime: new Date(`${log.date}T${log.startTime}`),
                    endTime: new Date(`${log.date}T${log.endTime}`),
                    totalMinutes: overtimeMinutes,
                    status: "APPROVED",
                },
                update: {
                    totalMinutes: overtimeMinutes,
                },
            });
        }

        // 법정 초과근무 한도 체크 (주 52시간)
        await this.checkOvertimeLimit(log.employeeId, new Date(log.date));
    }

    /**
     * 초과근무 한도 체크 및 경고
     */
    private async checkOvertimeLimit(
        employeeId: string,
        date: Date
    ): Promise<void> {
        // 해당 주의 월요일 찾기
        const monday = new Date(date);
        monday.setDate(date.getDate() - date.getDay() + 1);

        // 해당 주의 일요일
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        // 주간 초과근무 합계
        const weeklyOvertime = await prisma.overtime.aggregate({
            where: {
                employeeId,
                date: {
                    gte: monday,
                    lte: sunday,
                },
            },
            _sum: {
                totalMinutes: true,
            },
        });

        const totalMinutes = weeklyOvertime._sum.totalMinutes || 0;
        const weeklyLimit = 12 * 60; // 주 12시간 초과근무 한도

        if (totalMinutes > weeklyLimit) {
            // 경고 알림 생성
            await prisma.notification.create({
                data: {
                    userId: employeeId,
                    type: "ALERT",
                    title: "초과근무 한도 초과",
                    content: `주간 초과근무 시간이 법정 한도(12시간)를 초과했습니다. 현재: ${Math.floor(totalMinutes / 60)}시간 ${totalMinutes % 60}분`,
                    isRead: false,
                },
            });

            console.warn(
                `⚠️ Overtime limit exceeded for employee ${employeeId}: ${totalMinutes} minutes`
            );
        }
    }

    /**
     * 일일 동기화 작업 (Cron Job으로 실행)
     */
    async dailySync(): Promise<void> {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        await this.syncLogs(yesterday, yesterday);
    }
}

// Export singleton instance
export const pcOffConnector = new PCOffConnector();
