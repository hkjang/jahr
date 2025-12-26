"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from "@/components/ui";
import { FileText, Plus, Settings } from "lucide-react";

interface AppointmentRule {
    id: string;
    code: string;
    name: string;
    description: string | null;
    appointmentType: string;
    conditions: any;
    isActive: boolean;
}

async function fetchRules(): Promise<{ success: boolean; data: AppointmentRule[] }> {
    const res = await fetch("/api/appointments/rules");
    if (!res.ok) throw new Error("Failed to fetch rules");
    return res.json();
}

export default function AdminAppointmentRulesPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["appointment-rules"],
        queryFn: fetchRules,
    });

    const appointmentTypeLabels: Record<string, string> = {
        PROMOTION: "승진",
        TRANSFER: "전보",
        SECONDMENT: "파견",
        RETURN: "복귀",
        RETIREMENT: "퇴직",
    };

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">발령 규칙 관리</h1>
                    <p className="text-gray-400 mt-1">인사 발령의 자동화 규칙을 설정합니다.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    규칙 추가
                </Button>
            </div>

            {/* 규칙 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                    <div className="col-span-2 flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="col-span-2 text-center py-20 text-red-400">
                        데이터를 불러오는 중 오류가 발생했습니다.
                    </div>
                ) : data?.data.length === 0 ? (
                    <div className="col-span-2 text-center py-20 text-gray-400">
                        등록된 규칙이 없습니다.
                    </div>
                ) : (
                    data?.data.map((rule) => (
                        <Card
                            key={rule.id}
                            className={`${rule.isActive
                                    ? "bg-gray-800 border-blue-700/50"
                                    : "bg-gray-800/50 border-gray-700"
                                }`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-blue-400" />
                                            {rule.name}
                                        </CardTitle>
                                        <p className="text-sm text-gray-400 mt-1">{rule.code}</p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${rule.isActive
                                                ? "bg-green-500/20 text-green-300"
                                                : "bg-gray-500/20 text-gray-400"
                                            }`}
                                    >
                                        {rule.isActive ? "활성" : "비활성"}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="bg-gray-900/50 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 mb-1">발령 유형</p>
                                        <p className="text-white font-medium">
                                            {appointmentTypeLabels[rule.appointmentType]}
                                        </p>
                                    </div>

                                    {rule.description && (
                                        <div className="text-sm text-gray-400">{rule.description}</div>
                                    )}

                                    <div className="flex gap-2 pt-3 border-t border-gray-700">
                                        <Button size="sm" variant="outline" className="flex-1">
                                            규칙 편집
                                        </Button>
                                        <Button size="sm" variant="outline" className="flex-1">
                                            조건 보기
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* 규칙 생성 가이드 */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/30">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        발령 규칙 생성 가이드
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-gray-300">
                        <p>• 규칙은 JSON 형식의 조건으로 정의됩니다.</p>
                        <p>• 조건: 최소 재직기간, 직급, 평가등급 등</p>
                        <p>• 자동 승인 규칙 설정 가능</p>
                        <p>• 예외 처리 및 알림 설정 지원</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
