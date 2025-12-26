"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Briefcase, Calculator, TrendingUp } from "lucide-react";

export default function AdminPayrollBandsPage() {
    // Mock data
    const payBands = [
        {
            position: "사원",
            grade: "1급",
            minSalary: 28000000,
            midSalary: 32000000,
            maxSalary: 36000000,
        },
        {
            position: "대리",
            grade: "1급",
            minSalary: 36000000,
            midSalary: 42000000,
            maxSalary: 48000000,
        },
        {
            position: "과장",
            grade: "1급",
            minSalary: 48000000,
            midSalary: 56000000,
            maxSalary: 64000000,
        },
        {
            position: "차장",
            grade: "1급",
            minSalary: 64000000,
            midSalary: 75000000,
            maxSalary: 86000000,
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pay-band 관리</h1>
                    <p className="text-gray-400 mt-1">직급별 급여 밴드를 관리합니다.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    Pay-band 추가
                </Button>
            </div>

            {/* Pay-band 목록 */}
            <div className="grid grid-cols-1 gap-4">
                {payBands.map((band, index) => (
                    <Card key={index} className="bg-gray-800 border-gray-700">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-400" />
                                    {band.position} {band.grade}
                                </CardTitle>
                                <Button size="sm" variant="outline">
                                    편집
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-900/50 rounded-lg p-4">
                                    <p className="text-xs text-gray-400 mb-1">최소</p>
                                    <p className="text-lg font-bold text-red-400">
                                        {formatCurrency(band.minSalary)}
                                    </p>
                                </div>
                                <div className="bg-gray-900/50 rounded-lg p-4 border-2 border-green-700/50">
                                    <p className="text-xs text-gray-400 mb-1">중간</p>
                                    <p className="text-lg font-bold text-green-400">
                                        {formatCurrency(band.midSalary)}
                                    </p>
                                </div>
                                <div className="bg-gray-900/50 rounded-lg p-4">
                                    <p className="text-xs text-gray-400 mb-1">최대</p>
                                    <p className="text-lg font-bold text-blue-400">
                                        {formatCurrency(band.maxSalary)}
                                    </p>
                                </div>
                            </div>

                            {/* 급여 범위 바 */}
                            <div className="mt-4">
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500" />
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-gray-500">
                                    <span>최소</span>
                                    <span>중간 (권장)</span>
                                    <span>최대</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 수당 규칙 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-purple-400" />
                        수당 규칙
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            { name: "식대", amount: 200000, type: "고정" },
                            { name: "교통비", amount: 100000, type: "고정" },
                            { name: "직책수당", amount: 300000, type: "변동" },
                            { name: "야근수당", amount: 0, type: "시간비례" },
                        ].map((allowance, idx) => (
                            <div
                                key={idx}
                                className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-white font-medium">{allowance.name}</p>
                                    <p className="text-xs text-gray-400">{allowance.type}</p>
                                </div>
                                <p className="text-green-400 font-medium">
                                    {allowance.amount > 0 ? formatCurrency(allowance.amount) : "계산식"}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
