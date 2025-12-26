import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/jahr?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...");

    // ... (기존 seed 코드는 그대로 유지)
    // 아래는 새로운 HR 기능을 위한 시드 데이터 추가

    console.log("📋 Seeding HR Extension Features...");

    // R&R 시드 데이터
    const rnrs = [
        { code: "RNR001", name: "프로젝트 관리", description: "프로젝트 전반적인 관리 및 운영", category: "MANAGEMENT", level: "MANAGER" },
        { code: "RNR002", name: "시스템 설계", description: "시스템 아키텍처 설계 및 기술 검토", category: "TECHNICAL", level: "ALL" },
        { code: "RNR003", name: "품질 관리", description: "코드 리뷰 및 품질 보증", category: "TECHNICAL", level: "STAFF" },
        { code: "RNR004", name: "인사 업무", description: "직원 채용 및 평가 관리", category: "ADMINISTRATIVE", level: "EXECUTIVE" },
    ];

    for (const rnr of rnrs) {
        await prisma.rnR.upsert({
            where: { code: rnr.code },
            update: {},
            create: rnr,
        });
    }
    console.log("✅ R&R created");

    // 근무제도 템플릿
    const workSchedules = [
        {
            code: "WS001",
            name: "표준 근무제",
            scheduleType: "STANDARD",
            dailyWorkHours: 8,
            weeklyWorkHours: 40,
        },
        {
            code: "WS002",
            name: "유연 근무제",
            scheduleType: "FLEXIBLE",
            coreHoursStart: "10:00",
            coreHoursEnd: "16:00",
            dailyWorkHours: 8,
            weeklyWorkHours: 40,
        },
        {
            code: "WS003",
            name: "탄력 근무제",
            scheduleType: "ELASTIC",
            dailyWorkHours: 8,
            weeklyWorkHours: 40,
        },
    ];

    for (const schedule of workSchedules) {
        await prisma.workScheduleTemplate.upsert({
            where: { code: schedule.code },
            update: {},
            create: schedule,
        });
    }
    console.log("✅ Work schedules created");

    // 연차 촉진 캠페인 (2024년)
    const campaign = await prisma.leavePromotionCampaign.upsert({
        where: { id: "campaign-2024" },
        update: {},
        create: {
            id: "campaign-2024",
            year: 2024,
            name: "2024 연차 사용 촉진 캠페인",
            description: "미사용 연차를 줄이고 워라밸을 향상시키기 위한 캠페인",
            targetOrganizations: [],
            minUnusedDays: 5,
            promotionPeriodStart: new Date("2024-10-01"),
            promotionPeriodEnd: new Date("2024-12-31"),
        },
    });
    console.log("✅ Leave promotion campaign created");

    // IDP 샘플 (테스트 직원용)
    const testEmployee = await prisma.employee.findFirst({
        where: { user: { email: "test@jahr.com" } },
    });

    if (testEmployee) {
        const idp = await prisma.iDP.upsert({
            where: { employeeId_year: { employeeId: testEmployee.id, year: 2024 } },
            update: {},
            create: {
                employeeId: testEmployee.id,
                year: 2024,
                status: "IN_PROGRESS",
                overallGoal: "풀스택 개발자로 성장하기 위한 기술 역량 강화",
            },
        });

        // IDP 목표 추가
        const goals = [
            {
                idpId: idp.id,
                category: "SKILL_DEVELOPMENT",
                title: "React 고급 패턴 학습",
                description: "React 성능 최적화 및 고급 패턴 마스터",
                targetDate: new Date("2024-06-30"),
                status: "COMPLETED",
                sortOrder: 1,
            },
            {
                idpId: idp.id,
                category: "CERTIFICATION",
                title: "AWS Certified Solutions Architect 취득",
                description: "AWS 아키텍처 설계 역량 인증",
                targetDate: new Date("2024-09-30"),
                status: "IN_PROGRESS",
                sortOrder: 2,
            },
            {
                idpId: idp.id,
                category: "PROJECT_EXPERIENCE",
                title: "마이크로서비스 프로젝트 참여",
                description: "실제 프로덕션 마이크로서비스 설계 및 구현",
                targetDate: new Date("2024-12-31"),
                status: "NOT_STARTED",
                sortOrder: 3,
            },
        ];

        for (const goal of goals) {
            const createdGoal = await prisma.iDPGoal.upsert({
                where: { id: `goal-${goal.sortOrder}` },
                update: {},
                create: { id: `goal-${goal.sortOrder}`, ...goal },
            });

            // 진행률 추가
            if (goal.status === "COMPLETED") {
                await prisma.iDPProgress.create({
                    data: {
                        goalId: createdGoal.id,
                        progressPercent: 100,
                        notes: "목표 달성 완료",
                        recordedBy: testEmployee.userId,
                    },
                });
            } else if (goal.status === "IN_PROGRESS") {
                await prisma.iDPProgress.create({
                    data: {
                        goalId: createdGoal.id,
                        progressPercent: 60,
                        notes: "학습 진행중, 실습 프로젝트 50% 완료",
                        recordedBy: testEmployee.userId,
                    },
                });
            }
        }
        console.log("✅ IDP and goals created for test employee");

        // 출장 샘플 데이터
        const trip = await prisma.businessTrip.create({
            data: {
                employeeId: testEmployee.id,
                title: "서울 본사 미팅",
                purpose: "2024년 4분기 전략 회의 참석",
                destination: "서울",
                startDate: new Date("2024-11-15"),
                endDate: new Date("2024-11-16"),
                status: "APPROVED",
                totalExpense: 450000,
            },
        });

        // 출장 경비 항목
        await prisma.tripExpense.createMany({
            data: [
                {
                    tripId: trip.id,
                    category: "TRANSPORTATION",
                    amount: 150000,
                    description: "KTX 왕복 교통비",
                    expenseDate: new Date("2024-11-15"),
                },
                {
                    tripId: trip.id,
                    category: "ACCOMMODATION",
                    amount: 200000,
                    description: "호텔 숙박비 (1박)",
                    expenseDate: new Date("2024-11-15"),
                },
                {
                    tripId: trip.id,
                    category: "MEALS",
                    amount: 100000,
                    description: "식비",
                    expenseDate: new Date("2024-11-15"),
                },
            ],
        });
        console.log("✅ Business trip created with expenses");
    }

    console.log("🎉 HR Extension seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
