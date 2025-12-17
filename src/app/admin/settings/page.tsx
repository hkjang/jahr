"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/components/ui";
import { Settings, Building2, Clock, Calendar, DollarSign, Bell, Save } from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: unknown;
  category: string;
  description: string | null;
}

async function fetchSettings() {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const categoryIcons: Record<string, typeof Settings> = {
  company: Building2,
  attendance: Clock,
  leave: Calendar,
  salary: DollarSign,
  notification: Bell,
};

const categoryLabels: Record<string, string> = {
  company: "회사 정보",
  attendance: "근태 설정",
  leave: "휴가 설정",
  salary: "급여 설정",
  notification: "알림 설정",
};

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [editedSettings, setEditedSettings] = useState<Record<string, unknown>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: fetchSettings,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
    },
  });

  const handleSave = (key: string) => {
    if (editedSettings[key] !== undefined) {
      saveMutation.mutate({ key, value: editedSettings[key] });
    }
  };

  const settings = data?.data || {};

  // 기본 설정 (실제 데이터가 없을 때)
  const defaultSettings = {
    company: [
      { key: "company_name", value: "주식회사 JaHR", description: "회사명" },
      { key: "company_address", value: "서울시 강남구", description: "회사 주소" },
      { key: "company_ceo", value: "홍길동", description: "대표이사" },
    ],
    attendance: [
      { key: "work_start_time", value: "09:00", description: "출근 시간" },
      { key: "work_end_time", value: "18:00", description: "퇴근 시간" },
      { key: "late_threshold_minutes", value: 10, description: "지각 판정 (분)" },
    ],
    leave: [
      { key: "annual_leave_days", value: 15, description: "연차 기본 일수" },
      { key: "leave_carryover_days", value: 5, description: "이월 가능 일수" },
    ],
    salary: [
      { key: "salary_payment_day", value: 25, description: "급여 지급일" },
      { key: "income_tax_rate", value: 3.3, description: "소득세율 (%)" },
    ],
    notification: [
      { key: "email_notifications", value: true, description: "이메일 알림" },
      { key: "approval_notifications", value: true, description: "결재 알림" },
    ],
  };

  const displaySettings = Object.keys(settings).length > 0 ? settings : defaultSettings;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-white">시스템 설정</h1>
        <p className="text-gray-400 mt-1">시스템 설정을 관리합니다.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(displaySettings).map(([category, items]) => {
            const Icon = categoryIcons[category] || Settings;
            return (
              <Card key={category} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Icon className="w-5 h-5 text-blue-400" />
                    {categoryLabels[category] || category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(items as Setting[]).map((setting) => (
                    <div key={setting.key} className="space-y-2">
                      <Label className="text-gray-300">
                        {setting.description || setting.key}
                      </Label>
                      <div className="flex gap-2">
                        {typeof setting.value === "boolean" ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                editedSettings[setting.key] !== undefined
                                  ? Boolean(editedSettings[setting.key])
                                  : Boolean(setting.value)
                              }
                              onChange={(e) =>
                                setEditedSettings({
                                  ...editedSettings,
                                  [setting.key]: e.target.checked,
                                })
                              }
                              className="w-4 h-4 rounded border-gray-600"
                            />
                            <span className="text-white text-sm">
                              {editedSettings[setting.key] !== undefined
                                ? editedSettings[setting.key]
                                  ? "활성화"
                                  : "비활성화"
                                : setting.value
                                ? "활성화"
                                : "비활성화"}
                            </span>
                          </label>
                        ) : (
                          <Input
                            type={typeof setting.value === "number" ? "number" : "text"}
                            value={
                              editedSettings[setting.key] !== undefined
                                ? String(editedSettings[setting.key])
                                : String(setting.value)
                            }
                            onChange={(e) =>
                              setEditedSettings({
                                ...editedSettings,
                                [setting.key]:
                                  typeof setting.value === "number"
                                    ? Number(e.target.value)
                                    : e.target.value,
                              })
                            }
                            className="bg-gray-900 border-gray-700 text-white flex-1"
                          />
                        )}
                        {editedSettings[setting.key] !== undefined && (
                          <Button
                            size="sm"
                            onClick={() => handleSave(setting.key)}
                            disabled={saveMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
