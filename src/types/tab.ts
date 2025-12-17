/**
 * Tab-based Navigation System Types
 * 탭 기반 네비게이션 시스템 타입 정의
 */

// 탭 상태 타입
export type TabStatus = 'idle' | 'loading' | 'error' | 'modified' | 'saved';

// 개별 탭 인터페이스
export interface Tab {
  id: string;
  title: string;
  path: string;
  menuId: string;
  icon?: string;
  isPinned: boolean;
  isModified: boolean;
  isLoading: boolean;
  hasError: boolean;
  isLocked: boolean;
  scrollPosition: number;
  formData?: Record<string, unknown>;
  filterState?: Record<string, unknown>;
  selectedItems?: string[];
  createdAt: number;
  lastAccessedAt: number;
}

// 탭 생성 옵션
export interface CreateTabOptions {
  path: string;
  title: string;
  menuId: string;
  icon?: string;
  forceNew?: boolean; // 새 창 열기 시 강제 생성
}

// 탭 상태 업데이트
export interface TabStateUpdate {
  isModified?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
  isLocked?: boolean;
  scrollPosition?: number;
  formData?: Record<string, unknown>;
  filterState?: Record<string, unknown>;
  selectedItems?: string[];
}

// 탭 히스토리 항목
export interface TabHistoryItem {
  id: string;
  title: string;
  path: string;
  menuId: string;
  closedAt: number;
}

// 탭 스토어 상태
export interface TabStoreState {
  tabs: Tab[];
  activeTabId: string | null;
  maxTabs: number;
  history: TabHistoryItem[];
  restoreEnabled: boolean;
}

// 탭 스토어 액션
export interface TabStoreActions {
  // 탭 조작
  openTab: (options: CreateTabOptions) => void;
  closeTab: (tabId: string, force?: boolean) => void;
  closeOtherTabs: (tabId: string) => void;
  closeRightTabs: (tabId: string) => void;
  closeAllTabs: () => void;
  activateTab: (tabId: string) => void;
  
  // 탭 속성
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  updateTabState: (tabId: string, state: TabStateUpdate) => void;
  
  // 세션 관리
  restoreSession: () => void;
  saveSession: () => void;
  clearSession: () => void;
  
  // 히스토리
  restoreFromHistory: (historyId: string) => void;
  clearHistory: () => void;
  
  // 설정
  setMaxTabs: (max: number) => void;
  setRestoreEnabled: (enabled: boolean) => void;
  
  // 유틸
  getTabByPath: (path: string) => Tab | undefined;
  getActiveTab: () => Tab | undefined;
  findTabByMenuId: (menuId: string) => Tab | undefined;
}

// 전체 탭 스토어
export type TabStore = TabStoreState & TabStoreActions;

// 탭 컨텍스트 메뉴 아이템
export interface TabContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

// 탭 드래그 앤 드롭 데이터
export interface TabDragData {
  tabId: string;
  fromIndex: number;
}

// 탭 설정
export interface TabSettings {
  maxTabs: number;
  restoreEnabled: boolean;
  showCloseButton: boolean;
  enableKeyboardShortcuts: boolean;
  autoSaveInterval: number; // ms
}

// 기본 설정값
export const DEFAULT_TAB_SETTINGS: TabSettings = {
  maxTabs: 10,
  restoreEnabled: true,
  showCloseButton: true,
  enableKeyboardShortcuts: true,
  autoSaveInterval: 5000,
};

// 대시보드 기본 탭
export const DASHBOARD_TAB: Omit<Tab, 'id' | 'createdAt' | 'lastAccessedAt'> = {
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
};
