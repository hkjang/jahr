"use client";

/**
 * useUnsavedChangesWarning - 미저장 변경사항 경고 훅
 * 탭 닫기 또는 페이지 이탈 시 사용자에게 경고 표시
 */

import { useEffect, useCallback, useRef } from "react";
import { useTabStore } from "@/lib/stores/tab-store";

interface UseUnsavedChangesWarningOptions {
  enabled?: boolean;
  message?: string;
  onBeforeUnload?: () => void;
}

interface UseUnsavedChangesWarningReturn {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  markAsSaved: () => void;
  markAsModified: () => void;
  confirmNavigation: () => boolean;
}

export function useUnsavedChangesWarning(
  options: UseUnsavedChangesWarningOptions = {}
): UseUnsavedChangesWarningReturn {
  const {
    enabled = true,
    message = "저장되지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?",
    onBeforeUnload,
  } = options;

  const { getActiveTab, updateTabState } = useTabStore();
  const hasUnsavedChangesRef = useRef(false);

  // 현재 탭의 수정 상태 가져오기
  const activeTab = getActiveTab();
  const hasUnsavedChanges = activeTab?.isModified ?? false;

  // 수정 상태 설정
  const setHasUnsavedChanges = useCallback(
    (value: boolean) => {
      hasUnsavedChangesRef.current = value;
      const tab = getActiveTab();
      if (tab) {
        updateTabState(tab.id, { isModified: value });
      }
    },
    [getActiveTab, updateTabState]
  );

  // 저장됨으로 표시
  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, [setHasUnsavedChanges]);

  // 수정됨으로 표시
  const markAsModified = useCallback(() => {
    setHasUnsavedChanges(true);
  }, [setHasUnsavedChanges]);

  // 네비게이션 확인
  const confirmNavigation = useCallback(() => {
    if (hasUnsavedChangesRef.current) {
      return window.confirm(message);
    }
    return true;
  }, [message]);

  // beforeunload 이벤트 핸들러
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const tab = getActiveTab();
      if (tab?.isModified || hasUnsavedChangesRef.current) {
        onBeforeUnload?.();
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, message, onBeforeUnload, getActiveTab]);

  return {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    markAsSaved,
    markAsModified,
    confirmNavigation,
  };
}
