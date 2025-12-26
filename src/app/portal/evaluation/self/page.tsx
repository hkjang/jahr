"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { ClipboardCheck, Award } from "lucide-react";

export default function PortalEvaluationSelfPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">자기평가</h1>
                <p className="text-gray-400 mt-1">
                    본인의 성과와 역량을 자가 진단합니다.
                </p>
            </div>

            {/* 평가 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-400">업적평가</p>
                        <p className="text-2xl font-bold text-blue-400 mt-2">미작성</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-400">능력평가</p>
                        <p className="text-2xl font-bold text-green-400 mt-2">미작성</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-400">다면평가</p>
                        <p className="text-2xl font-bold text-purple-400 mt-2">0/5 완료</p>
                    </CardContent>
                </Card>
            </div>

            {/* 업적평가 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <ClipboardCheck className="w-5 h-5 text-blue-400" />
                        업적평가 (목표 달성도)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { goal: "신규 프로젝트 관리 시스템 구축", weight: 30 },
                            { goal: "팀 역량 강화 프로그램 운영", weight: 25 },
                            { goal: "고객 만족도 향상", weight: 25 },
                            { goal: "업무 프로세스 개선", weight: 20 },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-white font-medium">{item.goal}</h3>
                                        <p className="text-sm text-gray-400 mt-1">
                                            가중치: {item.weight}%
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-2">
                                            자기평가 점수
                                        </label>
                                        <select className="w-full bg-gray-800 border border-gray-600 text-white rounded px-3 py-2">
                                            <option>선택</option>
                                            <option>5.0 (탁월)</option>
                                            <option>4.0 (우수)</option>
                                            <option>3.0 (보통)</option>
                                            <option>2.0 (개선필요)</option>
                                            <option>1.0 (부진)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-2">
                                            달성률 (%)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0-100"
                                            className="w-full bg-gray-800 border border-gray-600 text-white rounded px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <label className="block text-xs text-gray-400 mb-2">
                                        주요 달성 내용
                                    </label>
                                    <textarea
                                        placeholder="구체적인 성과와 실적을 작성하세요..."
                                        className="w-full bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 h-20 resize-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex gap-2 justify-end">
                        <Button variant="outline">임시저장</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">제출</Button>
                    </div>
                </CardContent>
            </Card>

            {/* 능력평가 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-green-400" />
                        능력평가 (역량)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            "문제해결능력",
                            "의사소통능력",
                            "팀워크",
                            "리더십",
                            "전문성",
                        ].map((comp, idx) => (
                            <div
                                key={idx}
                                className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between"
                            >
                                <span className="text-white">{comp}</span>
                                <select className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-1.5 text-sm">
                                    <option>선택</option>
                                    <option>5.0</option>
                                    <option>4.0</option>
                                    <option>3.0</option>
                                    <option>2.0</option>
                                    <option>1.0</option>
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex gap-2 justify-end">
                        <Button variant="outline">임시저장</Button>
                        <Button className="bg-green-600 hover:bg-green-700">제출</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
