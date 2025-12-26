"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Shield, TrendingUp, Calendar, DollarSign } from "lucide-react";

export default function AdminInsuranceNationalPage() {
    // Mock data
    const insuranceTypes = [
        { type: "PENSION", name: "국민연금", rate: 4.5, color: "blue" },
        { type: "HEALTH", name: "건강보험", rate: 3.545, color: "green" },
        { type: "EMPLOYMENT", name: "고용보험", rate: 0.9, color: "purple" },
        { type: "INDUSTRIAL", name: "산재보험", rate: 0.7, color: "orange" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">4대보험 관리</h1>
                <p className="text-gray-400 mt-1">
                    국민연금, 건강보험, 고용보험, 산재보험을 관리합니다.
                </p>
            </div>

            {/* 보험 유형 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {insuranceTypes.map((insurance) => (
                    <Card key={insurance.type} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <Shield className={`w-8 h-8 text-${insurance.color}-400`} />
                                <span className="text-xs text-gray-400">부담률</span>
                            </div>
                            <h3 className="text-white font-medium mb-1">{insurance.name}</h3>
                            <p className="text-2xl font-bold text-green-400">{insurance.rate}%</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 월별 납부 현황 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        월별 납부 현황
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-900/50 rounded-lg p-4">
                            <p className="text-sm text-gray-400 mb-1">직원 부담금</p>
                            <p className="text-2xl font-bold text-white">₩12,450,000</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-4">
                            <p className="text-sm text-gray-400 mb-1">회사 부담금</p>
                            <p className="text-2xl font-bold text-white">₩13,250,000</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-4">
                            <p className="text-sm text-gray-400 mb-1">총 납부액</p>
                            <p className="text-2xl font-bold text-green-400">₩25,700,000</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 보수월액 관리 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        보수월액 관리
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10 text-gray-400">
                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>직원별 보수월액 내역이 여기에 표시됩니다.</p>
                        <p className="text-sm mt-2">급여 정보를 기반으로 자동 계산됩니다.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
