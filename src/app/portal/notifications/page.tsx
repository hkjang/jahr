"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

async function fetchNotifications() {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function PortalNotificationsPage() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // 모의 데이터
  const mockNotifications: Notification[] = [
    {
      id: "1",
      title: "휴가 신청이 승인되었습니다",
      message: "12월 25일~27일 연차 휴가가 승인되었습니다.",
      link: "/portal/leave",
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "새로운 결재 요청",
      message: "박팀원님이 휴가 신청을 요청했습니다.",
      link: "/portal/approval",
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      title: "급여 명세서가 발행되었습니다",
      message: "2024년 12월 급여 명세서를 확인해 주세요.",
      link: "/portal/salary",
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "4",
      title: "교육 수강 안내",
      message: "리더십 역량 강화 교육이 곧 시작됩니다.",
      link: "/portal/training",
      isRead: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const notifications = data?.data?.notifications || mockNotifications;
  const unreadCount = data?.data?.unreadCount || notifications.filter((n: Notification) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">알림</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "모든 알림을 확인했습니다"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            모두 읽음 처리
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">알림이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: Notification) => (
            <Card 
              key={notification.id}
              className={`transition-colors ${
                notification.isRead ? "bg-gray-50" : "bg-white border-blue-200"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.isRead ? "bg-gray-200" : "bg-blue-100"
                  }`}>
                    <Bell className={`w-5 h-5 ${
                      notification.isRead ? "text-gray-500" : "text-blue-600"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`font-medium ${
                          notification.isRead ? "text-gray-600" : "text-gray-900"
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatKoreanDate(new Date(notification.createdAt))}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markReadMutation.mutate([notification.id])}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {notification.link && (
                          <Link href={notification.link}>
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
