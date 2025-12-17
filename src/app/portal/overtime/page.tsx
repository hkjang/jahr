"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Label } from "@/components/ui";
import { Clock, Plus, Calendar, Send, CheckCircle, XCircle } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";

interface Overtime {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
  status: string;
}

const statusLabels: Record<string, string> = {
  PENDING: "승인대기",
  APPROVED: "승인",
  REJECTED: "반려",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function PortalOvertimePage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "18:00",
    endTime: "21:00",
    reason: "",
  });

  // 모의 데이터
  const overtimes: Overtime[] = [
    {
      id: "1",
      date: "2024-12-16",
      startTime: "18:00",
      endTime: "21:00",
      hours: 3,
      reason: "프로젝트 마감",
      status: "APPROVED",
    },
    {
      id: "2",
      date: "2024-12-17",
      startTime: "18:00",
      endTime: "20:00",
      hours: 2,
      reason: "긴급 배포",
      status: "PENDING",
    },
  ];

  const totalHours = overtimes.filter(o => o.status === "APPROVED").reduce((sum, o) => sum + o.hours, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("초과근무 신청이 완료되었습니다.");
    setShowForm(false);
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
              {overtimes.filter(o => o.status === "PENDING").length}건
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
                <Label>날짜</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                <Label>사유</Label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  placeholder="초과근무 사유를 입력하세요..."
                  className="w-full p-3 border rounded-lg resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  취소
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  신청하기
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
          <div className="space-y-3">
            {overtimes.map((ot) => (
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
                    <h4 className="font-medium">{ot.reason}</h4>
                    <p className="text-sm text-gray-500">
                      {formatKoreanDate(new Date(ot.date))} {ot.startTime} ~ {ot.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">{ot.hours}시간</span>
                  <Badge className={statusColors[ot.status]}>{statusLabels[ot.status]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
