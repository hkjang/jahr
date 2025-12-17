"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/components/ui";
import { Settings, Bell, Shield, Moon, Globe, Save } from "lucide-react";

export default function PortalSettingsPage() {
  const { data: session } = useSession();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    approvalNotifications: true,
    leaveNotifications: true,
    darkMode: false,
    language: "ko",
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-gray-500 mt-1">알림 및 개인 설정을 관리합니다.</p>
      </div>

      {/* 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            알림 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">이메일 알림</p>
              <p className="text-sm text-gray-500">중요 알림을 이메일로 받습니다</p>
            </div>
            <button
              onClick={() => handleToggle("emailNotifications")}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.emailNotifications ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                settings.emailNotifications ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">푸시 알림</p>
              <p className="text-sm text-gray-500">브라우저 푸시 알림을 받습니다</p>
            </div>
            <button
              onClick={() => handleToggle("pushNotifications")}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.pushNotifications ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                settings.pushNotifications ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">결재 알림</p>
              <p className="text-sm text-gray-500">결재 요청/승인 시 알림</p>
            </div>
            <button
              onClick={() => handleToggle("approvalNotifications")}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.approvalNotifications ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                settings.approvalNotifications ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">휴가 알림</p>
              <p className="text-sm text-gray-500">휴가 승인/반려 시 알림</p>
            </div>
            <button
              onClick={() => handleToggle("leaveNotifications")}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.leaveNotifications ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                settings.leaveNotifications ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 화면 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-blue-500" />
            화면 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">다크 모드</p>
              <p className="text-sm text-gray-500">어두운 테마를 사용합니다</p>
            </div>
            <button
              onClick={() => handleToggle("darkMode")}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.darkMode ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                settings.darkMode ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">언어</p>
              <p className="text-sm text-gray-500">표시 언어를 선택합니다</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 보안 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            보안
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            비밀번호 변경
          </Button>
          <Button variant="outline" className="w-full justify-start">
            로그인 기록 확인
          </Button>
        </CardContent>
      </Card>

      <Button className="w-full bg-blue-600 hover:bg-blue-700">
        <Save className="w-4 h-4 mr-2" />
        설정 저장
      </Button>
    </div>
  );
}
