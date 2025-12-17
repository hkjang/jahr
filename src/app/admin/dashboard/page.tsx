"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import {
  Users,
  UserPlus,
  UserMinus,
  Clock,
  Calendar,
  FileCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

// Mock 데이터
const stats = [
  {
    title: "전체 직원 수",
    value: "1,247",
    change: "+12",
    changeType: "increase" as const,
    icon: Users,
    color: "blue",
  },
  {
    title: "이번 달 입사",
    value: "23",
    change: "+8",
    changeType: "increase" as const,
    icon: UserPlus,
    color: "green",
  },
  {
    title: "이번 달 퇴사",
    value: "5",
    change: "-2",
    changeType: "decrease" as const,
    icon: UserMinus,
    color: "red",
  },
  {
    title: "금일 출근율",
    value: "94.2%",
    change: "+1.2%",
    changeType: "increase" as const,
    icon: Clock,
    color: "purple",
  },
];

const pendingApprovals = [
  { id: 1, type: "휴가 신청", requester: "김철수", department: "개발팀", date: "2024-01-15" },
  { id: 2, type: "경비 청구", requester: "이영희", department: "마케팅팀", date: "2024-01-15" },
  { id: 3, type: "출장 신청", requester: "박민수", department: "영업팀", date: "2024-01-14" },
  { id: 4, type: "휴가 신청", requester: "정수진", department: "인사팀", date: "2024-01-14" },
  { id: 5, type: "초과근무", requester: "최동현", department: "개발팀", date: "2024-01-13" },
];

const departmentStats = [
  { name: "개발팀", count: 156, percentage: 25 },
  { name: "마케팅팀", count: 89, percentage: 14 },
  { name: "영업팀", count: 134, percentage: 21 },
  { name: "인사팀", count: 45, percentage: 7 },
  { name: "재무팀", count: 67, percentage: 11 },
  { name: "기타", count: 138, percentage: 22 },
];

const recentActivities = [
  { id: 1, action: "신규 입사", target: "김신입", time: "10분 전" },
  { id: 2, action: "발령 처리", target: "박과장 → 부장 승진", time: "1시간 전" },
  { id: 3, action: "휴가 승인", target: "이대리 연차 3일", time: "2시간 전" },
  { id: 4, action: "급여 확정", target: "2024년 1월 급여", time: "3시간 전" },
  { id: 5, action: "평가 시작", target: "2023년 하반기 평가", time: "1일 전" },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-white">대시보드</h1>
        <p className="text-gray-400 mt-1">HR 현황을 한눈에 확인하세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.changeType === "increase" ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span
                      className={
                        stat.changeType === "increase"
                          ? "text-green-400 text-sm"
                          : "text-red-400 text-sm"
                      }
                    >
                      {stat.change}
                    </span>
                    <span className="text-gray-500 text-sm">전월 대비</span>
                  </div>
                </div>
                <div
                  className={`w-14 h-14 ${colorMap[stat.color]} rounded-2xl flex items-center justify-center opacity-80`}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 대기 중인 결재 */}
        <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-orange-400" />
                대기 중인 결재
              </CardTitle>
              <Badge variant="warning">{pendingApprovals.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-white font-medium">{approval.type}</p>
                      <p className="text-sm text-gray-400">
                        {approval.requester} · {approval.department}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{approval.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 부서별 인원 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              부서별 인원
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((dept) => (
                <div key={dept.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-300">{dept.name}</span>
                    <span className="text-gray-500">{dept.count}명</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            최근 활동
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 bg-gray-900 rounded-xl"
              >
                <p className="text-sm font-medium text-blue-400">
                  {activity.action}
                </p>
                <p className="text-white mt-1">{activity.target}</p>
                <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
