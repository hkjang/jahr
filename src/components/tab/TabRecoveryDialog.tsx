"use client";

/**
 * TabRecoveryDialog - 탭 복구 다이얼로그
 * 세션 복구 옵션을 사용자에게 제공
 */

import { useEffect, useState } from "react";
import { useTabRecovery } from "@/hooks/useTabRecovery";
import { cn } from "@/lib/utils";
import { RotateCcw, X, Clock, FileText, AlertTriangle } from "lucide-react";

interface TabRecoveryDialogProps {
  className?: string;
}

export function TabRecoveryDialog({ className }: TabRecoveryDialogProps) {
  const { hasRecoveryData, recoveryData, recover, dismiss } = useTabRecovery();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (hasRecoveryData) {
      // 약간의 지연 후 표시 (부드러운 전환)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasRecoveryData]);

  if (!hasRecoveryData || !recoveryData) return null;

  const timestamp = new Date(recoveryData.timestamp);
  const timeAgo = getTimeAgo(timestamp);
  const tabCount = recoveryData.tabs.filter((t) => !t.isPinned).length;

  const handleRecover = () => {
    setIsVisible(false);
    setTimeout(recover, 300);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(dismiss, 300);
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
        className
      )}
    >
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-5 max-w-sm">
        {/* 헤더 */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">
              이전 세션 복구
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              마지막 세션에서 열린 탭을 복구할 수 있습니다.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* 정보 */}
        <div className="bg-gray-900/50 rounded-lg p-3 mb-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FileText className="w-3.5 h-3.5" />
            <span>{tabCount}개의 탭</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* 탭 미리보기 */}
        {recoveryData.tabs.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">복구될 탭:</p>
            <div className="flex flex-wrap gap-1">
              {recoveryData.tabs.slice(0, 5).map((tab) => (
                <span
                  key={tab.id}
                  className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300 truncate max-w-[120px]"
                >
                  {tab.title}
                </span>
              ))}
              {recoveryData.tabs.length > 5 && (
                <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-500">
                  +{recoveryData.tabs.length - 5}개
                </span>
              )}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            무시
          </button>
          <button
            onClick={handleRecover}
            className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            복구
          </button>
        </div>
      </div>
    </div>
  );
}

// 시간 경과 계산
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (minutes < 1) {
    return "방금 전";
  }
  if (minutes < 60) {
    return `${minutes}분 전`;
  }
  if (hours < 24) {
    return `${hours}시간 전`;
  }
  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
