"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: number | string;
  minWidth?: number;
  sticky?: boolean; // 고정 컬럼
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (item: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
}

export type SortDirection = "asc" | "desc" | null;

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

interface StickyTableProps<T> {
  items: T[];
  columns: TableColumn<T>[];
  className?: string;
  rowHeight?: number;
  headerHeight?: number;
  onRowClick?: (item: T, index: number) => void;
  selectedIndex?: number;
  rowKey?: (item: T, index: number) => string;
  onSort?: (column: string, direction: SortDirection) => void;
  sortState?: SortState;
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
}

export function StickyTable<T extends Record<string, unknown>>({
  items,
  columns,
  className,
  rowHeight = 48,
  headerHeight = 48,
  onRowClick,
  selectedIndex,
  rowKey,
  onSort,
  sortState,
  loading = false,
  emptyMessage = "데이터가 없습니다",
  striped = false,
  bordered = false,
  compact = false,
}: StickyTableProps<T>) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 스크롤 핸들러
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  // 고정 컬럼과 스크롤 컬럼 분리
  const stickyColumns = columns.filter((col) => col.sticky);
  const scrollableColumns = columns.filter((col) => !col.sticky);

  // 고정 컬럼 총 너비 계산
  const stickyWidth = stickyColumns.reduce((sum, col) => {
    const width = typeof col.width === "number" ? col.width : 150;
    return sum + width;
  }, 0);

  // 정렬 핸들러
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;

    let newDirection: SortDirection = "asc";
    if (sortState?.column === column.key) {
      if (sortState.direction === "asc") newDirection = "desc";
      else if (sortState.direction === "desc") newDirection = null;
    }

    onSort(column.key, newDirection);
  };

  // 정렬 아이콘
  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;

    if (sortState?.column === column.key) {
      if (sortState.direction === "asc") {
        return <ArrowUp className="w-4 h-4 text-blue-500" />;
      } else if (sortState.direction === "desc") {
        return <ArrowDown className="w-4 h-4 text-blue-500" />;
      }
    }

    return <ArrowUpDown className="w-4 h-4 text-gray-300" />;
  };

  // 셀 스타일
  const cellPadding = compact ? "px-3 py-2" : "px-4 py-3";

  // 컬럼 렌더링
  const renderHeaderCell = (col: TableColumn<T>, isSticky: boolean) => (
    <div
      key={col.key}
      className={cn(
        "flex items-center gap-2 font-medium text-gray-700 text-sm bg-gray-50",
        cellPadding,
        col.align === "center" && "justify-center",
        col.align === "right" && "justify-end",
        col.sortable && "cursor-pointer hover:bg-gray-100",
        isSticky && "border-r border-gray-200"
      )}
      style={{
        width: col.width || "auto",
        minWidth: col.minWidth || (isSticky ? 100 : 80),
        flex: col.width ? "none" : 1,
        height: headerHeight,
      }}
      onClick={() => handleSort(col)}
    >
      {col.headerRender ? col.headerRender() : col.header}
      {getSortIcon(col)}
    </div>
  );

  const renderCell = (col: TableColumn<T>, item: T, index: number, isSticky: boolean) => (
    <div
      key={col.key}
      className={cn(
        "flex items-center text-sm",
        cellPadding,
        col.align === "center" && "justify-center",
        col.align === "right" && "justify-end",
        isSticky && "border-r border-gray-200 bg-white"
      )}
      style={{
        width: col.width || "auto",
        minWidth: col.minWidth || (isSticky ? 100 : 80),
        flex: col.width ? "none" : 1,
        height: rowHeight,
      }}
    >
      {col.render ? col.render(item, index) : String(item[col.key] ?? "")}
    </div>
  );

  return (
    <div
      ref={tableRef}
      className={cn(
        "relative overflow-hidden border rounded-lg bg-white",
        bordered ? "border-gray-300" : "border-gray-200",
        className
      )}
    >
      {/* 고정 헤더 + 스크롤 헤더 */}
      <div className="flex sticky top-0 z-20 border-b border-gray-200">
        {/* 고정 컬럼 헤더 */}
        {stickyColumns.length > 0 && (
          <div
            className="flex flex-shrink-0 sticky left-0 z-30 bg-gray-50"
            style={{ width: stickyWidth }}
          >
            {stickyColumns.map((col) => renderHeaderCell(col, true))}
          </div>
        )}

        {/* 스크롤 컬럼 헤더 */}
        <div className="flex flex-1 overflow-hidden">
          {scrollableColumns.map((col) => renderHeaderCell(col, false))}
        </div>
      </div>

      {/* 본문 */}
      <div className="overflow-auto" onScroll={handleScroll}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          items.map((item, index) => {
            const key = rowKey ? rowKey(item, index) : index;
            const isSelected = selectedIndex === index;

            return (
              <div
                key={key}
                className={cn(
                  "flex",
                  bordered && "border-b border-gray-200",
                  !bordered && index < items.length - 1 && "border-b border-gray-100",
                  striped && index % 2 === 1 && "bg-gray-50",
                  onRowClick && "cursor-pointer hover:bg-blue-50",
                  isSelected && "bg-blue-100"
                )}
                onClick={() => onRowClick?.(item, index)}
              >
                {/* 고정 컬럼 */}
                {stickyColumns.length > 0 && (
                  <div
                    className={cn(
                      "flex flex-shrink-0 sticky left-0 z-10",
                      striped && index % 2 === 1 ? "bg-gray-50" : "bg-white",
                      isSelected && "bg-blue-100"
                    )}
                    style={{
                      width: stickyWidth,
                      boxShadow: scrollLeft > 0 ? "4px 0 8px -4px rgba(0,0,0,0.1)" : undefined,
                    }}
                  >
                    {stickyColumns.map((col) => renderCell(col, item, index, true))}
                  </div>
                )}

                {/* 스크롤 컬럼 */}
                <div className="flex flex-1">
                  {scrollableColumns.map((col) => renderCell(col, item, index, false))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * 진행 상태 피드백 컴포넌트
 */
interface ProgressFeedbackProps {
  current: number;
  total: number;
  label?: string;
  variant?: "bar" | "circular" | "steps";
  className?: string;
  showPercentage?: boolean;
}

export function ProgressFeedback({
  current,
  total,
  label,
  variant = "bar",
  className,
  showPercentage = true,
}: ProgressFeedbackProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  if (variant === "circular") {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#3b82f6"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900">{percentage}%</span>
          </div>
        </div>
        {label && <span className="text-sm text-gray-600">{label}</span>}
        <span className="text-xs text-gray-400">
          {current} / {total}
        </span>
      </div>
    );
  }

  if (variant === "steps") {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
        <div className="flex items-center gap-1">
          {Array.from({ length: total }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex-1 h-2 rounded-full transition-colors",
                index < current ? "bg-blue-500" : "bg-gray-200"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 text-right block">
          {current} / {total}
          {showPercentage && ` (${percentage}%)`}
        </span>
      </div>
    );
  }

  // Bar variant (default)
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          {showPercentage && <span className="text-gray-500">{percentage}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">
        {current} / {total} 완료
      </span>
    </div>
  );
}
