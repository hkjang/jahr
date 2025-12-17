"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Clock, Calendar, MapPin, CheckCircle, LogIn, LogOut } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";
import { WORK_TYPE_LABELS } from "@/lib/constants";

interface TodayAttendance {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workType: string;
  status: string;
  workMinutes: number | null;
}

async function fetchTodayAttendance(employeeId: string) {
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(`/api/attendance?employeeId=${employeeId}&startDate=${today}&endDate=${today}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function PortalAttendancePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employeeId = (session?.user as any)?.employee?.id;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["todayAttendance", employeeId],
    queryFn: () => fetchTodayAttendance(employeeId!),
    enabled: !!employeeId,
    refetchInterval: 60000, // 1분마다 갱신
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          date: today,
          checkIn: now,
          workType: "OFFICE",
        }),
      });
      if (!res.ok) throw new Error("Failed to check in");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todayAttendance"] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          date: today,
          checkOut: now,
        }),
      });
      if (!res.ok) throw new Error("Failed to check out");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todayAttendance"] });
    },
  });

  const todayAttendance: TodayAttendance | null = data?.data?.items?.[0] || null;

  const formatTimeFromDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWorkDuration = () => {
    if (!todayAttendance?.checkIn) return null;
    
    const checkIn = new Date(todayAttendance.checkIn);
    const checkOut = todayAttendance.checkOut 
      ? new Date(todayAttendance.checkOut)
      : currentTime;
    
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}시간 ${minutes}분`;
  };

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">근태 관리</h1>
        <p className="text-gray-500 mt-1">출퇴근을 기록하고 근태 현황을 확인합니다.</p>
      </div>

      {/* 현재 시간 및 출퇴근 */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">
                {today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일 ({weekdays[today.getDay()]})
              </p>
              <p className="text-4xl font-bold mt-2 font-mono">
                {currentTime.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
            <Clock className="w-16 h-16 text-white/30" />
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 출근 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  todayAttendance?.checkIn ? "bg-green-100" : "bg-gray-100"
                }`}>
                  <LogIn className={`w-6 h-6 ${
                    todayAttendance?.checkIn ? "text-green-600" : "text-gray-400"
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">출근</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatTimeFromDate(todayAttendance?.checkIn) || "--:--"}
                  </p>
                </div>
              </div>
              {!todayAttendance?.checkIn && (
                <Button
                  onClick={() => checkInMutation.mutate()}
                  disabled={checkInMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {checkInMutation.isPending ? "처리 중..." : "출근하기"}
                </Button>
              )}
              {todayAttendance?.checkIn && (
                <Badge variant="success">출근 완료</Badge>
              )}
            </div>

            {/* 퇴근 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  todayAttendance?.checkOut ? "bg-orange-100" : "bg-gray-100"
                }`}>
                  <LogOut className={`w-6 h-6 ${
                    todayAttendance?.checkOut ? "text-orange-600" : "text-gray-400"
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">퇴근</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatTimeFromDate(todayAttendance?.checkOut) || "--:--"}
                  </p>
                </div>
              </div>
              {todayAttendance?.checkIn && !todayAttendance?.checkOut && (
                <Button
                  onClick={() => checkOutMutation.mutate()}
                  disabled={checkOutMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {checkOutMutation.isPending ? "처리 중..." : "퇴근하기"}
                </Button>
              )}
              {todayAttendance?.checkOut && (
                <Badge variant="success">퇴근 완료</Badge>
              )}
            </div>
          </div>

          {/* 근무 시간 */}
          {todayAttendance?.checkIn && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-600">
                    {todayAttendance.checkOut ? "총 근무 시간" : "현재 근무 시간"}
                  </span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {getWorkDuration()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 이번 주 근태 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            이번 주 근태 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, index) => {
              const day = new Date();
              day.setDate(day.getDate() - day.getDay() + index);
              const isToday = day.toDateString() === today.toDateString();
              const isPast = day < today && !isToday;
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-xl text-center ${
                    isToday
                      ? "bg-blue-100 border-2 border-blue-500"
                      : isPast
                      ? "bg-gray-100"
                      : "bg-gray-50"
                  }`}
                >
                  <p className={`text-xs ${isToday ? "text-blue-600 font-bold" : "text-gray-500"}`}>
                    {weekdays[index]}
                  </p>
                  <p className={`text-lg font-bold ${isToday ? "text-blue-600" : "text-gray-700"}`}>
                    {day.getDate()}
                  </p>
                  {(index > 0 && index < 6) && (
                    <div className="mt-1">
                      {isPast ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                      ) : isToday && todayAttendance?.checkIn ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-300 mx-auto" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
