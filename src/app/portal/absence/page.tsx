"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Pause, Plus, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";

interface AbsenceOfLeave {
    id: string;
    employeeId: string;
    absenceType: string;
    startDate: string;
    expectedReturnDate: string;
    actualReturnDate: string | null;
    reason: string | null;
    status: string;
    createdAt: string;
}

async function fetchAbsences(): Promise<{ success: boolean; data: AbsenceOfLeave[] }> {
    const res = await fetch("/api/absence");
    if (!res.ok) throw new Error("Failed to fetch absences");
    return res.json();
}

export default function PortalAbsencePage() {
    const { data: session } = useSession();

    const { data, isLoading, error } = useQuery({
        queryKey: ["my-absences"],
        queryFn: fetchAbsences,
    });

    const absenceTypeLabels: Record<string, string> = {
        PARENTAL: "육아휴직",
        PERSONAL: "개인사정",
        MEDICAL: "병가휴직",
        MILITARY: "군휴직",
        EDUCATIONAL: "교육휴직",
    };

    const statusLabels: Record<string, string> = {
        REQUESTED: "신청됨",
        APPROVED: "승인됨",
        ACTIVE: "휴직중",
        RETURNED: "복직완료",
        CANCELLED: "취소됨",
    };

    const statusColors: Record<string, string> = {
        REQUESTED: "warning",
        APPROVED: "info",
        ACTIVE: "default",
        RETURNED: "success",
        CANCELLED: "destructive",
    };

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">휴직 관리</h1>
                    <p className="text-gray-400 mt-1">휴직 신청 및 복직 처리를 관리합니다.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    휴직 신청
                </Button>
            </div>

            {/* 현재 상태 카드 */}
            {data?.data.find(a => a.status === "ACTIVE") && (
                <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-700/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Pause className="w-5 h-5 text-purple-400" />
                            현재 휴직 중
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const activeAbsence = data.data.find(a => a.status === "ACTIVE");
                            return activeAbsence ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-800/50 rounded-lg p-3">
                                        <p className="text-sm text-gray-400 mb-1">휴직 유형</p>
                                        <p className="text-white font-medium">
                                            {absenceTypeLabels[activeAbsence.absenceType]}
                                        </p>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-lg p-3">
                                        <p className="text-sm text-gray-400 mb-1">시작일</p>
                                        <p className="text-white font-medium">
                                            {new Date(activeAbsence.startDate).toLocaleDateString("ko-KR")}
                                        </p>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-lg p-3">
                                        <p className="text-sm text-gray-400 mb-1">예정 복직일</p>
                                        <p className="text-white font-medium">
                                            {new Date(activeAbsence.expectedReturnDate).toLocaleDateString("ko-KR")}
                                        </p>
                                    </div>
                                </div>
                            ) : null;
                        })()}
                    </CardContent>
                </Card>
            )}

            {/* 휴직 내역 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        휴직 내역
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-400">
                            데이터를 불러오는 중 오류가 발생했습니다.
                        </div>
                    ) : data?.data.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            휴직 내역이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data?.data.map((absence) => (
                                <div
                                    key={absence.id}
                                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-white font-medium">
                                                    {absenceTypeLabels[absence.absenceType]}
                                                </h3>
                                                <Badge variant={statusColors[absence.status] as any}>
                                                    {statusLabels[absence.status]}
                                                </Badge>
                                            </div>
                                            {absence.reason && (
                                                <p className="text-sm text-gray-400">{absence.reason}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="bg-gray-800 rounded-lg p-3">
                                            <p className="text-xs text-gray-400 mb-1">시작일</p>
                                            <p className="text-sm text-white">
                                                {new Date(absence.startDate).toLocaleDateString("ko-KR")}
                                            </p>
                                        </div>
                                        <div className="bg-gray-800 rounded-lg p-3">
                                            <p className="text-xs text-gray-400 mb-1">예정 복직일</p>
                                            <p className="text-sm text-white">
                                                {new Date(absence.expectedReturnDate).toLocaleDateString("ko-KR")}
                                            </p>
                                        </div>
                                        {absence.actualReturnDate && (
                                            <div className="bg-gray-800 rounded-lg p-3">
                                                <p className="text-xs text-gray-400 mb-1">실제 복직일</p>
                                                <p className="text-sm text-white">
                                                    {new Date(absence.actualReturnDate).toLocaleDateString("ko-KR")}
                                                </p>
                                            </div>
                                        )}
                                        <div className="bg-gray-800 rounded-lg p-3">
                                            <p className="text-xs text-gray-400 mb-1">신청일</p>
                                            <p className="text-sm text-white">
                                                {new Date(absence.createdAt).toLocaleDateString("ko-KR")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
