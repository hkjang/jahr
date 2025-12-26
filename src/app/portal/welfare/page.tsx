"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Gift, Plus } from "lucide-react";
import { useSession } from "next-auth/react";

export default function PortalWelfarePage() {
    const { data: session } = useSession();

    const categories = [
        {
            type: "SCHOLARSHIP",
            name: "학자금 지원",
            description: "본인 및 자녀 학자금 지원",
            maxAmount: 5000000,
            icon: "📚",
        },
        {
            type: "HEALTH_CHECKUP",
            name: "건강검진",
            description: "본인 및 가족 건강검진 지원",
            maxAmount: 500000,
            icon: "🏥",
        },
        {
            type: "CONDO",
            name: "콘도 이용",
            description: "회사 제휴 콘도 이용권",
            maxAmount: 300000,
            icon: "🏖️",
        },
        {
            type: "WELFARE_POINT",
            name: "복지포인트",
            description: "연간 복지포인트 사용",
            maxAmount: 1000000,
            icon: "💳",
        },
        {
            type: "CONGRATULATORY",
            name: "경조금",
            description: "경조사 지원금",
            maxAmount: 200000,
            icon: "🎉",
        },
        {
            type: "MEDICAL",
            name: "의료비 지원",
            description: "본인 및 가족 의료비 지원",
            maxAmount: 3000000,
            icon: "💊",
        },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">복리후생 신청</h1>
                <p className="text-gray-400 mt-1">
                    다양한 복리후생 혜택을 신청하고 관리합니다.
                </p>
            </div>

            {/* 사용 현황 */}
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/30">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 mb-2">연간 복리후생 사용액</p>
                            <p className="text-4xl font-bold text-green-400">
                                {formatCurrency(2850000)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-sm">남은 한도</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                {formatCurrency(7150000)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                style={{ width: "28.5%" }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">총 한도: 10,000,000원</p>
                    </div>
                </CardContent>
            </Card>

            {/* 복리후생 카테고리 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <Card
                        key={category.type}
                        className="bg-gray-800 border-gray-700 hover:border-blue-600 transition-colors cursor-pointer"
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white flex items-center gap-2">
                                <span className="text-2xl">{category.icon}</span>
                                {category.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-400 mb-4">{category.description}</p>

                            <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                                <p className="text-xs text-gray-400 mb-1">최대 지원 금액</p>
                                <p className="text-lg font-bold text-green-400">
                                    {formatCurrency(category.maxAmount)}
                                </p>
                            </div>

                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                신청하기
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 최근 신청 내역 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Gift className="w-5 h-5 text-blue-400" />
                        최근 신청 내역
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            {
                                category: "학자금 지원",
                                amount: 2000000,
                                date: "2024-09-15",
                                status: "승인",
                            },
                            {
                                category: "건강검진",
                                amount: 300000,
                                date: "2024-08-01",
                                status: "승인",
                            },
                            {
                                category: "경조금",
                                amount: 200000,
                                date: "2024-07-20",
                                status: "승인",
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-white font-medium">{item.category}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(item.date).toLocaleDateString("ko-KR")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-green-400 font-medium">
                                        {formatCurrency(item.amount)}
                                    </p>
                                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300 mt-1 inline-block">
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
