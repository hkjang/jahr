"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { 
  BarChart3, Users, TrendingUp, TrendingDown, Calendar, Clock,
  CheckCircle, FileCheck, Download, Building2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ReportData {
  overview: {
    totalEmployees: number;
    activeEmployees: number;
    newHiresThisMonth: number;
    resignationsThisMonth: number;
  };
  departmentStats: { name: string; count: number }[];
  attendanceStats: { status: string; count: number }[];
  leaveStats: { status: string; count: number; totalDays: number }[];
  approvalStats: { status: string; count: number }[];
  monthlyTrend: { month: string; hires: number; resignations: number }[];
  period: string;
}

async function fetchReports() {
  const res = await fetch("/api/reports");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function AdminReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
  });

  const reports: ReportData | null = data?.data || null;

  const attendanceLabels: Record<string, string> = {
    NORMAL: "정상",
    LATE: "지각",
    EARLY_LEAVE: "조퇴",
    ABSENT: "결근",
  };

  const approvalLabels: Record<string, string> = {
    PENDING: "대기",
    APPROVED: "승인",
    REJECTED: "반려",
    CANCELLED: "취소",
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">통계 및 리포트</h1>
          <p className="text-gray-400 mt-1">HR 현황을 한눈에 파악합니다.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          리포트 다운로드
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports ? (
        <>
          {/* 주요 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">전체 직원</p>
                    <p className="text-3xl font-bold text-white">{reports.overview.totalEmployees}</p>
                    <p className="text-blue-200 text-xs mt-1">재직 {reports.overview.activeEmployees}명</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-300/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-600 to-green-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">이번 달 입사</p>
                    <p className="text-3xl font-bold text-white">{reports.overview.newHiresThisMonth}</p>
                    <p className="text-green-200 text-xs mt-1">신규 입사자</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-300/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-600 to-red-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">이번 달 퇴사</p>
                    <p className="text-3xl font-bold text-white">{reports.overview.resignationsThisMonth}</p>
                    <p className="text-red-200 text-xs mt-1">퇴사자</p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-red-300/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-600 to-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">기준 기간</p>
                    <p className="text-3xl font-bold text-white">{reports.period}</p>
                    <p className="text-purple-200 text-xs mt-1">현재 월</p>
                  </div>
                  <Calendar className="w-12 h-12 text-purple-300/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 부서별 인원 현황 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  부서별 인원 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.departmentStats.map((dept, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-300">{dept.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min((dept.count / reports.overview.totalEmployees) * 100 * 3, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-white font-medium w-12 text-right">{dept.count}명</span>
                      </div>
                    </div>
                  ))}
                  {reports.departmentStats.length === 0 && (
                    <p className="text-gray-500 text-center py-4">데이터가 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 월별 입퇴사 추이 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  월별 입퇴사 추이
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.monthlyTrend.map((month, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-400 font-mono text-sm w-20">{month.month}</span>
                      <div className="flex items-center gap-4 flex-1 mx-4">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-green-400 w-8">+{month.hires}</span>
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${Math.min(month.hires * 20, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden flex justify-end">
                            <div
                              className="h-full bg-red-500"
                              style={{ width: `${Math.min(month.resignations * 20, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-red-400 w-8">-{month.resignations}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 이번 달 근태 현황 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  이번 달 근태 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {reports.attendanceStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-900 rounded-lg p-4 text-center"
                    >
                      <p className="text-gray-400 text-sm">
                        {attendanceLabels[stat.status] || stat.status}
                      </p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.count}</p>
                    </div>
                  ))}
                  {reports.attendanceStats.length === 0 && (
                    <p className="text-gray-500 text-center py-4 col-span-2">데이터가 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 결재 현황 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-400" />
                  결재 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {reports.approvalStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-4 text-center ${
                        stat.status === "PENDING"
                          ? "bg-yellow-500/10"
                          : stat.status === "APPROVED"
                          ? "bg-green-500/10"
                          : stat.status === "REJECTED"
                          ? "bg-red-500/10"
                          : "bg-gray-900"
                      }`}
                    >
                      <p className="text-gray-400 text-sm">
                        {approvalLabels[stat.status] || stat.status}
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${
                        stat.status === "PENDING"
                          ? "text-yellow-400"
                          : stat.status === "APPROVED"
                          ? "text-green-400"
                          : stat.status === "REJECTED"
                          ? "text-red-400"
                          : "text-white"
                      }`}>
                        {stat.count}
                      </p>
                    </div>
                  ))}
                  {reports.approvalStats.length === 0 && (
                    <p className="text-gray-500 text-center py-4 col-span-2">데이터가 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          데이터를 불러올 수 없습니다.
        </div>
      )}
    </div>
  );
}
