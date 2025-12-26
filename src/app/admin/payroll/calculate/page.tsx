"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Calculator, Users, Download, TrendingUp } from "lucide-react";

export default function AdminPayrollCalculatePage() {
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
                    <h1 className="text-2xl font-bold text-white">급여 계산</h1>
                    <p className="text-gray-400 mt-1">월별 급여를 일괄 계산하고 처리합니다.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        급여대장 다운로드
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Calculator className="w-4 h-4 mr-2" />
                        급여 계산 실행
                    </Button>
                </div>
            </div>

            {/* 계산 대상 선택 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">계산 설정</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">급여월</label>
                            <input
                                type="month"
                                defaultValue={new Date().toISOString().slice(0, 7)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">조직</label>
                            <select className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2">
                                <option>전체</option>
                                <option>기술본부</option>
                                <option>영업본부</option>
                                <option>경영지원본부</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">계산 유형</label>
                            <select className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2">
                                <option>정기 급여</option>
                                <option>상여금</option>
                                <option>성과급</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 급여 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">대상 인원</p>
                                <p className="text-3xl font-bold text-white mt-1">250</p>
                            </div>
                            <Users className="w-10 h-10 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 지급액</p>
                                <p className="text-xl font-bold text-green-400 mt-1">
                                    {formatCurrency(1025000000)}
                                </p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 공제액</p>
                                <p className="text-xl font-bold text-red-400 mt-1">
                                    {formatCurrency(127800000)}
                                </p>
                            </div>
                            <Calculator className="w-10 h-10 text-red-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">실지급액</p>
                                <p className="text-xl font-bold text-purple-400 mt-1">
                                    {formatCurrency(897200000)}
                                </p>
                            </div>
                            <Calculator className="w-10 h-10 text-purple-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 계산 진행 상태 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">계산 진행 상태</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { step: "기본급 계산", status: "완료", progress: 100 },
                            { step: "수당 계산", status: "완료", progress: 100 },
                            { step: "4대보험 계산", status: "진행중", progress: 75 },
                            { step: "세금 계산", status: "대기", progress: 0 },
                            { step: "실수령액 계산", status: "대기", progress: 0 },
                        ].map((item, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-white">{item.step}</span>
                                    <span
                                        className={`text-sm ${item.status === "완료"
                                                ? "text-green-400"
                                                : item.status === "진행중"
                                                    ? "text-yellow-400"
                                                    : "text-gray-400"
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${item.status === "완료"
                                                ? "bg-green-500"
                                                : item.status === "진행중"
                                                    ? "bg-yellow-500"
                                                    : "bg-gray-600"
                                            }`}
                                        style={{ width: `${item.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 예외 처리 필요 항목 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white text-yellow-400 flex items-center gap-2">
                        ⚠️ 예외 처리 필요
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 text-yellow-200">
                            • 김철수: 중간 입사자 (일할 계산 필요)
                        </div>
                        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 text-yellow-200">
                            • 이영희: 휴직 기간 포함 (급여 조정 필요)
                        </div>
                        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 text-yellow-200">
                            • 박민수: 급여 압류 발생
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
