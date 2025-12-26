"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Calculator, Download, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";

export default function PortalPayslipPage() {
    const { data: session } = useSession();
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toISOString().slice(0, 7).replace("-", "")
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
        }).format(amount);
    };

    // Mock data
    const payslip = {
        yearMonth: selectedMonth,
        baseSalary: 3500000,
        allowances: {
            식대: 200000,
            교통비: 100000,
            직책수당: 300000,
        },
        deductions: {
            소득세: 180000,
            주민세: 18000,
            국민연금: 157500,
            건강보험: 124075,
            고용보험: 31500,
        },
        totalEarnings: 4100000,
        totalDeductions: 511075,
        netSalary: 3588925,
    };

    const totalAllowances = Object.values(payslip.allowances).reduce(
        (sum, v) => sum + v,
        0
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">급여명세서</h1>
                    <p className="text-gray-400 mt-1">월별 급여 내역을 확인합니다.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    PDF 다운로드
                </Button>
            </div>

            {/* 월 선택 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <label className="text-white">급여월:</label>
                        <input
                            type="month"
                            value={selectedMonth.slice(0, 4) + "-" + selectedMonth.slice(4, 6)}
                            onChange={(e) =>
                                setSelectedMonth(e.target.value.replace("-", ""))
                            }
                            className="bg-gray-900 border border-gray-700 text-white rounded px-3 py-2"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-700/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-200">총 지급액</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {formatCurrency(payslip.totalEarnings)}
                                </p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-900/40 to-red-800/40 border-red-700/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-200">총 공제액</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {formatCurrency(payslip.totalDeductions)}
                                </p>
                            </div>
                            <Calculator className="w-10 h-10 text-red-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-900/40 to-green-800/40 border-green-700/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-200">실수령액</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {formatCurrency(payslip.netSalary)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 상세 내역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 지급 항목 */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-white">지급 항목</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-700">
                                <span className="text-gray-300">기본급</span>
                                <span className="text-white font-medium">
                                    {formatCurrency(payslip.baseSalary)}
                                </span>
                            </div>
                            {Object.entries(payslip.allowances).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex justify-between py-2 border-b border-gray-700"
                                >
                                    <span className="text-gray-300">{key}</span>
                                    <span className="text-white font-medium">
                                        {formatCurrency(value)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between py-3 border-t-2 border-blue-700">
                                <span className="text-white font-bold">총 지급액</span>
                                <span className="text-blue-400 font-bold text-lg">
                                    {formatCurrency(payslip.totalEarnings)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 공제 항목 */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-white">공제 항목</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(payslip.deductions).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex justify-between py-2 border-b border-gray-700"
                                >
                                    <span className="text-gray-300">{key}</span>
                                    <span className="text-white font-medium">
                                        {formatCurrency(value)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between py-3 border-t-2 border-red-700">
                                <span className="text-white font-bold">총 공제액</span>
                                <span className="text-red-400 font-bold text-lg">
                                    {formatCurrency(payslip.totalDeductions)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 실수령액 */}
            <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-700/50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 mb-2">최종 실수령액</p>
                            <p className="text-4xl font-bold text-green-400">
                                {formatCurrency(payslip.netSalary)}
                            </p>
                        </div>
                        <div className="text-right text-gray-400 text-sm">
                            <p>지급일: 매월 25일</p>
                            <p className="mt-1">입금 계좌: NH농협 ***-****-****</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
