"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { BarChart3, TrendingUp, Award, Users } from "lucide-react";

export default function AdminEvaluationMonitorPage() {
    // Mock data
    const stats = {
        totalEmployees: 250,
        goalSubmitted: 240,
        goalApproved: 220,
        interimCompleted: 180,
        evaluationCompleted: 150,
    };

    const progress = {
        goalSetting: (stats.goalApproved / stats.totalEmployees) * 100,
        interim: (stats.interimCompleted / stats.totalEmployees) * 100,
        evaluation: (stats.evaluationCompleted / stats.totalEmployees) * 100,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">평가 진행 현황</h1>
                <p className="text-gray-400 mt-1">
                    인사평가 진행 상황을 모니터링합니다.
                </p>
            </div>

            {/* 전체 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">총 대상자</p>
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
                        <div>
                            <p className="text-sm text-gray-400">목표 제출</p>
                            <p className="text-3xl font-bold text-yellow-400 mt-1">
                                {stats.goalSubmitted}
                            </p>
                            <div className="mt-2">
                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500"
                                        style={{ width: `${(stats.goalSubmitted / stats.totalEmployees) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm text-gray-400">목표 승인</p>
                            <p className="text-3xl font-bold text-green-400 mt-1">
                                {stats.goalApproved}
                            </p>
                            <div className="mt-2">
                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500"
                                        style={{ width: `${progress.goalSetting}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm text-gray-400">중간면담</p>
                            <p className="text-3xl font-bold text-blue-400 mt-1">
                                {stats.interimCompleted}
                            </p>
                            <div className="mt-2">
                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500"
                                        style={{ width: `${progress.interim}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm text-gray-400">평가 완료</p>
                            <p className="text-3xl font-bold text-purple-400 mt-1">
                                {stats.evaluationCompleted}
                            </p>
                            <div className="mt-2">
                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500"
                                        style={{ width: `${progress.evaluation}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 조직별 진행률 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        조직별 진행 현황
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { dept: "기술본부", total: 80, completed: 75 },
                            { dept: "영업본부", total: 60, completed: 52 },
                            { dept: "경영지원본부", total: 50, completed: 48 },
                            { dept: "마케팅본부", total: 40, completed: 35 },
                            { dept: "연구개발본부", total: 20, completed: 18 },
                        ].map((org, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-white">{org.dept}</span>
                                    <span className="text-sm text-gray-400">
                                        {org.completed}/{org.total} ({((org.completed / org.total) * 100).toFixed(0)}%)
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                        style={{ width: `${(org.completed / org.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 평가 단계별 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-700/30">
                    <CardHeader>
                        <CardTitle className="text-white text-sm">목표수립 단계</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="w-8 h-8 text-yellow-400" />
                            <span className="text-3xl font-bold text-yellow-400">
                                {progress.goalSetting.toFixed(0)}%
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-300">
                                <span>미작성</span>
                                <span>{stats.totalEmployees - stats.goalSubmitted}명</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>승인 대기</span>
                                <span>{stats.goalSubmitted - stats.goalApproved}명</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-700/30">
                    <CardHeader>
                        <CardTitle className="text-white text-sm">중간면담 단계</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <Award className="w-8 h-8 text-blue-400" />
                            <span className="text-3xl font-bold text-blue-400">
                                {progress.interim.toFixed(0)}%
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-300">
                                <span>미실시</span>
                                <span>{stats.goalApproved - stats.interimCompleted}명</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>완료</span>
                                <span>{stats.interimCompleted}명</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/30">
                    <CardHeader>
                        <CardTitle className="text-white text-sm">최종평가 단계</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <BarChart3 className="w-8 h-8 text-purple-400" />
                            <span className="text-3xl font-bold text-purple-400">
                                {progress.evaluation.toFixed(0)}%
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-300">
                                <span>평가 중</span>
                                <span>{stats.interimCompleted - stats.evaluationCompleted}명</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>완료</span>
                                <span>{stats.evaluationCompleted}명</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
