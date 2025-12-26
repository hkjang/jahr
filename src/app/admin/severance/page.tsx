"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Briefcase, Calculator, FileText } from "lucide-react";

export default function AdminSeverancePage() {
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
                    <h1 className="text-2xl font-bold text-white">퇴직금 관리</h1>
                    <p className="text-gray-400 mt-1">
                        퇴직금 및 퇴직연금을 관리하고 계산합니다.
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Calculator className="w-4 h-4 mr-2" />
                    퇴직금 계산
                </Button>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm text-gray-400">총 누적 퇴직금</p>
                            <p className="text-2xl font-bold text-green-400 mt-1">
                                {formatCurrency(2450000000)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm text-gray-400">DB형 연금 가입자</p>
                            <p className="text-2xl font-bold text-blue-400 mt-1">180명</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm text-gray-400">DC형 연금 가입자</p>
                            <p className="text-2xl font-bold text-purple-400 mt-1">70명</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm text-gray-400">월 불입액</p>
                            <p className="text-2xl font-bold text-orange-400 mt-1">
                                {formatCurrency(42500000)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 퇴직금 계산 시뮬레이션 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-blue-400" />
                        퇴직금 계산 시뮬레이션
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">직원 선택</label>
                                <select className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2">
                                    <option>김철수 (사원, 입사일: 2020-03-15)</option>
                                    <option>이영희 (대리, 입사일: 2018-06-01)</option>
                                    <option>박민수 (과장, 입사일: 2015-09-10)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">계산 기준일</label>
                                <input
                                    type="date"
                                    defaultValue={new Date().toISOString().split("T")[0]}
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2"
                                />
                            </div>

                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                계산 실행
                            </Button>
                        </div>

                        <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                            <h3 className="text-white font-medium mb-3">계산 결과</h3>

                            <div className="flex justify-between py-2 border-b border-gray-700">
                                <span className="text-gray-400">재직일수</span>
                                <span className="text-white">1,825일</span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-gray-700">
                                <span className="text-gray-400">평균임금 (3개월)</span>
                                <span className="text-white">{formatCurrency(3800000)}</span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-gray-700">
                                <span className="text-gray-400">1일 평균임금</span>
                                <span className="text-white">{formatCurrency(126667)}</span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-gray-700">
                                <span className="text-gray-400">산출 퇴직금</span>
                                <span className="text-white">{formatCurrency(19000000)}</span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-gray-700">
                                <span className="text-gray-400">중간정산액</span>
                                <span className="text-red-400">-{formatCurrency(0)}</span>
                            </div>

                            <div className="flex justify-between py-3 border-t-2 border-green-700">
                                <span className="text-white font-bold">최종 퇴직금</span>
                                <span className="text-green-400 font-bold text-xl">
                                    {formatCurrency(19000000)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 퇴직연금 현황 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-purple-400" />
                        퇴직연금 현황
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            {
                                provider: "삼성생명",
                                type: "DB형",
                                members: 120,
                                accumulated: 1800000000,
                            },
                            {
                                provider: "교보생명",
                                type: "DB형",
                                members: 60,
                                accumulated: 850000000,
                            },
                            {
                                provider: "미래에셋",
                                type: "DC형",
                                members: 70,
                                accumulated: 420000000,
                            },
                        ].map((pension, idx) => (
                            <div
                                key={idx}
                                className="bg-gray-900/50 rounded-lg p-4 flex items-center justify-between"
                            >
                                <div>
                                    <h4 className="text-white font-medium">{pension.provider}</h4>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {pension.type} • {pension.members}명
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-400">
                                        {formatCurrency(pension.accumulated)}
                                    </p>
                                    <p className="text-xs text-gray-500">누적 금액</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
