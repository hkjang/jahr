"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Clock, Plus } from "lucide-react";

interface WorkScheduleTemplate {
    id: string;
    code: string;
    name: string;
    scheduleType: string;
    coreHoursStart: string | null;
    coreHoursEnd: string | null;
    dailyWorkHours: number;
    weeklyWorkHours: number;
    isActive: boolean;
    _count: {
        assignments: number;
    };
}

async function fetchWorkSchedules(): Promise<{ success: boolean; data: WorkScheduleTemplate[] }> {
    const res = await fetch("/api/work-schedules");
    if (!res.ok) throw new Error("Failed to fetch work schedules");
    return res.json();
}

export default function AdminWorkSchedulesPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["work-schedules"],
        queryFn: fetchWorkSchedules,
    });

    const scheduleTypeColors: Record<string, string> = {
        STANDARD: "bg-gray-500/20 text-gray-300",
        FLEXIBLE: "bg-blue-500/20 text-blue-300",
        ELASTIC: "bg-green-500/20 text-green-300",
        COMPRESSED: "bg-purple-500/20 text-purple-300",
    };

    const scheduleTypeLabels: Record<string, string> = {
        STANDARD: "표준 근무제",
        FLEXIBLE: "유연 근무제",
        ELASTIC: "탄력 근무제",
        COMPRESSED: "집약 근무제",
    };

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">근무 제도 관리</h1>
                    <p className="text-gray-400 mt-1">유연/탄력 근무제 등 다양한 근무 형태를 관리합니다.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    근무제 추가
                </Button>
            </div>

            {/* 근무제 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        등록된 근무제가 없습니다.
                    </div>
                ) : (
                    data?.data.map((schedule) => (
                        <Card key={schedule.id} className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-blue-400" />
                                        {schedule.name}
                                    </div>
                                    <Badge variant={schedule.isActive ? "success" : "default"}>
                                        {schedule.isActive ? "활성" : "비활성"}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${scheduleTypeColors[schedule.scheduleType]}`}>
                                        {scheduleTypeLabels[schedule.scheduleType] || schedule.scheduleType}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-900/50 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 mb-1">일 근무시간</p>
                                        <p className="text-lg font-semibold text-white">{schedule.dailyWorkHours}시간</p>
                                    </div>
                                    <div className="bg-gray-900/50 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 mb-1">주 근무시간</p>
                                        <p className="text-lg font-semibold text-white">{schedule.weeklyWorkHours}시간</p>
                                    </div>
                                </div>

                                {schedule.coreHoursStart && schedule.coreHoursEnd && (
                                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                                        <p className="text-xs text-blue-400 mb-1">코어타임</p>
                                        <p className="text-white font-medium">
                                            {schedule.coreHoursStart} ~ {schedule.coreHoursEnd}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                                    <span className="text-sm text-gray-400">적용 인원</span>
                                    <Badge variant="default">{schedule._count.assignments}명</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
