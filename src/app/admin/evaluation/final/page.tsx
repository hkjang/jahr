"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Award, TrendingUp, Plus } from "lucide-react";

export default function AdminEvaluationFinalPage() {
    const formatNumber = (num: number, decimal = 2) => {
        return num.toFixed(decimal);
    };

    // Mock data
    const finalEvaluations = [
        {
            id: "1",
            employee: "김철수",
            position: "과장",
            organization: "기술본부",
            performanceScore: 4.8,
            competencyScore: 4.5,
            multiRaterScore: 4.6,
            totalScore: 4.67,
            calculatedGrade: "S",
            finalGrade: "S",
        },
        {
            id: "2",
            employee: "이영희",
            position: "대리",
            organization: "영업본부",
            performanceScore: 4.2,
            competencyScore: 4.0,
            multiRaterScore: 4.1,
            totalScore: 4.10,
            calculatedGrade: "A",
            finalGrade: "A",
        },
        // ... more data
    ];

    const gradeDistribution = {
        current: { S: 15, A: 45, B: 60, C: 25, D: 5 },
        target: { S: 10, A: 20, B: 40, C: 20, D: 10 },
    };

    const total = Object.values(gradeDistribution.current).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">종합평가 및 등급 배분</h1>
                    <p className="text-gray-400 mt-1">
                        최종 평가 결과를 확인하고 등급을 조정합니다.
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Award className="w-4 h-4 mr-2" />
                    등급 확정
                </Button>
            </div>

            {/* 등급 배분 현황 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">등급 배분 현황</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 gap-4">
                        {(["S", "A", "B", "C", "D"] as const).map((grade) => {
                            const currentCount = gradeDistribution.current[grade];
                            const currentPct = ((currentCount / total) * 100).toFixed(1);
                            const targetPct = gradeDistribution.target[grade];
                            const isOverTarget = parseFloat(currentPct) > targetPct;

                            return (
                                <div
                                    key={grade}
                                    className={`rounded-lg p-4 ${grade === "S"
                                            ? "bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border border-yellow-700/50"
                                            : grade === "A"
                                                ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-700/50"
                                                : grade === "B"
                                                    ? "bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-700/50"
                                                    : grade === "C"
                                                        ? "bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-700/50"
                                                        : "bg-gradient-to-br from-red-900/40 to-rose-900/40 border border-red-700/50"
                                        }`}
                                >
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-white mb-2">{grade}</p>
                                        <p className="text-2xl font-bold text-green-400">
                                            {currentCount}명
                                        </p>
                                        <p className="text-sm text-gray-300 mt-1">
                                            {currentPct}%{" "}
                                            <span
                                                className={
                                                    isOverTarget ? "text-red-400" : "text-gray-500"
                                                }
                                            >
                                                (목표: {targetPct}%)
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* 평가 결과 목록 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white">평가 결과 (상위 순)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-gray-400 border-b border-gray-700">
                                <tr>
                                    <th className="text-left py-3 px-2">순위</th>
                                    <th className="text-left py-3 px-2">이름</th>
                                    <th className="text-left py-3 px-2">직급</th>
                                    <th className="text-left py-3 px-2">부서</th>
                                    <th className="text-right py-3 px-2">업적</th>
                                    <th className="text-right py-3 px-2">능력</th>
                                    <th className="text-right py-3 px-2">다면</th>
                                    <th className="text-right py-3 px-2">총점</th>
                                    <th className="text-center py-3 px-2">계산</th>
                                    <th className="text-center py-3 px-2">최종</th>
                                    <th className="text-center py-3 px-2">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finalEvaluations.map((eval, idx) => (
                                    <tr
                                        key={eval.id}
                                        className="border-b border-gray-700/50 hover:bg-gray-700/30"
                                    >
                                        <td className="py-3 px-2 text-gray-400">{idx + 1}</td>
                                        <td className="py-3 px-2 text-white font-medium">
                                            {eval.employee}
                                        </td>
                                        <td className="py-3 px-2 text-gray-300">{eval.position}</td>
                                        <td className="py-3 px-2 text-gray-300">
                                            {eval.organization}
                                        </td>
                                        <td className="py-3 px-2 text-right text-blue-400">
                                            {formatNumber(eval.performanceScore)}
                                        </td>
                                        <td className="py-3 px-2 text-right text-green-400">
                                            {formatNumber(eval.competencyScore)}
                                        </td>
                                        <td className="py-3 px-2 text-right text-purple-400">
                                            {formatNumber(eval.multiRaterScore)}
                                        </td>
                                        <td className="py-3 px-2 text-right text-white font-bold">
                                            {formatNumber(eval.totalScore)}
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${eval.calculatedGrade === "S"
                                                        ? "bg-yellow-500/20 text-yellow-300"
                                                        : eval.calculatedGrade === "A"
                                                            ? "bg-green-500/20 text-green-300"
                                                            : eval.calculatedGrade === "B"
                                                                ? "bg-blue-500/20 text-blue-300"
                                                                : eval.calculatedGrade === "C"
                                                                    ? "bg-purple-500/20 text-purple-300"
                                                                    : "bg-red-500/20 text-red-300"
                                                    }`}
                                            >
                                                {eval.calculatedGrade}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            <select
                                                defaultValue={eval.finalGrade}
                                                className="bg-gray-900 border border-gray-600 text-white rounded px-2 py-1 text-xs"
                                            >
                                                <option>S</option>
                                                <option>A</option>
                                                <option>B</option>
                                                <option>C</option>
                                                <option>D</option>
                                            </select>
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            <Button size="sm" variant="outline" className="text-xs">
                                                상세
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
