"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import {
  Clock,
  Calendar,
  CreditCard,
  TrendingUp,
  FileCheck,
  Bell,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";

// Mock 데이터 (실제로는 API에서 가져옴)
const todayAttendance = {
  checkIn: "09:02",
  checkOut: null,
  workHours: "5시간 32분",
  status: "근무중",
};

const leaveBalance = {
  total: 15,
  used: 8,
  remaining: 7,
};

const pendingApprovals = [
  { id: 1, type: "휴가 신청", title: "연차 휴가", date: "2024-01-15", status: "pending" },
  { id: 2, type: "경비 청구", title: "출장 교통비", date: "2024-01-14", status: "pending" },
];

const recentNotifications = [
  { id: 1, message: "급여 명세서가 발급되었습니다.", time: "2시간 전", read: false },
  { id: 2, message: "평가 기간이 시작되었습니다.", time: "1일 전", read: true },
  { id: 3, message: "휴가 신청이 승인되었습니다.", time: "2일 전", read: true },
];

export default function PortalDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* 인사말 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          안녕하세요, {session?.user?.name}님! 👋
        </h1>
        <p className="text-blue-100">
          오늘도 좋은 하루 보내세요. | {formatKoreanDate(new Date())}
        </p>
      </div>

      {/* 오늘의 출근 현황 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            오늘의 근태
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">출근</p>
              <p className="text-xl font-bold text-green-600">
                {todayAttendance.checkIn}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">퇴근</p>
              <p className="text-xl font-bold text-gray-400">
                {todayAttendance.checkOut || "--:--"}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">근무 시간</p>
              <p className="text-xl font-bold text-blue-600">
                {todayAttendance.workHours}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">상태</p>
              <Badge variant="success">{todayAttendance.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 연차 현황 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              연차 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-blue-600">
                {leaveBalance.remaining}
              </span>
              <span className="text-gray-500 pb-1">일 남음</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                style={{
                  width: `${(leaveBalance.used / leaveBalance.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {leaveBalance.used}일 사용 / 총 {leaveBalance.total}일
            </p>
          </CardContent>
        </Card>

        {/* 급여 정보 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              이번 달 급여
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-gray-900">
                ₩4,850,000
              </span>
            </div>
            <p className="text-sm text-gray-500">
              지급 예정일: 2024년 1월 25일
            </p>
          </CardContent>
        </Card>

        {/* 평가 현황 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              평가 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="warning" className="mb-3">자기평가 진행중</Badge>
            <p className="text-sm text-gray-500">
              마감일: 2024년 1월 31일
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 결재 및 알림 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 대기 중인 결재 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-orange-600" />
              대기 중인 결재
              <Badge variant="warning" className="ml-auto">
                {pendingApprovals.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                대기 중인 결재가 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">{approval.title}</p>
                        <p className="text-xs text-gray-500">{approval.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{approval.date}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 알림 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              최근 알림
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    notification.read ? "bg-gray-50" : "bg-blue-50"
                  }`}
                >
                  {notification.read ? (
                    <CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  ) : (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
