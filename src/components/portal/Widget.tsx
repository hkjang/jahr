"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  LucideIcon,
} from "lucide-react";
import { WidgetConfig, WidgetSize, WIDGET_SIZE_CLASSES } from "@/lib/dashboard-config";

// 통계 위젯 Props
interface StatsWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: LucideIcon;
  color?: "blue" | "green" | "red" | "purple" | "orange" | "gray";
}

// 리스트 위젯 Props
interface ListWidgetProps {
  title: string;
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    status?: string;
    statusColor?: string;
    href?: string;
  }>;
  emptyMessage?: string;
}

// 차트 위젯 Props
interface ChartWidgetProps {
  title: string;
  chartType: "bar" | "line" | "pie";
  data: Array<{ name: string; value: number; [key: string]: unknown }>;
}

// 색상 맵
const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-500" },
  green: { bg: "bg-green-50", text: "text-green-700", icon: "text-green-500" },
  red: { bg: "bg-red-50", text: "text-red-700", icon: "text-red-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-500" },
  gray: { bg: "bg-gray-50", text: "text-gray-700", icon: "text-gray-500" },
};

// 통계 위젯 컴포넌트
export function StatsWidget({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  color = "blue",
}: StatsWidgetProps) {
  const colors = colorMap[color];
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500";

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            {trend && trendValue && (
              <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{trendValue}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-full ${colors.bg}`}>
              <Icon className={`h-6 w-6 ${colors.icon}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 리스트 위젯 컴포넌트
export function ListWidget({ title, items, emptyMessage = "항목이 없습니다" }: ListWidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>
                  )}
                </div>
                {item.status && (
                  <span
                    className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.statusColor || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 알림 위젯 컴포넌트
interface NotificationWidgetProps {
  title: string;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

export function NotificationWidget({ title, notifications }: NotificationWidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {title}
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
              {notifications.filter((n) => !n.isRead).length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">새 알림이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg transition-colors cursor-pointer ${
                  notification.isRead ? "bg-gray-50" : "bg-blue-50 border-l-4 border-blue-500"
                }`}
              >
                <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">{notification.createdAt}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 위젯 컨테이너 (드래그 앤 드롭 준비)
interface WidgetContainerProps {
  config: WidgetConfig;
  children: React.ReactNode;
}

export function WidgetContainer({ config, children }: WidgetContainerProps) {
  const sizeClass = WIDGET_SIZE_CLASSES[config.size];

  return (
    <div className={`${sizeClass} transition-all duration-200`} data-widget-id={config.id}>
      {children}
    </div>
  );
}

// 대시보드 그리드
interface DashboardGridProps {
  children: React.ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}

// 빈 차트 위젯 (Recharts 동적 로드용)
export function ChartWidget({ title, chartType, data }: ChartWidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <div className="flex items-center justify-center h-full text-gray-500">
          차트 ({chartType}) - {data.length}개 항목
        </div>
      </CardContent>
    </Card>
  );
}
