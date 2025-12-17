"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { TrendingUp, Calendar, Target, Award, ChevronRight } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";

interface Evaluation {
  id: string;
  periodId: string;
  period: {
    name: string;
    year: number;
    type: string;
    startDate: string;
    endDate: string;
  };
  status: string;
  selfScore: number | null;
  managerScore: number | null;
  finalScore: number | null;
  grade: string | null;
}

async function fetchMyEvaluations() {
  const res = await fetch("/api/evaluations/me");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const statusLabels: Record<string, string> = {
  NOT_STARTED: "미시작",
  SELF_EVALUATION: "자기평가 중",
  MANAGER_EVALUATION: "상사평가 중",
  COMPLETED: "완료",
};

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-700",
  SELF_EVALUATION: "bg-yellow-100 text-yellow-700",
  MANAGER_EVALUATION: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const gradeColors: Record<string, string> = {
  S: "bg-purple-500",
  A: "bg-blue-500",
  B: "bg-green-500",
  C: "bg-yellow-500",
  D: "bg-red-500",
};

export default function PortalEvaluationPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["myEvaluations"],
    queryFn: fetchMyEvaluations,
  });

  // 모의 데이터
  const mockEvaluations: Evaluation[] = [
    {
      id: "1",
      periodId: "p1",
      period: {
        name: "2024년 하반기 정기평가",
        year: 2024,
        type: "HALF_YEARLY",
        startDate: "2024-07-01",
        endDate: "2024-12-31",
      },
      status: "SELF_EVALUATION",
      selfScore: null,
      managerScore: null,
      finalScore: null,
      grade: null,
    },
    {
      id: "2",
      periodId: "p2",
      period: {
        name: "2024년 상반기 정기평가",
        year: 2024,
        type: "HALF_YEARLY",
        startDate: "2024-01-01",
        endDate: "2024-06-30",
      },
      status: "COMPLETED",
      selfScore: 4.2,
      managerScore: 4.0,
      finalScore: 4.1,
      grade: "A",
    },
    {
      id: "3",
      periodId: "p3",
      period: {
        name: "2023년 연간평가",
        year: 2023,
        type: "YEARLY",
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
      status: "COMPLETED",
      selfScore: 3.8,
      managerScore: 4.0,
      finalScore: 3.9,
      grade: "B",
    },
  ];

  const evaluations = data?.data || mockEvaluations;
  const currentEval = evaluations.find((e: Evaluation) => e.status !== "COMPLETED");
  const pastEvals = evaluations.filter((e: Evaluation) => e.status === "COMPLETED");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">내 평가</h1>
        <p className="text-gray-500 mt-1">인사 평가 현황을 확인하고 자기평가를 진행합니다.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* 진행 중인 평가 */}
          {currentEval && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Target className="w-5 h-5" />
                    진행 중인 평가
                  </CardTitle>
                  <Badge className={statusColors[currentEval.status]}>
                    {statusLabels[currentEval.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{currentEval.period.name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatKoreanDate(new Date(currentEval.period.startDate))} ~ {formatKoreanDate(new Date(currentEval.period.endDate))}
                    </p>
                  </div>

                  {currentEval.status === "SELF_EVALUATION" && (
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-gray-700 mb-3">
                        자기평가를 진행해 주세요. 평가 항목별로 본인의 업무 성과를 점수와 함께 작성합니다.
                      </p>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        자기평가 시작하기
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  {currentEval.status === "MANAGER_EVALUATION" && (
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-gray-700">
                        자기평가가 완료되었습니다. 상사 평가가 진행 중입니다.
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                        <span>자기평가 점수: <strong>{currentEval.selfScore?.toFixed(1)}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 지난 평가 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                평가 이력
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pastEvals.length === 0 ? (
                <p className="text-center text-gray-500 py-8">완료된 평가가 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {pastEvals.map((evaluation: Evaluation) => (
                    <div
                      key={evaluation.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {evaluation.grade && (
                          <div className={`w-12 h-12 ${gradeColors[evaluation.grade]} rounded-xl flex items-center justify-center text-white text-xl font-bold`}>
                            {evaluation.grade}
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">{evaluation.period.name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatKoreanDate(new Date(evaluation.period.startDate))} ~ {formatKoreanDate(new Date(evaluation.period.endDate))}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">최종 점수</div>
                        <div className="text-xl font-bold text-blue-600">
                          {evaluation.finalScore?.toFixed(1) || "-"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 점수 범례 */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-6 text-sm">
                <span className="text-gray-500">등급 기준:</span>
                {Object.entries(gradeColors).map(([grade, color]) => (
                  <div key={grade} className="flex items-center gap-1">
                    <div className={`w-6 h-6 ${color} rounded text-white text-xs flex items-center justify-center font-bold`}>
                      {grade}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
