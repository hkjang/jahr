"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/components/ui";
import { Calendar, FileText, ArrowLeft, Send } from "lucide-react";
import { LEAVE_TYPE_LABELS } from "@/lib/constants";

export default function LeaveRequestPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const employeeId = (session?.user as any)?.employee?.id;
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          employeeId,
          days: calculateDays(data.startDate, data.endDate),
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      router.push("/portal/leave");
    },
  });

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.startDate) newErrors.startDate = "시작일을 선택하세요.";
    if (!formData.endDate) newErrors.endDate = "종료일을 선택하세요.";
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = "종료일은 시작일 이후여야 합니다.";
    }
    if (!formData.reason.trim()) newErrors.reason = "사유를 입력하세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      submitMutation.mutate(formData);
    }
  };

  const days = calculateDays(formData.startDate, formData.endDate);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">휴가 신청</h1>
          <p className="text-gray-500 mt-1">휴가를 신청합니다.</p>
        </div>
      </div>

      {/* 신청 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            휴가 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 휴가 유형 */}
            <div className="space-y-2">
              <Label>휴가 유형</Label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* 기간 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>시작일</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>종료일</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* 일수 표시 */}
            {days > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700 font-medium">
                  총 <span className="text-xl">{days}</span>일 휴가
                </p>
              </div>
            )}

            {/* 사유 */}
            <div className="space-y-2">
              <Label>휴가 사유</Label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                placeholder="휴가 사유를 입력하세요..."
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.reason ? "border-red-500" : ""
                }`}
              />
              {errors.reason && (
                <p className="text-sm text-red-500">{errors.reason}</p>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={submitMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {submitMutation.isPending ? "신청 중..." : "휴가 신청"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
