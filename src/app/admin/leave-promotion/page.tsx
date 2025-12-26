"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Calendar, TrendingDown, Users } from "lucide-react";

interface LeavePromotionCampaign {
    id: string;
    year: number;
    name: string;
    description: string | null;
    minUnusedDays: number;
    promotionPeriodStart: string;
    promotionPeriodEnd: string;
    isActive: boolean;
    _count: {
        targets: number;
    };
}

async function fetchCampaigns(): Promise<{ success: boolean; data: LeavePromotionCampaign[] }> {
    const res = await fetch("/api/leave-promotion");
    if (!res.ok) throw new Error("Failed to fetch campaigns");
    return res.json();
}

export default function AdminLeavePromotionPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["leave-promotion"],
        queryFn: fetchCampaigns,
    });

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">연차 사용 촉진제</h1>
                    <p className="text-gray-400 mt-1">미사용 연차를 줄이기 위한 캠페인을 관리합니다.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    캠페인 생성
                </Button>
            </div>

            {/* 캠페인 목록 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-blue-400" />
                        활성 캠페인
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
                            진행중인 캠페인이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data?.data.map((campaign) => (
                                <div
                                    key={campaign.id}
                                    className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold text-white">{campaign.name}</h3>
                                                <Badge variant={campaign.isActive ? "success" : "default"}>
                                                    {campaign.isActive ? "진행중" : "종료"}
                                                </Badge>
                                            </div>
                                            {campaign.description && (
                                                <p className="text-gray-400 text-sm">{campaign.description}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-blue-400">{campaign.year}년</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <div className="bg-gray-800 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-400">대상 인원</span>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{campaign._count.targets}명</p>
                                        </div>
                                        <div className="bg-gray-800 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <TrendingDown className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-400">최소 미사용</span>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{campaign.minUnusedDays}일</p>
                                        </div>
                                        <div className="bg-gray-800 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-400">촉진 기간</span>
                                            </div>
                                            <p className="text-sm text-white">
                                                {new Date(campaign.promotionPeriodStart).toLocaleDateString("ko-KR")} ~{" "}
                                                {new Date(campaign.promotionPeriodEnd).toLocaleDateString("ko-KR")}
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
