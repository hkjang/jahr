"use client";

/**
 * TabBar - 메인 탭 바 컴포넌트
 * 글로벌 헤더 하단에 고정 배치
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTabStore } from "@/lib/stores/tab-store";
import { TabItem } from "./TabItem";
import { TabContextMenu } from "./TabContextMenu";
import {
  ChevronLeft,
  ChevronRight,
  History,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react";

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    tabs,
    activeTabId,
    history,
    activateTab,
    closeTab,
    closeOtherTabs,
    closeRightTabs,
    closeAllTabs,
    pinTab,
    unpinTab,
    reorderTabs,
    restoreFromHistory,
  } = useTabStore();

  // 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    tabId: string;
    isPinned: boolean;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    tabId: "",
    isPinned: false,
  });

  // 히스토리 드롭다운 상태
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  // 스크롤 상태
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 드래그 상태
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // 스크롤 가능 여부 체크
  const checkScrollable = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  }, []);

  useEffect(() => {
    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [checkScrollable, tabs.length]);

  // 스크롤 핸들러
  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollable, 300);
    }
  };

  // 컨텍스트 메뉴 열기
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab) {
        setContextMenu({
          isOpen: true,
          position: { x: e.clientX, y: e.clientY },
          tabId,
          isPinned: tab.isPinned,
        });
      }
    },
    [tabs]
  );

  // 컨텍스트 메뉴 닫기
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // 드래그 앤 드롭 핸들러
  const handleDragStart = useCallback(
    (e: React.DragEvent, tabId: string) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", tabId);
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetTabId: string) => {
      e.preventDefault();
      const draggedTabId = e.dataTransfer.getData("text/plain");

      if (draggedTabId && draggedTabId !== targetTabId) {
        const fromIndex = tabs.findIndex((t) => t.id === draggedTabId);
        const toIndex = tabs.findIndex((t) => t.id === targetTabId);

        if (fromIndex !== -1 && toIndex !== -1) {
          reorderTabs(fromIndex, toIndex);
        }
      }
      setDragOverIndex(null);
    },
    [tabs, reorderTabs]
  );

  // 히스토리 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        historyRef.current &&
        !historyRef.current.contains(e.target as Node)
      ) {
        setShowHistory(false);
      }
    };

    if (showHistory) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showHistory]);

  // 현재 경로와 활성 탭 동기화
  useEffect(() => {
    const currentTab = tabs.find((t) => t.path === pathname);
    if (currentTab && currentTab.id !== activeTabId) {
      activateTab(currentTab.id);
    }
  }, [pathname, tabs, activeTabId, activateTab]);

  // 탭이 없으면 렌더링하지 않음
  if (tabs.length === 0) return null;

  return (
    <div className="sticky top-16 z-20 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center h-10">
        {/* 왼쪽 스크롤 버튼 */}
        {canScrollLeft && (
          <button
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            onClick={() => handleScroll("left")}
            aria-label="왼쪽으로 스크롤"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* 탭 목록 */}
        <div
          ref={scrollRef}
          className="flex-1 flex overflow-x-auto scrollbar-hide"
          onScroll={checkScrollable}
          role="tablist"
        >
          {tabs.map((tab, index) => (
            <TabItem
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onActivate={(id) => {
                activateTab(id);
                router.push(tab.path);
              }}
              onClose={closeTab}
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* 오른쪽 스크롤 버튼 */}
        {canScrollRight && (
          <button
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            onClick={() => handleScroll("right")}
            aria-label="오른쪽으로 스크롤"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* 히스토리 버튼 */}
        <div className="relative flex-shrink-0" ref={historyRef}>
          <button
            className={cn(
              "p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors",
              history.length === 0 && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => history.length > 0 && setShowHistory(!showHistory)}
            disabled={history.length === 0}
            aria-label="최근 닫은 탭"
          >
            <History className="w-4 h-4" />
          </button>

          {/* 히스토리 드롭다운 */}
          {showHistory && history.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-64 py-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                최근 닫은 탭
              </div>
              {history.slice(0, 10).map((item) => (
                <button
                  key={item.id}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    restoreFromHistory(item.id);
                    router.push(item.path);
                    setShowHistory(false);
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 더보기 버튼 (향후 확장용) */}
        <button
          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors border-l border-gray-700"
          aria-label="더보기"
          onClick={() => {}}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 컨텍스트 메뉴 */}
      <TabContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        tabId={contextMenu.tabId}
        isPinned={contextMenu.isPinned}
        onClose={handleCloseContextMenu}
        onCloseTab={closeTab}
        onCloseOtherTabs={closeOtherTabs}
        onCloseRightTabs={closeRightTabs}
        onCloseAllTabs={closeAllTabs}
        onPinTab={pinTab}
        onUnpinTab={unpinTab}
      />

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
