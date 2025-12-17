"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar, AvatarFallback } from "@/components/ui";
import { Clock, Calendar, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";
import { ATTENDANCE_STATUS_LABELS, WORK_TYPE_LABELS } from "@/lib/constants";

interface Attendance {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workType: string;
  status: string;
  workMinutes: number | null;
  overtimeMinutes: number | null;
  note: string | null;
  employee: {
    user: { name: string; employeeId: string };
    organization: { name: string };
    position: { name: string };
  };
}

async function fetchAttendances(startDate: string, endDate: string) {
  const params = new URLSearchParams({ startDate, endDate });
  const res = await fetch(`/api/attendance?${params}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function AdminAttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const { data, isLoading } = useQuery({
    queryKey: ["attendances", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => fetchAttendances(startDate.toISOString(), endDate.toISOString()),
  });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusBadge = (attendance: Attendance) => {
    if (!attendance.checkIn) return <Badge variant="destructive">미출근</Badge>;
    if (attendance.status === "LATE") return <Badge variant="warning">지각</Badge>;
    if (attendance.status === "EARLY_LEAVE") return <Badge variant="warning">조퇴</Badge>;
    return <Badge variant="success">정상</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">근태 관리</h1>
          <p className="text-gray-400 mt-1">직원들의 출퇴근 현황을 관리합니다.</p>
        </div>
      </div>

      {/* 월 선택 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-lg font-medium text-white">
                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">정상 출근</p>
                <p className="text-xl font-bold text-white">
                  {data?.data.items.filter((a: Attendance) => a.status === "NORMAL").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">지각</p>
                <p className="text-xl font-bold text-white">
                  {data?.data.items.filter((a: Attendance) => a.status === "LATE").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">조퇴</p>
                <p className="text-xl font-bold text-white">
                  {data?.data.items.filter((a: Attendance) => a.status === "EARLY_LEAVE").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">결근</p>
                <p className="text-xl font-bold text-white">
                  {data?.data.items.filter((a: Attendance) => a.status === "ABSENT").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 근태 목록 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            근태 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data?.data.items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              해당 기간의 근태 기록이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">직원</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">날짜</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">출근</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">퇴근</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">근무형태</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">상태</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">근무시간</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.items.map((attendance: Attendance) => (
                    <tr
                      key={attendance.id}
                      className="border-b border-gray-700/50 hover:bg-gray-700/30"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {attendance.employee.user.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{attendance.employee.user.name}</p>
                            <p className="text-xs text-gray-500">{attendance.employee.organization.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {formatKoreanDate(new Date(attendance.date))}
                      </td>
                      <td className="py-4 px-4 text-green-400">
                        {formatTime(attendance.checkIn)}
                      </td>
                      <td className="py-4 px-4 text-orange-400">
                        {formatTime(attendance.checkOut)}
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {WORK_TYPE_LABELS[attendance.workType as keyof typeof WORK_TYPE_LABELS] || attendance.workType}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(attendance)}
                      </td>
                      <td className="py-4 px-4 text-gray-400">
                        {attendance.workMinutes
                          ? `${Math.floor(attendance.workMinutes / 60)}시간 ${attendance.workMinutes % 60}분`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
