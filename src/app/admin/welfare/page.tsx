"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Gift, Plus, DollarSign } from "lucide-react";

interface WelfareApplication {
    id: string;
    amount: number;
    requestDate: string;
    status: string;
    category: {
        name: string;
        type: string;
    };
    employee: {
        user: {
            name: string;
            email: string;
        };
    };
}

async function fetchApplications(): Promise<{ success: boolean; data: WelfareApplication[] }> {
    const res = await fetch("/api/welfare/applications");
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
}

export default function AdminWelfarePage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["welfare-applications"],
        queryFn: fetchApplications,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);
    };

    const statusColors: Record<string, string> = {
        PENDING: "warning",
        APPROVED: "success",
        REJECTED: "destructive",
    };

    const categoryLabels: Record<string, string> = {
        SCHOLARSHIP: "학자금",
        HEALTH_CHECKUP: "건강검진",
        CONDO: "콘도",
        WELFARE_POINT: "복지포인트",
        GIFT: "선물",
        CONGRATULATORY: "경조금",
        MEDICAL: "의료비",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">복리후생 관리</h1>
                    <p className="text-gray-400 mt-1">임직원 복리후생 신청 및 승인을 관리합니다.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    신규 혜택 등록
                </Button>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 신청</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {data?.data.length || 0}건
                                </p>
                            </div>
                            <Gift className="w-8 h-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">대기중</p>
                                <p className="text-2xl font-bold text-yellow-400 mt-1">
                                    {data?.data.filter(a => a.status === "PENDING").length || 0}건
                                </p>
                            </div>
                            <Gift className="w-8 h-8 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">승인됨</p>
                                <p className="text-2xl font-bold text-green-400 mt-1">
                                    {data?.data.filter(a => a.status === "APPROVED").length || 0}건
                                </p>
                            </div>
                            <Gift className="w-8 h-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 금액</p>
                                <p className="text-xl font-bold text-purple-400 mt-1">
                                    {formatCurrency(
                                        data?.data
                                            .filter(a => a.status === "APPROVED")
                                            .reduce((sum, a) => sum + a.amount, 0) || 0
                                    )}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-purple-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 신청 목록 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white">복리후생 신청 내역</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-400">오류가 발생했습니다.</div>
                    ) : data?.data.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">신청 내역이 없습니다.</div>
                    ) : (
                        <div className="space-y-3">
                            {data?.data.map((app) => (
                                <div
                                    key={app.id}
                                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-white font-medium">
                                                    {categoryLabels[app.category.type] || app.category.name}
                                                </h3>
                                                <Badge variant={statusColors[app.status] as any}>
                                                    {app.status === "PENDING" ? "대기중" : app.status === "APPROVED" ? "승인" : "거부"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                {app.employee.user.name} • {app.employee.user.email}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                신청일: {new Date(app.requestDate).toLocaleDateString("ko-KR")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-green-400">
                                                {formatCurrency(app.amount)}
                                            </p>
                                            {app.status === "PENDING" && (
                                                <div className="flex gap-2 mt-2">
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                        승인
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        거부
                                                    </Button>
                                                </div>
                                            )}
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
