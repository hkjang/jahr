"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Users, TrendingUp, Award, Calendar } from "lucide-react";

export default function AdminHRAnalyticsPage() {
    // Mock data - 실제로는 API에서 가져와야 함
    const stats = {
        totalEmployees: 250,
        newHires: 15,
        turnover: 8,
        avgTenure: 3.5,
    };

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div>
                <h1 className="text-2xl font-bold text-white">HR 분석 대시보드</h1>
                <p className="text-gray-400 mt-1">인사 데이터의 주요 지표와 트렌드를 확인합니다.</p>
            </div>

            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 인원</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {stats.totalEmployees}
                                </p>
                            </div>
                            <Users className="w-10 h-10 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">신규 채용 (월)</p>
                                <p className="text-3xl font-bold text-green-400 mt-1">
                                    +{stats.newHires}
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
                                <p className="text-sm text-gray-400">이직자 (월)</p>
                                <p className="text-3xl font-bold text-red-400 mt-1">
                                    {stats.turnover}
                                </p>
                            </div>
                            <Award className="w-10 h-10 text-red-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">평균 근속 (년)</p>
                                <p className="text-3xl font-bold text-purple-400 mt-1">
                                    {stats.avgTenure}
                                </p>
                            </div>
                            <Calendar className="w-10 h-10 text-purple-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 차트 영역 - placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">월별 인원 추이</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            차트 구현 예정 (Chart.js 또는 Recharts 사용)
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">부서별 인원 분포</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            차트 구현 예정 (Chart.js 또는 Recharts 사용)
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">근속연수 분포</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            차트 구현 예정 (Chart.js 또는 Recharts 사용)
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">직급별 구성</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            차트 구현 예정 (Chart.js 또는 Recharts 사용)
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 상세 분석 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">주요 HR 지표</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <span className="text-gray-300">이직률 (연간)</span>
                            <span className="text-white font-medium">3.2%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <span className="text-gray-300">평균 채용 소요 기간</span>
                            <span className="text-white font-medium">45일</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <span className="text-gray-300">직원 만족도</span>
                            <span className="text-white font-medium">4.2 / 5.0</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <span className="text-gray-300">교육 이수율</span>
                            <span className="text-white font-medium">87%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
