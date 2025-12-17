"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Calendar, Plus, Clock, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";
import { LEAVE_TYPE_LABELS, APPROVAL_STATUS_LABELS } from "@/lib/constants";
import Link from "next/link";

interface Leave {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: string;
  halfDay: boolean;
  halfDayType: string | null;
  employee: {
    user: { name: string; employeeId: string };
    organization: { name: string };
  };
}

async function fetchLeaves(page: number, status?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: "20",
    ...(status && { status }),
  });
  const res = await fetch(`/api/leaves?${params}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function AdminLeavePage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["leaves", page, statusFilter],
    queryFn: () => fetchLeaves(page, statusFilter),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="success">승인</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">반려</Badge>;
      case "CANCELLED":
        return <Badge variant="default">취소</Badge>;
      default:
        return <Badge variant="warning">대기</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">휴가 관리</h1>
          <p className="text-gray-400 mt-1">휴가 신청 현황을 관리합니다.</p>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
            statusFilter === "" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setStatusFilter("")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">전체</p>
                <p className="text-xl font-bold text-white">{data?.data?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
            statusFilter === "PENDING" ? "ring-2 ring-yellow-500" : ""
          }`}
          onClick={() => setStatusFilter("PENDING")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">대기 중</p>
                <p className="text-xl font-bold text-white">
                  {data?.data?.items.filter((l: Leave) => l.status === "PENDING").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
            statusFilter === "APPROVED" ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => setStatusFilter("APPROVED")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">승인</p>
                <p className="text-xl font-bold text-white">
                  {data?.data?.items.filter((l: Leave) => l.status === "APPROVED").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
            statusFilter === "REJECTED" ? "ring-2 ring-red-500" : ""
          }`}
          onClick={() => setStatusFilter("REJECTED")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">반려</p>
                <p className="text-xl font-bold text-white">
                  {data?.data?.items.filter((l: Leave) => l.status === "REJECTED").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 휴가 목록 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            휴가 신청 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data?.data?.items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              휴가 신청 내역이 없습니다.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">신청자</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">휴가유형</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">기간</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">일수</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">사유</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">상태</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data?.items.map((leave: Leave) => (
                      <tr
                        key={leave.id}
                        className="border-b border-gray-700/50 hover:bg-gray-700/30"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">{leave.employee.user.name}</p>
                            <p className="text-xs text-gray-500">{leave.employee.organization.name}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {LEAVE_TYPE_LABELS[leave.type as keyof typeof LEAVE_TYPE_LABELS] || leave.type}
                          {leave.halfDay && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({leave.halfDayType === "AM" ? "오전" : "오후"})
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {formatKoreanDate(new Date(leave.startDate))}
                          {leave.startDate !== leave.endDate && (
                            <> ~ {formatKoreanDate(new Date(leave.endDate))}</>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-300">{leave.days}일</td>
                        <td className="py-4 px-4 text-gray-400 max-w-[200px] truncate">
                          {leave.reason || "-"}
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(leave.status)}</td>
                        <td className="py-4 px-4">
                          {leave.status === "PENDING" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-xs"
                                onClick={async () => {
                                  await fetch(`/api/leaves/${leave.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: "APPROVED" }),
                                  });
                                  window.location.reload();
                                }}
                              >
                                승인
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-xs"
                                onClick={async () => {
                                  await fetch(`/api/leaves/${leave.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: "REJECTED" }),
                                  });
                                  window.location.reload();
                                }}
                              >
                                반려
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {data?.data?.totalPages > 1 && (
                <div className="flex items-center justify-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="border-gray-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-400">
                    {page} / {data.data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.data.totalPages}
                    className="border-gray-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
