/**
 * Tab Store - Zustand 기반 탭 상태 관리
 * 브라우저 스타일 탭 네비게이션 시스템의 핵심 스토어
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Tab,
  TabStore,
  TabStoreState,
  CreateTabOptions,
  TabStateUpdate,
  TabHistoryItem,
} from '@/types/tab';

// 고유 ID 생성
const generateTabId = (): string => {
  return `tab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// 초기 상태
const initialState: TabStoreState = {
  tabs: [],
  activeTabId: null,
  maxTabs: 10,
  history: [],
  restoreEnabled: true,
};

// 대시보드 탭 생성
const createDashboardTab = (): Tab => ({
  id: 'dashboard',
  title: '대시보드',
  path: '/admin/dashboard',
  menuId: 'dashboard',
  icon: 'LayoutDashboard',
  isPinned: true,
  isModified: false,
  isLoading: false,
  hasError: false,
  isLocked: false,
  scrollPosition: 0,
  createdAt: Date.now(),
  lastAccessedAt: Date.now(),
});

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 탭 열기
      openTab: (options: CreateTabOptions) => {
        const { path, title, menuId, icon, forceNew } = options;
        const state = get();

        // 동일 경로의 기존 탭 검색 (강제 생성이 아닌 경우)
        if (!forceNew) {
          const existingTab = state.tabs.find(
            (tab) => tab.path === path || tab.menuId === menuId
          );
          if (existingTab) {
            // 기존 탭 활성화
            set({
              activeTabId: existingTab.id,
              tabs: state.tabs.map((tab) =>
                tab.id === existingTab.id
                  ? { ...tab, lastAccessedAt: Date.now() }
                  : tab
              ),
            });
            return;
          }
        }

        // 최대 탭 수 제한 확인
        const unpinnedTabs = state.tabs.filter((tab) => !tab.isPinned);
        if (state.tabs.length >= state.maxTabs && unpinnedTabs.length > 0) {
          // 가장 오래된 비고정 탭 닫기
          const oldestTab = unpinnedTabs.reduce((oldest, tab) =>
            tab.lastAccessedAt < oldest.lastAccessedAt ? tab : oldest
          );
          
          // 히스토리에 추가
          const historyItem: TabHistoryItem = {
            id: oldestTab.id,
            title: oldestTab.title,
            path: oldestTab.path,
            menuId: oldestTab.menuId,
            closedAt: Date.now(),
          };

          set({
            tabs: state.tabs.filter((tab) => tab.id !== oldestTab.id),
            history: [historyItem, ...state.history].slice(0, 20), // 최대 20개 유지
          });
        }

        // 새 탭 생성
        const newTab: Tab = {
          id: generateTabId(),
          title,
          path,
          menuId,
          icon,
          isPinned: false,
          isModified: false,
          isLoading: false,
          hasError: false,
          isLocked: false,
          scrollPosition: 0,
          createdAt: Date.now(),
          lastAccessedAt: Date.now(),
        };

        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        }));
      },

      // 탭 닫기
      closeTab: (tabId: string, force?: boolean) => {
        const state = get();
        const tabToClose = state.tabs.find((tab) => tab.id === tabId);

        if (!tabToClose) return;

        // 고정 탭은 닫기 불가 (대시보드)
        if (tabToClose.isPinned) return;

        // 미저장 변경사항 확인 (force가 아닌 경우)
        if (!force && tabToClose.isModified) {
          const confirmed = window.confirm(
            `"${tabToClose.title}" 탭에 저장되지 않은 변경사항이 있습니다.\n닫으시겠습니까?`
          );
          if (!confirmed) return;
        }

        // 히스토리에 추가
        const historyItem: TabHistoryItem = {
          id: tabToClose.id,
          title: tabToClose.title,
          path: tabToClose.path,
          menuId: tabToClose.menuId,
          closedAt: Date.now(),
        };

        const newTabs = state.tabs.filter((tab) => tab.id !== tabId);
        let newActiveTabId = state.activeTabId;

        // 현재 활성 탭을 닫는 경우
        if (state.activeTabId === tabId) {
          const closedIndex = state.tabs.findIndex((tab) => tab.id === tabId);
          if (newTabs.length > 0) {
            // 오른쪽 탭 또는 왼쪽 탭 활성화
            const nextTab = newTabs[closedIndex] || newTabs[closedIndex - 1];
            newActiveTabId = nextTab?.id || 'dashboard';
          } else {
            newActiveTabId = 'dashboard';
          }
        }

        set({
          tabs: newTabs.length > 0 ? newTabs : [createDashboardTab()],
          activeTabId: newActiveTabId,
          history: [historyItem, ...state.history].slice(0, 20),
        });
      },

      // 다른 탭 모두 닫기
      closeOtherTabs: (tabId: string) => {
        const state = get();
        const tabToKeep = state.tabs.find((tab) => tab.id === tabId);
        const pinnedTabs = state.tabs.filter((tab) => tab.isPinned);

        if (!tabToKeep) return;

        const closedTabs = state.tabs.filter(
          (tab) => tab.id !== tabId && !tab.isPinned
        );
        const historyItems: TabHistoryItem[] = closedTabs.map((tab) => ({
          id: tab.id,
          title: tab.title,
          path: tab.path,
          menuId: tab.menuId,
          closedAt: Date.now(),
        }));

        set({
          tabs: tabToKeep.isPinned
            ? pinnedTabs
            : [...pinnedTabs, tabToKeep],
          activeTabId: tabId,
          history: [...historyItems, ...state.history].slice(0, 20),
        });
      },

      // 오른쪽 탭 모두 닫기
      closeRightTabs: (tabId: string) => {
        const state = get();
        const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);

        if (tabIndex === -1) return;

        const tabsToKeep = state.tabs.slice(0, tabIndex + 1);
        const tabsToClose = state.tabs.slice(tabIndex + 1).filter((tab) => !tab.isPinned);
        const pinnedTabsOnRight = state.tabs.slice(tabIndex + 1).filter((tab) => tab.isPinned);

        const historyItems: TabHistoryItem[] = tabsToClose.map((tab) => ({
          id: tab.id,
          title: tab.title,
          path: tab.path,
          menuId: tab.menuId,
          closedAt: Date.now(),
        }));

        set({
          tabs: [...tabsToKeep, ...pinnedTabsOnRight],
          history: [...historyItems, ...state.history].slice(0, 20),
        });
      },

      // 모든 탭 닫기
      closeAllTabs: () => {
        const state = get();
        const pinnedTabs = state.tabs.filter((tab) => tab.isPinned);
        const unpinnedTabs = state.tabs.filter((tab) => !tab.isPinned);

        const historyItems: TabHistoryItem[] = unpinnedTabs.map((tab) => ({
          id: tab.id,
          title: tab.title,
          path: tab.path,
          menuId: tab.menuId,
          closedAt: Date.now(),
        }));

        const finalTabs = pinnedTabs.length > 0 ? pinnedTabs : [createDashboardTab()];

        set({
          tabs: finalTabs,
          activeTabId: finalTabs[0].id,
          history: [...historyItems, ...state.history].slice(0, 20),
        });
      },

      // 탭 활성화
      activateTab: (tabId: string) => {
        const state = get();
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;

        set({
          activeTabId: tabId,
          tabs: state.tabs.map((t) =>
            t.id === tabId ? { ...t, lastAccessedAt: Date.now() } : t
          ),
        });
      },

      // 탭 고정
      pinTab: (tabId: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, isPinned: true } : tab
          ),
        }));
      },

      // 탭 고정 해제
      unpinTab: (tabId: string) => {
        // 대시보드는 고정 해제 불가
        if (tabId === 'dashboard') return;

        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, isPinned: false } : tab
          ),
        }));
      },

      // 탭 순서 변경
      reorderTabs: (fromIndex: number, toIndex: number) => {
        set((state) => {
          const newTabs = [...state.tabs];
          const [movedTab] = newTabs.splice(fromIndex, 1);
          newTabs.splice(toIndex, 0, movedTab);
          return { tabs: newTabs };
        });
      },

      // 탭 상태 업데이트
      updateTabState: (tabId: string, stateUpdate: TabStateUpdate) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, ...stateUpdate } : tab
          ),
        }));
      },

      // 세션 복원
      restoreSession: () => {
        const state = get();
        if (state.tabs.length === 0) {
          set({ tabs: [createDashboardTab()], activeTabId: 'dashboard' });
        }
      },

      // 세션 저장 (persist 미들웨어가 자동 처리)
      saveSession: () => {
        // persist 미들웨어가 자동으로 처리
      },

      // 세션 초기화
      clearSession: () => {
        set({
          tabs: [createDashboardTab()],
          activeTabId: 'dashboard',
          history: [],
        });
      },

      // 히스토리에서 복원
      restoreFromHistory: (historyId: string) => {
        const state = get();
        const historyItem = state.history.find((h) => h.id === historyId);

        if (!historyItem) return;

        // 히스토리에서 제거
        set({
          history: state.history.filter((h) => h.id !== historyId),
        });

        // 탭 열기
        get().openTab({
          path: historyItem.path,
          title: historyItem.title,
          menuId: historyItem.menuId,
        });
      },

      // 히스토리 초기화
      clearHistory: () => {
        set({ history: [] });
      },

      // 최대 탭 수 설정
      setMaxTabs: (max: number) => {
        set({ maxTabs: Math.max(1, Math.min(max, 20)) });
      },

      // 복원 설정
      setRestoreEnabled: (enabled: boolean) => {
        set({ restoreEnabled: enabled });
      },

      // 경로로 탭 찾기
      getTabByPath: (path: string) => {
        return get().tabs.find((tab) => tab.path === path);
      },

      // 활성 탭 가져오기
      getActiveTab: () => {
        const state = get();
        return state.tabs.find((tab) => tab.id === state.activeTabId);
      },

      // 메뉴 ID로 탭 찾기
      findTabByMenuId: (menuId: string) => {
        return get().tabs.find((tab) => tab.menuId === menuId);
      },
    }),
    {
      name: 'jahr-tab-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        maxTabs: state.maxTabs,
        history: state.history,
        restoreEnabled: state.restoreEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        // 복원 후 대시보드 탭이 없으면 추가
        if (state && state.tabs.length === 0) {
          state.tabs = [createDashboardTab()];
          state.activeTabId = 'dashboard';
        }
        // 대시보드 탭이 있는지 확인
        if (state && !state.tabs.find((tab) => tab.id === 'dashboard')) {
          state.tabs = [createDashboardTab(), ...state.tabs];
        }
      },
    }
  )
);

// 셀렉터 훅들
export const useActiveTab = () => useTabStore((state) => state.getActiveTab());
export const useTabs = () => useTabStore((state) => state.tabs);
export const useActiveTabId = () => useTabStore((state) => state.activeTabId);
export const useTabHistory = () => useTabStore((state) => state.history);
