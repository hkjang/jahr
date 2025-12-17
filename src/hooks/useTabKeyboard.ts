"use client";

/**
 * useTabKeyboard - 탭 키보드 단축키 훅
 */

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTabStore } from "@/lib/stores/tab-store";

interface UseTabKeyboardOptions {
  enabled?: boolean;
}

export function useTabKeyboard(options: UseTabKeyboardOptions = {}) {
  const { enabled = true } = options;
  const router = useRouter();

  const {
    tabs,
    activeTabId,
    history,
    activateTab,
    closeTab,
    restoreFromHistory,
  } = useTabStore();

  // 다음 탭으로 이동
  const goToNextTab = useCallback(() => {
    if (tabs.length <= 1) return;

    const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
    const nextIndex = (currentIndex + 1) % tabs.length;
    const nextTab = tabs[nextIndex];

    if (nextTab) {
      activateTab(nextTab.id);
      router.push(nextTab.path);
    }
  }, [tabs, activeTabId, activateTab, router]);

  // 이전 탭으로 이동
  const goToPrevTab = useCallback(() => {
    if (tabs.length <= 1) return;

    const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    const prevTab = tabs[prevIndex];

    if (prevTab) {
      activateTab(prevTab.id);
      router.push(prevTab.path);
    }
  }, [tabs, activeTabId, activateTab, router]);

  // 현재 탭 닫기
  const closeCurrentTab = useCallback(() => {
    const currentTab = tabs.find((t) => t.id === activeTabId);
    if (currentTab && !currentTab.isPinned) {
      closeTab(currentTab.id);
    }
  }, [tabs, activeTabId, closeTab]);

  // 최근 닫은 탭 복원
  const restoreLastClosedTab = useCallback(() => {
    if (history.length > 0) {
      const lastClosed = history[0];
      restoreFromHistory(lastClosed.id);
      router.push(lastClosed.path);
    }
  }, [history, restoreFromHistory, router]);

  // N번째 탭으로 이동
  const goToNthTab = useCallback(
    (n: number) => {
      const tabIndex = n - 1;
      if (tabIndex >= 0 && tabIndex < tabs.length) {
        const tab = tabs[tabIndex];
        activateTab(tab.id);
        router.push(tab.path);
      } else if (n === 9 && tabs.length > 0) {
        // Ctrl+9는 마지막 탭으로 이동
        const lastTab = tabs[tabs.length - 1];
        activateTab(lastTab.id);
        router.push(lastTab.path);
      }
    },
    [tabs, activateTab, router]
  );

  // 키보드 이벤트 핸들러
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서는 비활성화
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + Tab: 다음 탭
      if ((e.ctrlKey || e.metaKey) && e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          goToPrevTab();
        } else {
          goToNextTab();
        }
        return;
      }

      // Ctrl/Cmd + W: 탭 닫기
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        closeCurrentTab();
        return;
      }

      // Ctrl/Cmd + Shift + T: 최근 닫은 탭 복원
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "T") {
        e.preventDefault();
        restoreLastClosedTab();
        return;
      }

      // Ctrl/Cmd + 1~9: N번째 탭으로 이동
      if ((e.ctrlKey || e.metaKey) && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        goToNthTab(parseInt(e.key, 10));
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    goToNextTab,
    goToPrevTab,
    closeCurrentTab,
    restoreLastClosedTab,
    goToNthTab,
  ]);

  return {
    goToNextTab,
    goToPrevTab,
    closeCurrentTab,
    restoreLastClosedTab,
    goToNthTab,
  };
}
