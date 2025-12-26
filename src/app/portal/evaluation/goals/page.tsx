"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";
import { Target, Plus, CheckCircle, XCircle, Clock } from "lucide-react";

interface Goal {
    id: string;
    goalTitle: string;
    goalDescription: string;
    weight: number;
    status: string;
    employee: {
        user: {
            name: string;
        };
    };
    approvals: Array<{
        level: number;
        status: string;
        comments?: string;
    }>;
}

async function fetchGoals(): Promise<{ success: boolean; data: Goal[] }> {
    const res = await fetch("/api/evaluation/goals");
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
}

export default function PortalEvaluationGoalsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["evaluation-goals"],
        queryFn: fetchGoals,
    });

    const statusColors: Record<string, string> = {
        DRAFT: "secondary",
        SUBMITTED: "warning",
        LEVEL1_APPROVED: "info",
        FINAL_APPROVED: "success",
        REJECTED: "destructive",
    };

    const statusLabels: Record<string, string> = {
        DRAFT: "작성중",
        SUBMITTED: "제출",
        LEVEL1_APPROVED: "1차 승인",
        FINAL_APPROVED: "최종 승인",
        REJECTED: "반려",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">목표 수립</h1>
                    <p className="text-gray-400 mt-1">연간 업무 목표를 설정하고 관리합니다.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    목표 추가
                </Button>
            </div>

            {/* 진행 현황 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-400">총 목표</p>
                            <p className="text-3xl font-bold text-white mt-2">
                                {data?.data.length || 0}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-400">작성중</p>
                            <p className="text-3xl font-bold text-yellow-400 mt-2">
                                {data?.data.filter(g => g.status === "DRAFT").length || 0}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-400">승인 대기</p>
                            <p className="text-3xl font-bold text-orange-400 mt-2">
                                {data?.data.filter(g => g.status === "SUBMITTED" || g.status === "LEVEL1_APPROVED").length || 0}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-400">최종 승인</p>
                            <p className="text-3xl font-bold text-green-400 mt-2">
                                {data?.data.filter(g => g.status === "FINAL_APPROVED").length || 0}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 목표 목록 */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : data?.data.length === 0 ? (
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="py-20 text-center text-gray-400">
                            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>등록된 목표가 없습니다.</p>
                            <p className="text-sm mt-2">새로운 목표를 추가하세요.</p>
                        </CardContent>
                    </Card>
                ) : (
                    data?.data.map((goal) => (
                        <Card key={goal.id} className="bg-gray-800 border-gray-700">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Target className="w-5 h-5 text-blue-400" />
                                            {goal.goalTitle}
                                        </CardTitle>
                                        <p className="text-sm text-gray-400 mt-2">
                                            {goal.goalDescription.length > 100
                                                ? goal.goalDescription.substring(0, 100) + "..."
                                                : goal.goalDescription}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant={statusColors[goal.status] as any}>
                                            {statusLabels[goal.status]}
                                        </Badge>
                                        <span className="text-sm text-gray-400">가중치: {goal.weight}%</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* 승인 단계 */}
                                {goal.approvals.length > 0 && (
                                    <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                                        <p className="text-xs text-gray-400 mb-2">승인 진행 상황</p>
                                        <div className="flex items-center gap-3">
                                            {[1, 2].map((level) => {
                                                const approval = goal.approvals.find(a => a.level === level);
                                                return (
                                                    <div key={level} className="flex items-center gap-2">
                                                        {approval?.status === "APPROVED" ? (
                                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                                        ) : approval?.status === "REJECTED" ? (
                                                            <XCircle className="w-5 h-5 text-red-400" />
                                                        ) : (
                                                            <Clock className="w-5 h-5 text-gray-500" />
                                                        )}
                                                        <span className="text-sm text-gray-300">{level}차</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                        상세보기
                                    </Button>
                                    {goal.status === "DRAFT" && (
                                        <>
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                수정
                                            </Button>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                제출
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
