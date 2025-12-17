"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Label } from "@/components/ui";
import { Clock, Plus, Send, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";

interface Overtime {
  id: string;
  docNumber: string;
  title: string;
  content: {
    date: string;
    startTime: string;
    endTime: string;
    hours: number;
    reason: string;
  };
  status: string;
  createdAt: string;
}

async function fetchOvertimes() {
  const res = await fetch("/api/overtime");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const statusLabels: Record<string, string> = {
  PENDING: "승인대기",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELLED: "취소",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export default function PortalOvertimePage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "18:00",
    endTime: "21:00",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["myOvertimes"],
    queryFn: fetchOvertimes,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/overtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOvertimes"] });
      setShowForm(false);
      setFormData({ date: "", startTime: "18:00", endTime: "21:00", reason: "" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/overtime?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOvertimes"] });
    },
  });

  // 모의 데이터
  const mockOvertimes: Overtime[] = [
    {
      id: "1",
      docNumber: "20241216-OVT-0001",
      title: "초과근무 신청 (2024-12-16)",
      content: { date: "2024-12-16", startTime: "18:00", endTime: "21:00", hours: 3, reason: "프로젝트 마감" },
      status: "APPROVED",
      createdAt: "2024-12-16T10:00:00",
    },
    {
      id: "2",
      docNumber: "20241217-OVT-0001",
      title: "초과근무 신청 (2024-12-17)",
      content: { date: "2024-12-17", startTime: "18:00", endTime: "20:00", hours: 2, reason: "긴급 배포" },
      status: "PENDING",
      createdAt: "2024-12-17T09:00:00",
    },
  ];

  const overtimes = data?.data || mockOvertimes;
  const totalHours = overtimes
    .filter((o: Overtime) => o.status === "APPROVED")
    .reduce((sum: number, o: Overtime) => sum + (o.content?.hours || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.reason) {
      alert("날짜와 사유를 입력하세요.");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">초과근무</h1>
          <p className="text-gray-500 mt-1">초과근무를 신청하고 현황을 확인합니다.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          초과근무 신청
        </Button>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">이번 달 초과근무</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{totalHours}시간</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">승인 대기</p>
            <p className="text-xl font-bold text-yellow-600 mt-1">
              {overtimes.filter((o: Overtime) => o.status === "PENDING").length}건
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">법정 한도</p>
            <p className="text-xl font-bold mt-1">52시간/주</p>
          </CardContent>
        </Card>
      </div>

      {/* 신청 폼 */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-700">초과근무 신청</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>날짜 *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>시작 시간</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>종료 시간</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>사유 *</Label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  placeholder="초과근무 사유를 입력하세요..."
                  className="w-full p-3 border rounded-lg resize-none"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  취소
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? "신청 중..." : "신청하기"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 신청 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            신청 내역
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : overtimes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">신청 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {overtimes.map((ot: Overtime) => (
                <div key={ot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      ot.status === "APPROVED" ? "bg-green-100" :
                      ot.status === "REJECTED" ? "bg-red-100" : "bg-yellow-100"
                    }`}>
                      {ot.status === "APPROVED" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : ot.status === "REJECTED" ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{ot.content?.reason || ot.title}</h4>
                      <p className="text-sm text-gray-500">
                        {ot.content?.date ? formatKoreanDate(new Date(ot.content.date)) : ""} {ot.content?.startTime} ~ {ot.content?.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">{ot.content?.hours || 0}시간</span>
                    <Badge className={statusColors[ot.status]}>{statusLabels[ot.status]}</Badge>
                    {ot.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => cancelMutation.mutate(ot.id)}
                        disabled={cancelMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
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
