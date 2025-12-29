"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
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
  ArrowRight,
  Briefcase,
  GraduationCap,
  DollarSign,
  Target,
  Sparkles,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
} from "lucide-react";

// Mock 데이터
const stats = [
  {
    title: "전체 직원 수",
    value: "1,247",
    change: "+12",
    changeType: "increase" as const,
    icon: Users,
    color: "from-blue-500 to-blue-600",
    href: "/admin/employees",
  },
  {
    title: "이번 달 입사",
    value: "23",
    change: "+8",
    changeType: "increase" as const,
    icon: UserPlus,
    color: "from-green-500 to-green-600",
    href: "/admin/employees?filter=new",
  },
  {
    title: "이번 달 퇴사",
    value: "5",
    change: "-2",
    changeType: "decrease" as const,
    icon: UserMinus,
    color: "from-red-500 to-red-600",
    href: "/admin/employees?filter=resigned",
  },
  {
    title: "금일 출근율",
    value: "94.2%",
    change: "+1.2%",
    changeType: "increase" as const,
    icon: Clock,
    color: "from-purple-500 to-purple-600",
    href: "/admin/attendance",
  },
];

const quickActions = [
  { title: "신규 직원 등록", icon: UserPlus, href: "/admin/employees?action=new", color: "bg-blue-500/20 text-blue-400" },
  { title: "휴가 결재", icon: Calendar, href: "/admin/approval?filter=leave", color: "bg-green-500/20 text-green-400" },
  { title: "급여 계산", icon: DollarSign, href: "/admin/payroll/calculate", color: "bg-yellow-500/20 text-yellow-400" },
  { title: "채용 공고", icon: Briefcase, href: "/admin/recruitment/postings", color: "bg-purple-500/20 text-purple-400" },
  { title: "교육 등록", icon: GraduationCap, href: "/admin/training", color: "bg-pink-500/20 text-pink-400" },
  { title: "OKR 관리", icon: Target, href: "/admin/okr", color: "bg-orange-500/20 text-orange-400" },
];

const pendingApprovals = [
  { id: 1, type: "휴가 신청", requester: "김철수", department: "개발팀", date: "2024-01-15", urgent: true },
  { id: 2, type: "경비 청구", requester: "이영희", department: "마케팅팀", date: "2024-01-15", urgent: false },
  { id: 3, type: "출장 신청", requester: "박민수", department: "영업팀", date: "2024-01-14", urgent: false },
  { id: 4, type: "휴가 신청", requester: "정수진", department: "인사팀", date: "2024-01-14", urgent: false },
  { id: 5, type: "초과근무", requester: "최동현", department: "개발팀", date: "2024-01-13", urgent: true },
];

const departmentStats = [
  { name: "개발팀", count: 156, percentage: 25, color: "from-blue-500 to-cyan-500" },
  { name: "마케팅팀", count: 89, percentage: 14, color: "from-pink-500 to-rose-500" },
  { name: "영업팀", count: 134, percentage: 21, color: "from-green-500 to-emerald-500" },
  { name: "인사팀", count: 45, percentage: 7, color: "from-purple-500 to-violet-500" },
  { name: "재무팀", count: 67, percentage: 11, color: "from-yellow-500 to-orange-500" },
  { name: "기타", count: 138, percentage: 22, color: "from-gray-500 to-gray-600" },
];

const recentActivities = [
  { id: 1, action: "신규 입사", target: "김신입", time: "10분 전", type: "success" },
  { id: 2, action: "발령 처리", target: "박과장 → 부장 승진", time: "1시간 전", type: "info" },
  { id: 3, action: "휴가 승인", target: "이대리 연차 3일", time: "2시간 전", type: "success" },
  { id: 4, action: "급여 확정", target: "2024년 1월 급여", time: "3시간 전", type: "info" },
  { id: 5, action: "평가 시작", target: "2023년 하반기 평가", time: "1일 전", type: "warning" },
];

const systemStatus = [
  { name: "API 서버", status: "healthy", latency: "45ms" },
  { name: "데이터베이스", status: "healthy", latency: "12ms" },
  { name: "AI 서비스", status: "healthy", latency: "234ms" },
  { name: "배치 작업", status: "warning", latency: "실행 중" },
];

const typeColors = {
  success: "text-green-400",
  info: "text-blue-400",
  warning: "text-yellow-400",
  error: "text-red-400",
};

export default function AdminDashboard() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "좋은 아침이에요" : currentHour < 18 ? "좋은 오후에요" : "좋은 저녁이에요";

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting} 👋</h1>
          <p className="text-gray-400 mt-1">
            오늘 처리해야 할 결재가 <span className="text-orange-400 font-medium">{pendingApprovals.length}건</span> 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <Settings className="w-4 h-4 mr-2" />
            대시보드 설정
          </Button>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600 transition-all cursor-pointer group">
              <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{action.title}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all cursor-pointer group">
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
                    className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                  >
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
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
              <div className="flex items-center gap-2">
                <Badge variant="warning">{pendingApprovals.length}</Badge>
                <Link href="/admin/approval">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    전체 보기 <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${approval.urgent ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                      <AlertTriangle className={`w-5 h-5 ${approval.urgent ? 'text-red-400' : 'text-orange-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{approval.type}</p>
                        {approval.urgent && (
                          <Badge className="bg-red-500/20 text-red-400 text-xs">긴급</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {approval.requester} · {approval.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{approval.date}</span>
                    <ArrowRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 부서별 인원 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                부서별 인원
              </CardTitle>
              <Link href="/admin/organization">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((dept) => (
                <div key={dept.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-300">{dept.name}</span>
                    <span className="text-white font-medium">{dept.count}명</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${dept.color} rounded-full transition-all duration-500`}
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 하단 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 활동 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-current flex-shrink-0" style={{ color: typeColors[activity.type as keyof typeof typeColors].replace('text-', '') }} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${typeColors[activity.type as keyof typeof typeColors]}`}>
                      {activity.action}
                    </p>
                    <p className="text-white truncate">{activity.target}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 시스템 상태 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                시스템 상태
              </CardTitle>
              <Link href="/admin/operations">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {systemStatus.map((system) => (
                <div
                  key={system.name}
                  className="p-4 bg-gray-900/50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">{system.name}</span>
                    {system.status === "healthy" ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : system.status === "warning" ? (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <p className="text-white font-medium">{system.latency}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
