"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";
import { Plane, Plus, Search, Calendar, DollarSign } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";

interface BusinessTrip {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    status: string;
    totalExpense: number;
    expenses: { amount: number }[];
}

async function fetchBusinessTrips(status?: string): Promise<{ success: boolean; data: BusinessTrip[] }> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const res = await fetch(`/api/business-trips?${params}`);
    if (!res.ok) throw new Error("Failed to fetch business trips");
    return res.json();
}

export default function AdminBusinessTripsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["business-trips", statusFilter],
        queryFn: () => fetchBusinessTrips(statusFilter || undefined),
    });

    const filteredData = data?.data.filter((trip) =>
        trip.title.toLowerCase().includes(search.toLowerCase()) ||
        trip.destination.toLowerCase().includes(search.toLowerCase())
    );

    const statusVariant = (status: string) => {
        switch (status) {
            case "APPROVED": return "success";
            case "PENDING": return "warning";
            case "REJECTED": return "destructive";
            default: return "default";
        }
    };

    const statusLabels: Record<string, string> = {
        PENDING: "대기중",
        APPROVED: "승인됨",
        REJECTED: "거부됨",
        CANCELLED: "취소됨",
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">출장 관리</h1>
                    <p className="text-gray-400 mt-1">출장 신청 및 경비를 관리합니다.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    출장 등록
                </Button>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 출장</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {data?.data.length || 0}
                                </p>
                            </div>
                            <Plane className="w-8 h-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">대기중</p>
                                <p className="text-2xl font-bold text-yellow-400 mt-1">
                                    {data?.data.filter(t => t.status === "PENDING").length || 0}
                                </p>
                            </div>
                            <Calendar className="w-8 h-8 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">승인됨</p>
                                <p className="text-2xl font-bold text-green-400 mt-1">
                                    {data?.data.filter(t => t.status === "APPROVED").length || 0}
                                </p>
                            </div>
                            <Calendar className="w-8 h-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 경비</p>
                                <p className="text-xl font-bold text-white mt-1">
                                    {formatCurrency(
                                        data?.data.reduce((sum, trip) => sum + Number(trip.totalExpense), 0) || 0
                                    )}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 검색 및 필터 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="출장명 또는 목적지로 검색..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leftIcon={<Search className="w-4 h-4" />}
                                className="bg-gray-900 border-gray-700 text-white"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">전체 상태</option>
                            <option value="PENDING">대기중</option>
                            <option value="APPROVED">승인됨</option>
                            <option value="REJECTED">거부됨</option>
                            <option value="CANCELLED">취소됨</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* 출장 목록 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Plane className="w-5 h-5 text-blue-400" />
                        출장 목록
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
                    ) : filteredData?.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            등록된 출장이 없습니다.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">출장명</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">목적지</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">기간</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">경비</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData?.map((trip) => (
                                        <tr
                                            key={trip.id}
                                            className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer"
                                        >
                                            <td className="py-4 px-4">
                                                <p className="text-white font-medium">{trip.title}</p>
                                            </td>
                                            <td className="py-4 px-4 text-gray-300">
                                                {trip.destination}
                                            </td>
                                            <td className="py-4 px-4 text-gray-400">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <span>{formatKoreanDate(new Date(trip.startDate))}</span>
                                                    <span>~</span>
                                                    <span>{formatKoreanDate(new Date(trip.endDate))}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {formatCurrency(Number(trip.totalExpense))}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {trip.expenses.length}개 항목
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Badge variant={statusVariant(trip.status) as any}>
                                                    {statusLabels[trip.status] || trip.status}
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
