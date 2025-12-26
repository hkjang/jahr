"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";

interface LaborCostActual {
    id: string;
    yearMonth: string;
    organizationId: string | null;
    totalActual: number;
    variance: number;
    variancePercent: number;
}

async function fetchLaborCostActuals(): Promise<{ success: boolean; data: LaborCostActual[] }> {
    const res = await fetch("/api/labor-cost/actuals");
    if (!res.ok) throw new Error("Failed to fetch labor cost actuals");
    return res.json();
}

export default function AdminLaborCostActualsPage() {
    const [selectedMonth, setSelectedMonth] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["labor-cost-actuals"],
        queryFn: fetchLaborCostActuals,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatYearMonth = (ym: string) => {
        const year = ym.substring(0, 4);
        const month = ym.substring(4, 6);
        return `${year}년 ${month}월`;
    };

    const totalVariance = data?.data.reduce((sum, item) => sum + Number(item.variance), 0) || 0;
    const avgVariancePercent = data?.data.length
        ? data.data.reduce((sum, item) => sum + item.variancePercent, 0) / data.data.length
        : 0;

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">인건비 실적 관리</h1>
                    <p className="text-gray-400 mt-1">예측 대비 실제 인건비 성과를 분석합니다.</p>
                </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 실적 기록</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {data?.data.length || 0}건
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 차이액</p>
                                <p className={`text-xl font-bold mt-1 ${totalVariance >= 0 ? "text-red-400" : "text-green-400"}`}>
                                    {formatCurrency(totalVariance)}
                                </p>
                            </div>
                            {totalVariance >= 0 ? (
                                <TrendingUp className="w-8 h-8 text-red-400" />
                            ) : (
                                <TrendingDown className="w-8 h-8 text-green-400" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">평균 차이율</p>
                                <p className={`text-2xl font-bold mt-1 ${avgVariancePercent >= 0 ? "text-red-400" : "text-green-400"}`}>
                                    {avgVariancePercent.toFixed(1)}%
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
                                <p className="text-sm text-gray-400">초과 항목</p>
                                <p className="text-2xl font-bold text-red-400 mt-1">
                                    {data?.data.filter(d => d.variance > 0).length || 0}건
                                </p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 실적 목록 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-blue-400" />
                        실적 내역
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
                            등록된 실적이 없습니다.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">기간</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">조직</th>
                                        <th className="text-right py-3 px-4 text-gray-400 font-medium">실적</th>
                                        <th className="text-right py-3 px-4 text-gray-400 font-medium">차이액</th>
                                        <th className="text-right py-3 px-4 text-gray-400 font-medium">차이율</th>
                                        <th className="text-center py-3 px-4 text-gray-400 font-medium">상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.data.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <p className="text-white font-medium">{formatYearMonth(item.yearMonth)}</p>
                                            </td>
                                            <td className="py-4 px-4 text-gray-300">
                                                {item.organizationId || "전체"}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <p className="text-white font-medium">
                                                    {formatCurrency(Number(item.totalActual))}
                                                </p>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <p className={`font-medium ${Number(item.variance) >= 0 ? "text-red-400" : "text-green-400"}`}>
                                                    {formatCurrency(Number(item.variance))}
                                                </p>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <p className={`font-medium ${item.variancePercent >= 0 ? "text-red-400" : "text-green-400"}`}>
                                                    {item.variancePercent >= 0 ? "+" : ""}
                                                    {item.variancePercent.toFixed(1)}%
                                                </p>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                {Math.abs(item.variancePercent) > 10 ? (
                                                    <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300">
                                                        주의
                                                    </span>
                                                ) : Math.abs(item.variancePercent) > 5 ? (
                                                    <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-300">
                                                        경고
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300">
                                                        정상
                                                    </span>
                                                )}
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
