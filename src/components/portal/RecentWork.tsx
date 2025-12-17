"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, X, FileText, Users, Calendar, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// 작업 유형별 아이콘
const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  employee: Users,
  leave: Calendar,
  approval: FileText,
  document: FileText,
  default: Briefcase,
};

export interface RecentWorkItem {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  type: string;
  timestamp: string; // ISO string
}

interface RecentWorkProps {
  className?: string;
  maxItems?: number;
}

const STORAGE_KEY = "jahr_recent_work";

export function RecentWork({ className, maxItems = 10 }: RecentWorkProps) {
  const [recentItems, setRecentItems] = useState<RecentWorkItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // localStorage에서 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recent work:", error);
    }
  }, []);

  // 현재 경로를 최근 작업에 추가
  useEffect(() => {
    if (!pathname || pathname === "/" || pathname === "/login") {
      return;
    }

    // 페이지 제목 추출 (간단한 방식)
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    // 동적 세그먼트(ID)인 경우 스킵
    if (/^[0-9a-f-]{36}$/i.test(lastSegment) || /^\d+$/.test(lastSegment)) {
      return;
    }

    const titleMap: Record<string, string> = {
      dashboard: "대시보드",
      profile: "내 정보",
      attendance: "근태 관리",
      leave: "휴가 신청",
      salary: "급여 명세서",
      evaluation: "평가",
      training: "교육",
      approval: "결재함",
      notifications: "알림",
      settings: "설정",
      employees: "직원 관리",
      organization: "조직 관리",
    };

    const type = segments[1] || "default";
    const title = titleMap[lastSegment] || lastSegment;

    const newItem: RecentWorkItem = {
      id: pathname,
      href: pathname,
      title,
      subtitle: segments[0] === "admin" ? "관리자" : "포탈",
      type,
      timestamp: new Date().toISOString(),
    };

    setRecentItems((prev) => {
      // 중복 제거 후 추가
      const filtered = prev.filter((item) => item.id !== newItem.id);
      const updated = [newItem, ...filtered].slice(0, maxItems);
      
      // localStorage에 저장
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recent work:", error);
      }
      
      return updated;
    });
  }, [pathname, maxItems]);

  // 항목 삭제
  const removeItem = useCallback((id: string) => {
    setRecentItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recent work:", error);
      }
      return updated;
    });
  }, []);

  // 전체 삭제
  const clearAll = useCallback(() => {
    setRecentItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recent work:", error);
    }
  }, []);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
          isOpen && "bg-gray-100 text-gray-900"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Clock className="w-4 h-4" />
        <span className="hidden md:inline">최근 작업</span>
      </button>

      {isOpen && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 드롭다운 */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">최근 작업</h3>
              {recentItems.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  전체 삭제
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {recentItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">최근 작업 내역이 없습니다</p>
                </div>
              ) : (
                <ul className="py-2">
                  {recentItems.map((item) => {
                    const Icon = typeIcons[item.type] || typeIcons.default;
                    const timeAgo = formatDistanceToNow(new Date(item.timestamp), {
                      addSuffix: true,
                      locale: ko,
                    });

                    return (
                      <li key={item.id} className="group relative">
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="p-1.5 rounded-lg bg-gray-100">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.subtitle} · {timeAgo}
                            </p>
                          </div>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`${item.title} 삭제`}
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 최근 작업 추가 유틸리티 (외부에서 사용)
export function addRecentWork(item: Omit<RecentWorkItem, "timestamp">) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const items: RecentWorkItem[] = stored ? JSON.parse(stored) : [];
    
    const newItem: RecentWorkItem = {
      ...item,
      timestamp: new Date().toISOString(),
    };
    
    const filtered = items.filter((i) => i.id !== newItem.id);
    const updated = [newItem, ...filtered].slice(0, 10);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to add recent work:", error);
  }
}
