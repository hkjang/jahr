"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { MessageSquare, Calendar } from "lucide-react";

export default function PortalEvaluationInterimPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">중간면담</h1>
                <p className="text-gray-400 mt-1">
                    목표 달성 현황을 점검하고 피드백을 받습니다.
                </p>
            </div>

            {/* 진행 현황 */}
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/30">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 mb-2">중간면담 진행률</p>
                            <p className="text-4xl font-bold text-blue-400">60%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">완료: 3개 / 총 5개 목표</p>
                            <p className="text-sm text-gray-500 mt-1">
                                다음 면담 예정: 2024-07-15
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 면담 목록 */}
            <div className="space-y-4">
                {[
                    {
                        goal: "신규 프로젝트 관리 시스템 구축",
                        progress: 75,
                        status: "완료",
                        date: "2024-06-15",
                    },
                    {
                        goal: "팀 역량 강화 프로그램 운영",
                        progress: 60,
                        status: "완료",
                        date: "2024-06-20",
                    },
                    {
                        goal: "고객 만족도 향상",
                        progress: 50,
                        status: "예정",
                        date: null,
                    },
                ].map((item, idx) => (
                    <Card key={idx} className="bg-gray-800 border-gray-700">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-white text-base flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-blue-400" />
                                        {item.goal}
                                    </CardTitle>
                                </div>
                                {item.status === "완료" ? (
                                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded text-sm">
                                        완료
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm">
                                        예정
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">진행률</span>
                                        <span className="text-white font-medium">{item.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                </div>

                                {item.date && (
                                    <div className="bg-gray-900/50 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 mb-1">면담 일자</p>
                                        <p className="text-white">
                                            {new Date(item.date).toLocaleDateString("ko-KR")}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {item.status === "완료" ? (
                                        <Button size="sm" variant="outline" className="flex-1">
                                            면담 내용 보기
                                        </Button>
                                    ) : (
                                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            면담 작성
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
