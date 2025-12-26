"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { FileText, Plus, Search, Upload } from "lucide-react";
import { useSession } from "next-auth/react";

interface TrainingRefund {
    id: string;
    employeeId: string;
    externalCourse: string | null;
    requestedAmount: number;
    approvedAmount: number | null;
    status: string;
    completionCertUrl: string | null;
    createdAt: string;
}

async function fetchRefunds(): Promise<{ success: boolean; data: TrainingRefund[] }> {
    const res = await fetch("/api/training/refunds");
    if (!res.ok) throw new Error("Failed to fetch refunds");
    return res.json();
}

export default function PortalTrainingRefundPage() {
    const { data: session } = useSession();
    const [search, setSearch] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["training-refunds"],
        queryFn: fetchRefunds,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
        }).format(amount);
    };

    const statusColors: Record<string, string> = {
        PENDING: "warning",
        APPROVED: "success",
        REJECTED: "destructive",
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
                    <h1 className="text-2xl font-bold text-white">교육비 환급 신청</h1>
                    <p className="text-gray-400 mt-1">외부 교육비 환급을 신청하고 관리합니다.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    환급 신청
                </Button>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 신청</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {data?.data.length || 0}건
                                </p>
                            </div>
                            <FileText className="w-8 h-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">검토 대기</p>
                                <p className="text-2xl font-bold text-yellow-400 mt-1">
                                    {data?.data.filter(r => r.status === "PENDING").length || 0}건
                                </p>
                            </div>
                            <FileText className="w-8 h-8 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 승인 금액</p>
                                <p className="text-xl font-bold text-green-400 mt-1">
                                    {formatCurrency(
                                        data?.data
                                            .filter(r => r.status === "APPROVED")
                                            .reduce((sum, r) => sum + Number(r.approvedAmount || 0), 0) || 0
                                    )}
                                </p>
                            </div>
                            <FileText className="w-8 h-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 신청 내역 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        신청 내역
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
                            신청 내역이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data?.data.map((refund) => (
                                <div
                                    key={refund.id}
                                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-white font-medium">{refund.externalCourse}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                신청일: {new Date(refund.createdAt).toLocaleDateString("ko-KR")}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm ${refund.status === "PENDING" ? "bg-yellow-500/20 text-yellow-300" :
                                                refund.status === "APPROVED" ? "bg-green-500/20 text-green-300" :
                                                    "bg-red-500/20 text-red-300"
                                            }`}>
                                            {statusLabels[refund.status]}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-800 rounded-lg p-3">
                                            <p className="text-xs text-gray-400 mb-1">신청 금액</p>
                                            <p className="text-white font-medium">
                                                {formatCurrency(Number(refund.requestedAmount))}
                                            </p>
                                        </div>
                                        <div className="bg-gray-800 rounded-lg p-3">
                                            <p className="text-xs text-gray-400 mb-1">승인 금액</p>
                                            <p className="text-white font-medium">
                                                {refund.approvedAmount ? formatCurrency(Number(refund.approvedAmount)) : "-"}
                                            </p>
                                        </div>
                                    </div>

                                    {refund.completionCertUrl && (
                                        <div className="mt-3 pt-3 border-t border-gray-700">
                                            <a
                                                href={refund.completionCertUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                            >
                                                <Upload className="w-4 h-4" />
                                                이수증 확인
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
