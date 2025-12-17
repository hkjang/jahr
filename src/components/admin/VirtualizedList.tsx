"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface VirtualizedListProps<T> {
  items: T[];
  rowHeight: number;
  renderRow: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  loadingMore?: boolean;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  emptyMessage?: string;
  keyExtractor?: (item: T, index: number) => string;
}

/**
 * 대량 데이터 최적화 가상 스크롤 리스트
 * @tanstack/react-virtual 대신 직접 구현하여 의존성 최소화
 */
export function VirtualizedList<T>({
  items,
  rowHeight,
  renderRow,
  overscan = 5,
  className,
  loadingMore = false,
  onEndReached,
  endReachedThreshold = 200,
  emptyMessage = "데이터가 없습니다",
  keyExtractor,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // 컨테이너 크기 관찰
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    setContainerHeight(container.clientHeight);

    return () => resizeObserver.disconnect();
  }, []);

  // 스크롤 핸들러
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      setScrollTop(target.scrollTop);

      // 끝에 도달 감지
      if (onEndReached) {
        const isNearEnd =
          target.scrollHeight - target.scrollTop - target.clientHeight < endReachedThreshold;
        if (isNearEnd && !loadingMore) {
          onEndReached();
        }
      }
    },
    [onEndReached, loadingMore, endReachedThreshold]
  );

  // 보이는 범위 계산
  const totalHeight = items.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * rowHeight;

  if (items.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 text-gray-500", className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            const key = keyExtractor ? keyExtractor(item, actualIndex) : actualIndex;

            return (
              <div
                key={key}
                style={{ height: rowHeight }}
                className="flex items-center"
              >
                {renderRow(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>

      {/* 로딩 표시 */}
      {loadingMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">더 불러오는 중...</span>
        </div>
      )}
    </div>
  );
}

/**
 * 가상화된 테이블 컴포넌트
 */
interface VirtualizedTableProps<T> {
  items: T[];
  columns: {
    key: string;
    header: string;
    width?: number | string;
    render?: (item: T, index: number) => React.ReactNode;
    align?: "left" | "center" | "right";
  }[];
  rowHeight?: number;
  headerHeight?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
  selectedIndex?: number;
  stickyHeader?: boolean;
  stickyColumns?: number; // 고정할 컬럼 수
}

export function VirtualizedTable<T extends Record<string, unknown>>({
  items,
  columns,
  rowHeight = 48,
  headerHeight = 48,
  className,
  onRowClick,
  selectedIndex,
  stickyHeader = true,
  stickyColumns = 0,
}: VirtualizedTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerHeight(entry.contentRect.height - headerHeight);
      }
    });

    resizeObserver.observe(container);
    setContainerHeight(container.clientHeight - headerHeight);

    return () => resizeObserver.disconnect();
  }, [headerHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * rowHeight;
  const overscan = 5;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * rowHeight;

  // 고정 컬럼과 스크롤 컬럼 분리
  const stickyColumnsData = columns.slice(0, stickyColumns);
  const scrollableColumns = columns.slice(stickyColumns);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto border border-gray-200 rounded-lg bg-white", className)}
    >
      {/* 헤더 */}
      <div
        className={cn(
          "flex bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-sm",
          stickyHeader && "sticky top-0 z-10"
        )}
        style={{ height: headerHeight }}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            className={cn(
              "flex items-center px-4",
              col.align === "center" && "justify-center",
              col.align === "right" && "justify-end"
            )}
            style={{ width: col.width || "auto", flex: col.width ? "none" : 1 }}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* 본문 */}
      <div
        className="overflow-auto"
        style={{ height: `calc(100% - ${headerHeight}px)` }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: offsetY,
              left: 0,
              right: 0,
            }}
          >
            {visibleItems.map((item, index) => {
              const actualIndex = startIndex + index;
              const isSelected = selectedIndex === actualIndex;

              return (
                <div
                  key={actualIndex}
                  className={cn(
                    "flex border-b border-gray-100 text-sm",
                    onRowClick && "cursor-pointer hover:bg-gray-50",
                    isSelected && "bg-blue-50"
                  )}
                  style={{ height: rowHeight }}
                  onClick={() => onRowClick?.(item, actualIndex)}
                >
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className={cn(
                        "flex items-center px-4",
                        col.align === "center" && "justify-center",
                        col.align === "right" && "justify-end"
                      )}
                      style={{ width: col.width || "auto", flex: col.width ? "none" : 1 }}
                    >
                      {col.render
                        ? col.render(item, actualIndex)
                        : String(item[col.key] ?? "")}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 빈 상태 */}
      {items.length === 0 && (
        <div className="flex items-center justify-center h-32 text-gray-500">
          데이터가 없습니다
        </div>
      )}
    </div>
  );
}
