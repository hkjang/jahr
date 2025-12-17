"use client";

/**
 * useTabNavigation - 탭 네비게이션 훅
 * 메뉴 클릭, 상태 저장/복원 기능
 */

import { useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTabStore } from "@/lib/stores/tab-store";
import type { CreateTabOptions, TabStateUpdate } from "@/types/tab";

interface UseTabNavigationReturn {
  // 메뉴 클릭 핸들러
  navigateToMenu: (path: string, title: string, menuId: string, icon?: string) => void;
  // 상태 저장
  saveScrollPosition: () => void;
  saveFormData: (data: Record<string, unknown>) => void;
  saveFilterState: (filters: Record<string, unknown>) => void;
  saveSelectedItems: (items: string[]) => void;
  // 상태 복원
  restoreScrollPosition: () => void;
  getFormData: () => Record<string, unknown> | undefined;
  getFilterState: () => Record<string, unknown> | undefined;
  getSelectedItems: () => string[] | undefined;
  // 탭 상태 업데이트
  setModified: (modified: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (hasError: boolean) => void;
  setLocked: (locked: boolean) => void;
  // 유틸
  isTabActive: (path: string) => boolean;
  getCurrentTab: () => ReturnType<typeof useTabStore.getState>["tabs"][0] | undefined;
}

export function useTabNavigation(): UseTabNavigationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const scrollPositionRef = useRef<number>(0);

  const {
    tabs,
    activeTabId,
    openTab,
    activateTab,
    updateTabState,
    getTabByPath,
    getActiveTab,
  } = useTabStore();

  // 메뉴 클릭 핸들러
  const navigateToMenu = useCallback(
    (path: string, title: string, menuId: string, icon?: string) => {
      // 현재 탭 스크롤 위치 저장
      scrollPositionRef.current = window.scrollY;
      const currentTab = getActiveTab();
      if (currentTab) {
        updateTabState(currentTab.id, {
          scrollPosition: scrollPositionRef.current,
        });
      }

      // 탭 열기 (기존 탭이 있으면 활성화)
      openTab({ path, title, menuId, icon });

      // 라우팅
      router.push(path);
    },
    [openTab, router, getActiveTab, updateTabState]
  );

  // 스크롤 위치 저장
  const saveScrollPosition = useCallback(() => {
    const currentTab = getActiveTab();
    if (currentTab) {
      updateTabState(currentTab.id, {
        scrollPosition: window.scrollY,
      });
    }
  }, [getActiveTab, updateTabState]);

  // 스크롤 위치 복원
  const restoreScrollPosition = useCallback(() => {
    const currentTab = getActiveTab();
    if (currentTab && currentTab.scrollPosition) {
      window.scrollTo(0, currentTab.scrollPosition);
    }
  }, [getActiveTab]);

  // 폼 데이터 저장
  const saveFormData = useCallback(
    (data: Record<string, unknown>) => {
      const currentTab = getActiveTab();
      if (currentTab) {
        updateTabState(currentTab.id, {
          formData: data,
          isModified: true,
        });
      }
    },
    [getActiveTab, updateTabState]
  );

  // 폼 데이터 가져오기
  const getFormData = useCallback(() => {
    const currentTab = getActiveTab();
    return currentTab?.formData;
  }, [getActiveTab]);

  // 필터 상태 저장
  const saveFilterState = useCallback(
    (filters: Record<string, unknown>) => {
      const currentTab = getActiveTab();
      if (currentTab) {
        updateTabState(currentTab.id, {
          filterState: filters,
        });
      }
    },
    [getActiveTab, updateTabState]
  );

  // 필터 상태 가져오기
  const getFilterState = useCallback(() => {
    const currentTab = getActiveTab();
    return currentTab?.filterState;
  }, [getActiveTab]);

  // 선택 항목 저장
  const saveSelectedItems = useCallback(
    (items: string[]) => {
      const currentTab = getActiveTab();
      if (currentTab) {
        updateTabState(currentTab.id, {
          selectedItems: items,
        });
      }
    },
    [getActiveTab, updateTabState]
  );

  // 선택 항목 가져오기
  const getSelectedItems = useCallback(() => {
    const currentTab = getActiveTab();
    return currentTab?.selectedItems;
  }, [getActiveTab]);

  // 수정됨 상태 설정
  const setModified = useCallback(
    (modified: boolean) => {
      const currentTab = getActiveTab();
      if (currentTab) {
        updateTabState(currentTab.id, { isModified: modified });
      }
    },
    [getActiveTab, updateTabState]
  );

  // 로딩 상태 설정
  const setLoading = useCallback(
    (loading: boolean) => {
      const currentTab = getActiveTab();
      if (currentTab) {
        updateTabState(currentTab.id, { isLoading: loading });
      }
    },
    [getActiveTab, updateTabState]
  );

  // 에러 상태 설정
  const setError = useCallback(
    (hasError: boolean) => {
      const currentTab = getActiveTab();
      if (currentTab) {
        updateTabState(currentTab.id, { hasError });
      }
    },
    [getActiveTab, updateTabState]
  );

  // 잠금 상태 설정
  const setLocked = useCallback(
    (locked: boolean) => {
      const currentTab = getActiveTab();
      if (currentTab) {
        updateTabState(currentTab.id, { isLocked: locked });
      }
    },
    [getActiveTab, updateTabState]
  );

  // 탭 활성 여부 확인
  const isTabActive = useCallback(
    (path: string) => {
      const tab = getTabByPath(path);
      return tab ? tab.id === activeTabId : false;
    },
    [getTabByPath, activeTabId]
  );

  // 현재 탭 가져오기
  const getCurrentTab = useCallback(() => {
    return getActiveTab();
  }, [getActiveTab]);

  // 스크롤 이벤트로 위치 저장 (디바운스)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveScrollPosition();
      }, 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [saveScrollPosition]);

  // 경로 변경 시 스크롤 위치 복원
  useEffect(() => {
    // 약간의 지연 후 스크롤 복원 (DOM 렌더링 대기)
    const timeoutId = setTimeout(() => {
      restoreScrollPosition();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname, restoreScrollPosition]);

  return {
    navigateToMenu,
    saveScrollPosition,
    saveFormData,
    saveFilterState,
    saveSelectedItems,
    restoreScrollPosition,
    getFormData,
    getFilterState,
    getSelectedItems,
    setModified,
    setLoading,
    setError,
    setLocked,
    isTabActive,
    getCurrentTab,
  };
}
