"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Label } from "@/components/ui";
import { Calendar, Plus, CheckCircle, XCircle, Clock, X } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";
import { LEAVE_TYPE_LABELS, APPROVAL_STATUS_LABELS } from "@/lib/constants";

interface LeaveBalance {
  id: string;
  leaveType: string;
  totalDays: number;
  usedDays: number;
}

interface Leave {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: string;
  halfDay: boolean;
}

async function fetchMyLeaves(employeeId: string) {
  const res = await fetch(`/api/leaves?employeeId=${employeeId}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function PortalLeavePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
    halfDay: false,
    halfDayType: "AM",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employeeId = (session?.user as any)?.employee?.id;

  const { data: leavesData, isLoading } = useQuery({
    queryKey: ["myLeaves", employeeId],
    queryFn: () => fetchMyLeaves(employeeId!),
    enabled: !!employeeId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData & { days: number }) => {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, employeeId }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myLeaves"] });
      setShowForm(false);
      setFormData({
        type: "ANNUAL",
        startDate: "",
        endDate: "",
        reason: "",
        halfDay: false,
        halfDayType: "AM",
      });
    },
  });

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return formData.halfDay ? 0.5 : diffDays;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = calculateDays();
    createMutation.mutate({ ...formData, days });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "CANCELLED":
        return <X className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

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

  // 연차 잔여 계산 (하드코딩된 예시 - 실제로는 API에서 가져와야 함)
  const annualBalance = { total: 15, used: 3 };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">휴가 신청</h1>
          <p className="text-gray-500 mt-1">휴가를 신청하고 현황을 확인합니다.</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              취소
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              휴가 신청
            </>
          )}
        </Button>
      </div>

      {/* 연차 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">총 연차</p>
                <p className="text-3xl font-bold">{annualBalance.total}일</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">잔여 연차</p>
                <p className="text-3xl font-bold">{annualBalance.total - annualBalance.used}일</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">사용 연차</p>
                <p className="text-3xl font-bold">{annualBalance.used}일</p>
              </div>
              <Clock className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 휴가 신청 폼 */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              휴가 신청서
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label required>휴가 유형</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(LEAVE_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>반차 여부</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.halfDay}
                        onChange={(e) => setFormData({ ...formData, halfDay: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">반차 사용</span>
                    </label>
                    {formData.halfDay && (
                      <select
                        value={formData.halfDayType}
                        onChange={(e) => setFormData({ ...formData, halfDayType: e.target.value })}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="AM">오전 반차</option>
                        <option value="PM">오후 반차</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label required>시작일</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: formData.halfDay ? e.target.value : formData.endDate })}
                    required
                  />
                </div>
                <div>
                  <Label required>종료일</Label>
                  <Input
                    type="date"
                    value={formData.endDate || formData.startDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.halfDay}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>신청 사유</Label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="휴가 사유를 입력해주세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  신청 일수: <span className="font-bold text-blue-600">{calculateDays()}일</span>
                </div>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createMutation.isPending || !formData.startDate}
                >
                  {createMutation.isPending ? "신청 중..." : "휴가 신청"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 휴가 신청 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            휴가 신청 내역
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leavesData?.data?.items?.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              휴가 신청 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {leavesData?.data?.items?.map((leave: Leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(leave.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {LEAVE_TYPE_LABELS[leave.type as keyof typeof LEAVE_TYPE_LABELS]}
                        </span>
                        {leave.halfDay && (
                          <span className="text-xs text-gray-500">(반차)</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatKoreanDate(new Date(leave.startDate))}
                        {leave.startDate !== leave.endDate && (
                          <> ~ {formatKoreanDate(new Date(leave.endDate))}</>
                        )}
                        {" · "}{leave.days}일
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(leave.status)}
                    {leave.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={async () => {
                          await fetch(`/api/leaves/${leave.id}`, { method: "DELETE" });
                          queryClient.invalidateQueries({ queryKey: ["myLeaves"] });
                        }}
                      >
                        취소
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
