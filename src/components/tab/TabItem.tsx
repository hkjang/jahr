"use client";

/**
 * TabItem - 개별 탭 컴포넌트
 * 탭 상태 표시, 클릭, 닫기, 드래그 앤 드롭 지원
 */

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Tab } from "@/types/tab";
import {
  X,
  Pin,
  Loader2,
  AlertCircle,
  Lock,
  Circle,
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Calendar,
  CreditCard,
  TrendingUp,
  GraduationCap,
  FileCheck,
  BarChart3,
  Settings,
  Shield,
  Database,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

// 아이콘 매핑
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Calendar,
  CreditCard,
  TrendingUp,
  GraduationCap,
  FileCheck,
  BarChart3,
  Settings,
  Shield,
  Database,
  Briefcase,
};

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onActivate: (tabId: string) => void;
  onClose: (tabId: string) => void;
  onContextMenu?: (e: React.MouseEvent, tabId: string) => void;
  onDragStart?: (e: React.DragEvent, tabId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, tabId: string) => void;
}

export function TabItem({
  tab,
  isActive,
  onActivate,
  onClose,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop,
}: TabItemProps) {
  const router = useRouter();
  const IconComponent = tab.icon ? iconMap[tab.icon] : null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onActivate(tab.id);
    router.push(tab.path);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose(tab.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(e, tab.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (tab.isPinned) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", tab.id);
    onDragStart?.(e, tab.id);
  };

  return (
    <div
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] cursor-pointer select-none",
        "border-r border-gray-700/50 transition-all duration-150",
        isActive
          ? "bg-gray-800 text-white border-b-2 border-b-blue-500"
          : "bg-gray-900/50 text-gray-400 hover:bg-gray-800/50 hover:text-gray-200",
        tab.hasError && "text-red-400",
        tab.isLocked && "opacity-75"
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      draggable={!tab.isPinned}
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, tab.id)}
    >
      {/* 아이콘 또는 상태 표시 */}
      <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        {tab.isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
        ) : tab.hasError ? (
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
        ) : tab.isLocked ? (
          <Lock className="w-3.5 h-3.5 text-yellow-400" />
        ) : tab.isPinned ? (
          <Pin className="w-3.5 h-3.5 text-blue-400" />
        ) : IconComponent ? (
          <IconComponent className="w-3.5 h-3.5" />
        ) : null}
      </div>

      {/* 탭 제목 */}
      <span className="flex-1 truncate text-sm font-medium">{tab.title}</span>

      {/* 수정됨 표시 */}
      {tab.isModified && (
        <Circle
          className="w-2 h-2 fill-blue-400 text-blue-400 flex-shrink-0"
          aria-label="수정됨"
        />
      )}

      {/* 닫기 버튼 (고정 탭이 아닌 경우만) */}
      {!tab.isPinned && (
        <button
          className={cn(
            "flex-shrink-0 p-0.5 rounded hover:bg-gray-600/50 transition-opacity",
            isActive
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
          onClick={handleClose}
          aria-label={`${tab.title} 탭 닫기`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
