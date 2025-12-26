"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Target, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface IDPGoal {
    id: string;
    category: string;
    title: string;
    targetDate: string;
    status: string;
    progress: { progressPercent: number }[];
}

interface IDP {
    id: string;
    year: number;
    status: string;
    overallGoal: string | null;
    goals: IDPGoal[];
}

async function fetchMyIDP(employeeId: string): Promise<{ success: boolean; data: IDP[] }> {
    const res = await fetch(`/api/idp?employeeId=${employeeId}`);
    if (!res.ok) throw new Error("Failed to fetch IDP");
    return res.json();
}

export default function PortalIDPPage() {
    const { data: session } = useSession();
    const currentYear = new Date().getFullYear();

    const { data, isLoading, error } = useQuery({
        queryKey: ["my-idp", session?.user?.employeeId],
        queryFn: () => fetchMyIDP(session?.user?.employeeId || ""),
        enabled: !!session?.user?.employeeId,
    });

    const currentIDP = data?.data.find((idp) => idp.year === currentYear);

    const statusColors: Record<string, string> = {
        DRAFT: "default",
        SUBMITTED: "warning",
        APPROVED: "success",
        IN_PROGRESS: "info",
        COMPLETED: "success",
    };

    const statusLabels: Record<string, string> = {
        DRAFT: "작성중",
        SUBMITTED: "제출됨",
        APPROVED: "승인됨",
        IN_PROGRESS: "진행중",
        COMPLETED: "완료",
    };

    const goalCategories: Record<string, string> = {
        SKILL_DEVELOPMENT: "기술 개발",
        CERTIFICATION: "자격증 취득",
        PROJECT_EXPERIENCE: "프로젝트 경험",
        LEADERSHIP: "리더십",
    };

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">개인 개발 계획 (IDP)</h1>
                    <p className="text-gray-400 mt-1">나의 성장 목표를 설정하고 관리합니다.</p>
                </div>
                {!currentIDP && (
                    <Link href="/portal/idp/create">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            {currentYear}년 IDP 작성
                        </Button>
                    </Link>
                )}
            </div>

            {/* 현재 연도 IDP */}
            {currentIDP ? (
                <>
                    {/* IDP 요약 */}
                    <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-700/50">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    {currentYear}년 개발 계획
                                </div>
                                <Badge variant={statusColors[currentIDP.status] as any}>
                                    {statusLabels[currentIDP.status]}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {currentIDP.overallGoal && (
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <p className="text-sm text-gray-400 mb-1">전체 목표</p>
                                    <p className="text-white">{currentIDP.overallGoal}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 목표 목록 */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-400" />
                                세부 목표
                                <span className="text-sm font-normal text-gray-400 ml-2">
                                    ({currentIDP.goals.length}개)
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {currentIDP.goals.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    아직 목표가 없습니다. 목표를 추가해주세요.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {currentIDP.goals.map((goal) => {
                                        const latestProgress = goal.progress[0]?.progressPercent || 0;
                                        return (
                                            <div
                                                key={goal.id}
                                                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                                                                {goalCategories[goal.category]}
                                                            </span>
                                                            <Badge variant={goal.status === "COMPLETED" ? "success" : "default"}>
                                                                {goal.status === "NOT_STARTED" ? "미시작" : goal.status === "IN_PROGRESS" ? "진행중" : "완료"}
                                                            </Badge>
                                                        </div>
                                                        <h3 className="text-white font-medium">{goal.title}</h3>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            목표일: {new Date(goal.targetDate).toLocaleDateString("ko-KR")}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* 진행률 바 */}
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span className="text-gray-400">진행률</span>
                                                        <span className="text-blue-400 font-medium">{latestProgress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${latestProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="py-20">
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-400">
                                데이터를 불러오는 중 오류가 발생했습니다.
                            </div>
                        ) : (
                            <div className="text-center">
                                <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-white mb-2">
                                    {currentYear}년 IDP가 없습니다
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    나의 성장을 위한 개발 계획을 작성해보세요.
                                </p>
                                <Link href="/portal/idp/create">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="w-4 h-4 mr-2" />
                                        IDP 작성하기
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* 이전 연도 IDP */}
            {data?.data && data.data.length > 1 && (
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">이전 IDP</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.data
                                .filter((idp) => idp.year < currentYear)
                                .sort((a, b) => b.year - a.year)
                                .map((idp) => (
                                    <div
                                        key={idp.id}
                                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
                                    >
                                        <div>
                                            <p className="text-white font-medium">{idp.year}년</p>
                                            <p className="text-sm text-gray-500">{idp.goals.length}개 목표</p>
                                        </div>
                                        <Badge variant={statusColors[idp.status] as any}>
                                            {statusLabels[idp.status]}
                                        </Badge>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
