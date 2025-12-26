"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Shield, AlertCircle, Calendar } from "lucide-react";

export default function AdminInsurancePrivatePage() {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const insuranceTypes: Record<string, string> = {
        PRIVACY_PROTECTION: "개인정보보호보험",
        DIRECTORS_LIABILITY: "임원배상책임보험",
        GROUP_ACCIDENT: "단체상해보험",
        FIDELITY_GUARANTEE: "신원보증보험",
    };

    const insurances = [
        {
            type: "PRIVACY_PROTECTION",
            company: "삼성화재",
            policyNumber: "PI-2024-001",
            coverage: 500000000,
            premium: 3500000,
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            status: "만료 임박",
        },
        {
            type: "DIRECTORS_LIABILITY",
            company: "현대해상",
            policyNumber: "DL-2024-002",
            coverage: 1000000000,
            premium: 8000000,
            startDate: "2024-03-01",
            endDate: "2025-02-28",
            status: "정상",
        },
        {
            type: "GROUP_ACCIDENT",
            company: "DB손해보험",
            policyNumber: "GA-2024-003",
            coverage: 300000000,
            premium: 12000000,
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            status: "만료 임박",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">사보험 관리</h1>
                    <p className="text-gray-400 mt-1">
                        회사 가입 사보험을 관리하고 모니터링합니다.
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    보험 추가
                </Button>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 보험 건수</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {insurances.length}건
                                </p>
                            </div>
                            <Shield className="w-10 h-10 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">연간 보험료</p>
                                <p className="text-xl font-bold text-green-400 mt-1">
                                    {formatCurrency(
                                        insurances.reduce((sum, ins) => sum + ins.premium, 0)
                                    )}
                                </p>
                            </div>
                            <Calendar className="w-10 h-10 text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">만료 임박</p>
                                <p className="text-3xl font-bold text-red-400 mt-1">
                                    {insurances.filter(ins => ins.status === "만료 임박").length}건
                                </p>
                            </div>
                            <AlertCircle className="w-10 h-10 text-red-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 보험 목록 */}
            <div className="grid grid-cols-1 gap-4">
                {insurances.map((insurance, idx) => (
                    <Card
                        key={idx}
                        className={`${insurance.status === "만료 임박"
                                ? "bg-red-900/20 border-red-700/50"
                                : "bg-gray-800 border-gray-700"
                            }`}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-blue-400" />
                                        {insuranceTypes[insurance.type]}
                                    </CardTitle>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {insurance.company} • {insurance.policyNumber}
                                    </p>
                                </div>
                                {insurance.status === "만료 임박" && (
                                    <span className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-300">
                                        ⚠️ 만료 임박
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-900/50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400 mb-1">보장금액</p>
                                    <p className="text-lg font-bold text-green-400">
                                        {formatCurrency(insurance.coverage)}
                                    </p>
                                </div>

                                <div className="bg-gray-900/50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400 mb-1">연간 보험료</p>
                                    <p className="text-lg font-bold text-white">
                                        {formatCurrency(insurance.premium)}
                                    </p>
                                </div>

                                <div className="bg-gray-900/50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400 mb-1">시작일</p>
                                    <p className="text-sm text-white">
                                        {new Date(insurance.startDate).toLocaleDateString("ko-KR")}
                                    </p>
                                </div>

                                <div className="bg-gray-900/50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400 mb-1">만료일</p>
                                    <p className={`text-sm font-medium ${insurance.status === "만료 임박" ? "text-red-400" : "text-white"
                                        }`}>
                                        {new Date(insurance.endDate).toLocaleDateString("ko-KR")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline">
                                    상세보기
                                </Button>
                                <Button size="sm" variant="outline">
                                    갱신하기
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
