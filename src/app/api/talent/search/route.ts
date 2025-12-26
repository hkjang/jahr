import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Talent Search API - 스킬 기반 인재 검색
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { skills, minExperience, position, department } = body;

        // 스킬 기반 검색
        const employees = await prisma.employee.findMany({
            where: {
                ...(department && { organizationId: department }),
                ...(position && { positionId: position }),
                user: { status: "ACTIVE" },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true,
                    },
                },
                position: true,
                organization: true,
                employeeSkills: {
                    include: {
                        skill: true,
                    },
                },
                educations: true,
                careers: true,
            },
        });

        // 스킬 매칭 알고리즘
        const results = employees
            .map((emp) => {
                const empSkills = emp.employeeSkills.map((es) => es.skill.name);

                // 스킬 매칭 점수 계산
                let matchScore = 0;
                if (skills && skills.length > 0) {
                    const matchedSkills = skills.filter((s: string) =>
                        empSkills.some((es) => es.toLowerCase().includes(s.toLowerCase()))
                    );
                    matchScore = (matchedSkills.length / skills.length) * 100;
                } else {
                    matchScore = 100; // 스킬 조건이 없으면 모두 매칭
                }

                // 경력 계산
                const totalExperience =
                    emp.careers.reduce((sum, c) => {
                        const start = new Date(c.startDate);
                        const end = c.endDate ? new Date(c.endDate) : new Date();
                        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
                        return sum + years;
                    }, 0) || 0;

                // 경력 요구사항 체크
                if (minExperience && totalExperience < minExperience) {
                    matchScore *= 0.5; // 경력 미달 시 점수 감소
                }

                return {
                    employee: {
                        id: emp.id,
                        name: emp.user.name,
                        email: emp.user.email,
                        profileImage: emp.user.profileImage,
                        position: emp.position.name,
                        organization: emp.organization.name,
                    },
                    skills: empSkills,
                    experience: totalExperience,
                    matchScore,
                };
            })
            .filter((r) => r.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);

        return NextResponse.json({
            success: true,
            data: {
                results,
                total: results.length,
                query: { skills, minExperience, position, department },
            },
        });
    } catch (error) {
        console.error("Error searching talent:", error);
        return NextResponse.json(
            { success: false, error: "Failed to search talent" },
            { status: 500 }
        );
    }
}
