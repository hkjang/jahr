"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { ClipboardCheck, Calendar, Search, Star, Users } from "lucide-react";
import { EVALUATION_STATUS_LABELS, EVALUATION_GRADE_LABELS } from "@/lib/constants";

interface EvaluationItem {
  id: string;
  category: string;
  name: string;
  weight: number;
  selfScore: number | null;
  managerScore: number | null;
}

interface Evaluation {
  id: string;
  status: string;
  selfComment: string | null;
  managerComment: string | null;
  finalGrade: string | null;
  employee: {
    user: { name: string; employeeId: string };
    organization: { name: string };
    position: { name: string };
  };
  period: {
    name: string;
    type: string;
    year: number;
  };
  items: EvaluationItem[];
}

interface EvaluationPeriod {
  id: string;
  name: string;
  type: string;
  year: number;
  startDate: string;
  endDate: string;
}

async function fetchPeriods() {
  const res = await fetch("/api/evaluations/periods");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function fetchEvaluations(periodId: string) {
  const res = await fetch(`/api/evaluations?periodId=${periodId}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function AdminEvaluationPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data: periodsData } = useQuery({
    queryKey: ["evaluationPeriods"],
    queryFn: fetchPeriods,
  });

  const { data: evaluationsData, isLoading } = useQuery({
    queryKey: ["evaluations", selectedPeriod],
    queryFn: () => fetchEvaluations(selectedPeriod),
    enabled: !!selectedPeriod,
  });

  // 첫 번째 기간 자동 선택
  if (!selectedPeriod && periodsData?.data?.length > 0) {
    setSelectedPeriod(periodsData.data[0].id);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">완료</Badge>;
      case "MANAGER_EVALUATION":
        return <Badge variant="warning">상위평가</Badge>;
      case "SELF_EVALUATION":
        return <Badge variant="default">자기평가</Badge>;
      default:
        return <Badge variant="default">미시작</Badge>;
    }
  };

  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case "S": return "text-purple-400";
      case "A": return "text-blue-400";
      case "B": return "text-green-400";
      case "C": return "text-yellow-400";
      case "D": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  // 통계
  const stats = {
    total: evaluationsData?.data?.items?.length || 0,
    completed: evaluationsData?.data?.items?.filter((e: Evaluation) => e.status === "COMPLETED").length || 0,
    inProgress: evaluationsData?.data?.items?.filter((e: Evaluation) => 
      e.status === "SELF_EVALUATION" || e.status === "MANAGER_EVALUATION"
    ).length || 0,
  };

  const filteredEvaluations = evaluationsData?.data?.items?.filter((evaluation: Evaluation) =>
    evaluation.employee.user.name.includes(search) ||
    evaluation.employee.user.employeeId.includes(search)
  ) || [];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">인사 평가</h1>
          <p className="text-gray-400 mt-1">직원 평가를 관리합니다.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <ClipboardCheck className="w-4 h-4 mr-2" />
          평가 기간 설정
        </Button>
      </div>

      {/* 기간 선택 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2"
            >
              {periodsData?.data?.map((period: EvaluationPeriod) => (
                <option key={period.id} value={period.id}>
                  {period.name} ({period.year}년 {period.type === "HALF_YEARLY" ? "반기" : "연간"})
                </option>
              ))}
              {(!periodsData?.data || periodsData.data.length === 0) && (
                <option value="">평가 기간이 없습니다</option>
              )}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">전체 대상</p>
                <p className="text-xl font-bold text-white">{stats.total}명</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">진행 중</p>
                <p className="text-xl font-bold text-white">{stats.inProgress}명</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">평가 완료</p>
                <p className="text-xl font-bold text-white">{stats.completed}명</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <Input
            placeholder="이름 또는 사번으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-gray-900 border-gray-700 text-white max-w-md"
          />
        </CardContent>
      </Card>

      {/* 평가 목록 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-400" />
            평가 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedPeriod ? (
            <div className="text-center py-20 text-gray-400">
              평가 기간을 선택해주세요.
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredEvaluations.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              평가 대상자가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">직원</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">소속</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">직급</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">자기평가</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">상위평가</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">최종등급</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvaluations.map((evaluation: Evaluation) => {
                    const selfAvg = evaluation.items.length > 0
                      ? evaluation.items.reduce((sum, item) => sum + (item.selfScore || 0), 0) / evaluation.items.length
                      : null;
                    const managerAvg = evaluation.items.length > 0
                      ? evaluation.items.reduce((sum, item) => sum + (item.managerScore || 0), 0) / evaluation.items.length
                      : null;

                    return (
                      <tr
                        key={evaluation.id}
                        className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">{evaluation.employee.user.name}</p>
                            <p className="text-xs text-gray-500">{evaluation.employee.user.employeeId}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {evaluation.employee.organization.name}
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {evaluation.employee.position.name}
                        </td>
                        <td className="py-4 px-4 text-center text-blue-400">
                          {selfAvg !== null ? selfAvg.toFixed(1) : "-"}
                        </td>
                        <td className="py-4 px-4 text-center text-green-400">
                          {managerAvg !== null && managerAvg > 0 ? managerAvg.toFixed(1) : "-"}
                        </td>
                        <td className={`py-4 px-4 text-center font-bold ${getGradeColor(evaluation.finalGrade)}`}>
                          {evaluation.finalGrade ? (
                            EVALUATION_GRADE_LABELS[evaluation.finalGrade as keyof typeof EVALUATION_GRADE_LABELS]
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(evaluation.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
