import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 종합평가 생성 및 등급 배분 API
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            evaluationId,
            performanceScore,
            competencyScore,
            multiRaterScore,
            weightRatio, // {performance: 60, competency: 30, multiRater: 10}
        } = body;

        // 가중 평균 계산
        const totalScore =
            (performanceScore * (weightRatio.performance / 100)) +
            (competencyScore * (weightRatio.competency / 100)) +
            ((multiRaterScore || 0) * ((weightRatio.multiRater || 0) / 100));

        // 등급 계산 (기본 로직 - 실제로는 강제 배분 적용)
        let calculatedGrade: string;
        if (totalScore >= 4.5) calculatedGrade = "S";
        else if (totalScore >= 3.5) calculatedGrade = "A";
        else if (totalScore >= 2.5) calculatedGrade = "B";
        else if (totalScore >= 1.5) calculatedGrade = "C";
        else calculatedGrade = "D";

        const finalEval = await prisma.finalEvaluation.create({
            data: {
                evaluationId,
                performanceScore,
                competencyScore,
                multiRaterScore,
                totalScore,
                calculatedGrade,
                finalGrade: calculatedGrade, // 초기에는 계산된 등급과 동일
            },
            include: {
                evaluation: {
                    include: {
                        employee: {
                            include: {
                                user: { select: { name: true } },
                                position: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({ success: true, data: finalEval }, { status: 201 });
    } catch (error) {
        console.error("Error creating final evaluation:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create final evaluation" },
            { status: 500 }
        );
    }
}

/**
 * 종합평가 조회
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const periodId = searchParams.get("periodId");

        const finalEvals = await prisma.finalEvaluation.findMany({
            where: periodId
                ? {
                    evaluation: {
                        periodId,
                    },
                }
                : undefined,
            include: {
                evaluation: {
                    include: {
                        employee: {
                            include: {
                                user: { select: { name: true, employeeId: true } },
                                position: true,
                                organization: true,
                            },
                        },
                    },
                },
                appeals: true,
            },
            orderBy: { totalScore: "desc" },
        });

        // 등급별 통계
        const gradeStats = {
            S: finalEvals.filter((e) => e.finalGrade === "S").length,
            A: finalEvals.filter((e) => e.finalGrade === "A").length,
            B: finalEvals.filter((e) => e.finalGrade === "B").length,
            C: finalEvals.filter((e) => e.finalGrade === "C").length,
            D: finalEvals.filter((e) => e.finalGrade === "D").length,
        };

        return NextResponse.json({
            success: true,
            data: {
                evaluations: finalEvals,
                gradeStats,
                total: finalEvals.length,
            },
        });
    } catch (error) {
        console.error("Error fetching final evaluations:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch final evaluations" },
            { status: 500 }
        );
    }
}
