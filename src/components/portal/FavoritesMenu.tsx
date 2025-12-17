"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Star, StarOff, X, GripVertical } from "lucide-react";
import {
  LayoutDashboard,
  User,
  Calendar,
  Clock,
  CreditCard,
  TrendingUp,
  GraduationCap,
  FileCheck,
  Bell,
  Settings,
  Building2,
  Receipt,
  Award,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 메뉴 아이콘 맵
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  profile: User,
  attendance: Clock,
  leave: Calendar,
  salary: CreditCard,
  evaluation: TrendingUp,
  training: GraduationCap,
  approval: FileCheck,
  notifications: Bell,
  settings: Settings,
  organization: Building2,
  expense: Receipt,
  certificates: Award,
  overtime: Briefcase,
};

export interface FavoriteMenuItem {
  id: string;
  href: string;
  label: string;
  iconKey: string;
}

interface FavoritesMenuProps {
  className?: string;
  maxItems?: number;
}

const STORAGE_KEY = "jahr_favorites";

// 기본 즐겨찾기 메뉴
const defaultFavorites: FavoriteMenuItem[] = [
  { id: "dashboard", href: "/portal/dashboard", label: "대시보드", iconKey: "dashboard" },
  { id: "leave", href: "/portal/leave", label: "휴가 신청", iconKey: "leave" },
  { id: "attendance", href: "/portal/attendance", label: "근태 관리", iconKey: "attendance" },
];

// 추가 가능한 메뉴 목록
const availableMenus: FavoriteMenuItem[] = [
  { id: "dashboard", href: "/portal/dashboard", label: "대시보드", iconKey: "dashboard" },
  { id: "profile", href: "/portal/profile", label: "내 정보", iconKey: "profile" },
  { id: "attendance", href: "/portal/attendance", label: "근태 관리", iconKey: "attendance" },
  { id: "leave", href: "/portal/leave", label: "휴가 신청", iconKey: "leave" },
  { id: "salary", href: "/portal/salary", label: "급여 명세서", iconKey: "salary" },
  { id: "evaluation", href: "/portal/evaluation", label: "평가", iconKey: "evaluation" },
  { id: "training", href: "/portal/training", label: "교육", iconKey: "training" },
  { id: "approval", href: "/portal/approval", label: "결재함", iconKey: "approval" },
  { id: "expense", href: "/portal/expense", label: "경비 청구", iconKey: "expense" },
  { id: "certificates", href: "/portal/certificates", label: "증명서", iconKey: "certificates" },
  { id: "overtime", href: "/portal/overtime", label: "초과근무", iconKey: "overtime" },
];

export function FavoritesMenu({ className, maxItems = 5 }: FavoritesMenuProps) {
  const [favorites, setFavorites] = useState<FavoriteMenuItem[]>(defaultFavorites);
  const [isEditing, setIsEditing] = useState(false);

  // localStorage에서 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  }, []);

  // localStorage에 저장
  const saveFavorites = useCallback((newFavorites: FavoriteMenuItem[]) => {
    setFavorites(newFavorites);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  }, []);

  // 즐겨찾기 토글
  const toggleFavorite = useCallback(
    (menu: FavoriteMenuItem) => {
      const exists = favorites.some((f) => f.id === menu.id);
      if (exists) {
        saveFavorites(favorites.filter((f) => f.id !== menu.id));
      } else if (favorites.length < maxItems) {
        saveFavorites([...favorites, menu]);
      }
    },
    [favorites, saveFavorites, maxItems]
  );

  // 순서 변경
  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newFavorites = [...favorites];
      const [removed] = newFavorites.splice(fromIndex, 1);
      newFavorites.splice(toIndex, 0, removed);
      saveFavorites(newFavorites);
    },
    [favorites, saveFavorites]
  );

  return (
    <div className={cn("relative", className)}>
      {/* 즐겨찾기 버튼 목록 */}
      <div className="flex items-center gap-1">
        {favorites.map((item, index) => {
          const Icon = iconMap[item.iconKey] || Star;
          return (
            <div key={item.id} className="relative group">
              {isEditing && (
                <button
                  onClick={() => toggleFavorite(item)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label={`${item.label} 즐겨찾기 해제`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  isEditing && "cursor-move"
                )}
                draggable={isEditing}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", index.toString());
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                  moveItem(fromIndex, index);
                }}
              >
                {isEditing && <GripVertical className="w-3 h-3 text-gray-400" />}
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            </div>
          );
        })}

        {/* 편집 버튼 */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isEditing
              ? "bg-blue-100 text-blue-600"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          )}
          aria-label={isEditing ? "편집 완료" : "즐겨찾기 편집"}
        >
          {isEditing ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
        </button>
      </div>

      {/* 편집 모드: 추가 가능한 메뉴 */}
      {isEditing && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-lg border border-gray-200 z-50 min-w-[280px]">
          <p className="text-xs text-gray-500 mb-2">
            즐겨찾기 추가 (최대 {maxItems}개)
          </p>
          <div className="grid grid-cols-2 gap-1">
            {availableMenus
              .filter((menu) => !favorites.some((f) => f.id === menu.id))
              .map((menu) => {
                const Icon = iconMap[menu.iconKey] || Star;
                return (
                  <button
                    key={menu.id}
                    onClick={() => toggleFavorite(menu)}
                    disabled={favorites.length >= maxItems}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon className="w-4 h-4" />
                    {menu.label}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
