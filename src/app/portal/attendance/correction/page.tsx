"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/components/ui";
import { Clock, ArrowLeft, Send, AlertCircle } from "lucide-react";

export default function AttendanceCorrectionPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    date: "",
    originalCheckIn: "",
    originalCheckOut: "",
    correctedCheckIn: "",
    correctedCheckOut: "",
    reason: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/attendance/correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit");
      }
      return res.json();
    },
    onSuccess: () => {
      alert("근태 정정 신청이 완료되었습니다.");
      router.push("/portal/attendance");
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = "날짜를 선택하세요.";
    if (!formData.correctedCheckIn && !formData.correctedCheckOut) {
      newErrors.correctedCheckIn = "정정할 시간을 입력하세요.";
    }
    if (!formData.reason.trim()) newErrors.reason = "정정 사유를 입력하세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">근태 정정 신청</h1>
          <p className="text-gray-500 mt-1">출퇴근 기록을 정정 신청합니다.</p>
        </div>
      </div>

      {/* 안내 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-medium">근태 정정 안내</p>
          <p className="mt-1">정정 신청 후 관리자 승인이 필요합니다. 승인 전까지 기존 기록이 유지됩니다.</p>
        </div>
      </div>

      {/* 신청 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            정정 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 날짜 */}
            <div className="space-y-2">
              <Label>정정 날짜 *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>

            {/* 기존 시간 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-500">기존 출근 시간</Label>
                <Input
                  type="time"
                  value={formData.originalCheckIn}
                  onChange={(e) => setFormData({ ...formData, originalCheckIn: e.target.value })}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-500">기존 퇴근 시간</Label>
                <Input
                  type="time"
                  value={formData.originalCheckOut}
                  onChange={(e) => setFormData({ ...formData, originalCheckOut: e.target.value })}
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* 정정 시간 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>정정 출근 시간</Label>
                <Input
                  type="time"
                  value={formData.correctedCheckIn}
                  onChange={(e) => setFormData({ ...formData, correctedCheckIn: e.target.value })}
                  className={errors.correctedCheckIn ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>정정 퇴근 시간</Label>
                <Input
                  type="time"
                  value={formData.correctedCheckOut}
                  onChange={(e) => setFormData({ ...formData, correctedCheckOut: e.target.value })}
                />
              </div>
            </div>
            {errors.correctedCheckIn && (
              <p className="text-sm text-red-500">{errors.correctedCheckIn}</p>
            )}

            {/* 사유 */}
            <div className="space-y-2">
              <Label>정정 사유 *</Label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                placeholder="정정 사유를 상세히 입력하세요..."
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.reason ? "border-red-500" : ""
                }`}
              />
              {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                취소
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={createMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {createMutation.isPending ? "신청 중..." : "정정 신청"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
