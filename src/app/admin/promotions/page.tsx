"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { TrendingUp, Award, AlertCircle } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";

interface Promotion {
    id: string;
    employeeId: string;
    fromPositionId: string;
    toPositionId: string;
    effectiveDate: string;
    reason: string | null;
    performanceScore: number | null;
    status: string;
}

async function fetchPromotions(status?: string): Promise<{ success: boolean; data: Promotion[] }> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const res = await fetch(`/api/promotions?${params}`);
    if (!res.ok) throw new Error("Failed to fetch promotions");
    return res.json();
}

export default function AdminPromotionsPage() {
    const [statusFilter, setStatusFilter] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["promotions", statusFilter],
        queryFn: () => fetchPromotions(statusFilter || undefined),
    });

    const statusVariant = (status: string) => {
        switch (status) {
            case "APPROVED": return "success";
            case "PENDING": return "warning";
            case "REJECTED": return "destructive";
            default: return "default";
        }
    };

    const statusLabels: Record<string, string> = {
        PENDING: "검토중",
        APPROVED: "승인됨",
        REJECTED: "거부됨",
    };

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">승격 관리</h1>
                    <p className="text-gray-400 mt-1">직원 승격 현황을 관리합니다.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    승격 제안
                </Button>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">전체 승격</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {data?.data.length || 0}
                                </p>
                            </div>
                            <Award className="w-8 h-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">검토 대기</p>
                                <p className="text-2xl font-bold text-yellow-400 mt-1">
                                    {data?.data.filter(p => p.status === "PENDING").length || 0}
                                </p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">올해 승인</p>
                                <p className="text-2xl font-bold text-green-400 mt-1">
                                    {data?.data.filter(p =>
                                        p.status === "APPROVED" &&
                                        new Date(p.effectiveDate).getFullYear() === new Date().getFullYear()
                                    ).length || 0}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 필터 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">전체 상태</option>
                        <option value="PENDING">검토중</option>
                        <option value="APPROVED">승인됨</option>
                        <option value="REJECTED">거부됨</option>
                    </select>
                </CardContent>
            </Card>

            {/* 승격 목록 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-400" />
                        승격 목록
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
                            등록된 승격이 없습니다.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">직원 ID</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">변경 내용</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">발령일</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">성과 점수</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.data.map((promotion) => (
                                        <tr
                                            key={promotion.id}
                                            className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer"
                                        >
                                            <td className="py-4 px-4">
                                                <code className="text-blue-400 font-mono text-sm">
                                                    {promotion.employeeId}
                                                </code>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400">{promotion.fromPositionId}</span>
                                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                                    <span className="text-white font-medium">{promotion.toPositionId}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-400">
                                                {formatKoreanDate(new Date(promotion.effectiveDate))}
                                            </td>
                                            <td className="py-4 px-4">
                                                {promotion.performanceScore ? (
                                                    <span className="text-white font-medium">
                                                        {promotion.performanceScore.toFixed(1)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <Badge variant={statusVariant(promotion.status) as any}>
                                                    {statusLabels[promotion.status] || promotion.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
