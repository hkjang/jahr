"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button, Badge } from "@/components/ui";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  ChevronRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export type NotificationType = "info" | "warning" | "success" | "error";
export type NotificationPriority = "high" | "normal" | "low";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionHref?: string;
  actionLabel?: string;
  priority: NotificationPriority;
  createdAt: string; // ISO string
  category?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll?: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

// 타입별 아이콘 및 색상
const typeConfig: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }> = {
  info: { icon: Info, color: "text-blue-500", bgColor: "bg-blue-100" },
  warning: { icon: AlertTriangle, color: "text-orange-500", bgColor: "bg-orange-100" },
  success: { icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-100" },
  error: { icon: XCircle, color: "text-red-500", bgColor: "bg-red-100" },
};

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onSettingsClick,
  className,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  // 우선순위 순 정렬
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">알림</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="알림 설정"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* 필터 및 액션 */}
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 text-sm rounded-lg transition-colors",
              filter === "all"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            전체
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={cn(
              "px-3 py-1 text-sm rounded-lg transition-colors",
              filter === "unread"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            읽지 않음 ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            모두 읽음
          </button>
        )}
      </div>

      {/* 알림 목록 */}
      <div className="max-h-[400px] overflow-y-auto">
        {sortedNotifications.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">
              {filter === "unread" ? "읽지 않은 알림이 없습니다" : "알림이 없습니다"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sortedNotifications.map((notification) => {
              const { icon: Icon, color, bgColor } = typeConfig[notification.type];
              const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: ko,
              });

              return (
                <li
                  key={notification.id}
                  className={cn(
                    "relative group",
                    !notification.read && "bg-blue-50/50"
                  )}
                >
                  <div className="px-4 py-3 flex items-start gap-3">
                    {/* 우선순위 표시 */}
                    {notification.priority === "high" && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                    )}

                    {/* 아이콘 */}
                    <div className={cn("p-2 rounded-lg flex-shrink-0", bgColor)}>
                      <Icon className={cn("w-4 h-4", color)} />
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn(
                            "text-sm",
                            !notification.read ? "font-semibold text-gray-900" : "text-gray-700"
                          )}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>

                        {/* 읽지 않음 표시 */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo}
                        </span>

                        {notification.actionHref && (
                          <Link
                            href={notification.actionHref}
                            onClick={() => onMarkAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {notification.actionLabel || "바로가기"}
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                          aria-label="읽음으로 표시"
                        >
                          <Check className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(notification.id)}
                        className="p-1 hover:bg-red-100 rounded"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 푸터 */}
      {notifications.length > 0 && onClearAll && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClearAll}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            모든 알림 삭제
          </button>
        </div>
      )}
    </div>
  );
}

// 알림 벨 아이콘 (헤더용)
interface NotificationBellProps {
  count: number;
  onClick: () => void;
  className?: string;
}

export function NotificationBell({ count, onClick, className }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 hover:bg-gray-100 rounded-lg transition-colors",
        className
      )}
      aria-label={`알림 ${count}개`}
    >
      <Bell className="w-5 h-5 text-gray-600" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
