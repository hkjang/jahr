"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GripVertical, X, Settings2, Plus } from "lucide-react";

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  size: "small" | "medium" | "large" | "full";
  position: { row: number; col: number };
  visible: boolean;
}

interface DraggableWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "full";
  className?: string;
  onRemove?: () => void;
  isEditing?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function DraggableWidget({
  id,
  title,
  children,
  size = "medium",
  className,
  onRemove,
  isEditing = false,
  dragHandleProps,
}: DraggableWidgetProps) {
  const sizeClasses = {
    small: "col-span-1",
    medium: "col-span-1 md:col-span-2",
    large: "col-span-1 md:col-span-2 lg:col-span-3",
    full: "col-span-full",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all",
        sizeClasses[size],
        isEditing && "ring-2 ring-blue-200 ring-offset-2",
        className
      )}
      data-widget-id={id}
    >
      {/* 위젯 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          {isEditing && (
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-200 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        {isEditing && onRemove && (
          <button
            onClick={onRemove}
            className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
            aria-label={`${title} 위젯 제거`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 위젯 컨텐츠 */}
      <div className="p-4">{children}</div>
    </div>
  );
}

// 위젯 그리드 컨테이너
interface WidgetGridProps {
  children: React.ReactNode;
  className?: string;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

export function WidgetGrid({
  children,
  className,
  isEditing = false,
  onEditToggle,
}: WidgetGridProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* 편집 토글 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={onEditToggle}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            isEditing
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <Settings2 className="w-4 h-4" />
          {isEditing ? "편집 완료" : "대시보드 편집"}
        </button>
      </div>

      {/* 위젯 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}

// 위젯 레이아웃 관리 훅
const STORAGE_KEY = "jahr_widget_layout";

export function useWidgetLayout(defaultLayout: WidgetConfig[]) {
  const [layout, setLayout] = useState<WidgetConfig[]>(defaultLayout);
  const [isEditing, setIsEditing] = useState(false);

  // localStorage에서 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedLayout = JSON.parse(stored);
        // 기본 레이아웃과 병합 (새 위젯 추가 대응)
        const mergedLayout = defaultLayout.map((defaultWidget) => {
          const savedWidget = parsedLayout.find(
            (w: WidgetConfig) => w.id === defaultWidget.id
          );
          return savedWidget || defaultWidget;
        });
        setLayout(mergedLayout);
      }
    } catch (error) {
      console.error("Failed to load widget layout:", error);
    }
  }, [defaultLayout]);

  // 레이아웃 저장
  const saveLayout = useCallback((newLayout: WidgetConfig[]) => {
    setLayout(newLayout);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
    } catch (error) {
      console.error("Failed to save widget layout:", error);
    }
  }, []);

  // 위젯 이동
  const moveWidget = useCallback(
    (dragId: string, hoverId: string) => {
      const dragIndex = layout.findIndex((w) => w.id === dragId);
      const hoverIndex = layout.findIndex((w) => w.id === hoverId);

      if (dragIndex === -1 || hoverIndex === -1) return;

      const newLayout = [...layout];
      const [removed] = newLayout.splice(dragIndex, 1);
      newLayout.splice(hoverIndex, 0, removed);

      saveLayout(newLayout);
    },
    [layout, saveLayout]
  );

  // 위젯 표시/숨김
  const toggleWidget = useCallback(
    (widgetId: string) => {
      const newLayout = layout.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      );
      saveLayout(newLayout);
    },
    [layout, saveLayout]
  );

  // 위젯 크기 변경
  const resizeWidget = useCallback(
    (widgetId: string, size: WidgetConfig["size"]) => {
      const newLayout = layout.map((w) =>
        w.id === widgetId ? { ...w, size } : w
      );
      saveLayout(newLayout);
    },
    [layout, saveLayout]
  );

  // 레이아웃 초기화
  const resetLayout = useCallback(() => {
    saveLayout(defaultLayout);
  }, [defaultLayout, saveLayout]);

  return {
    layout,
    isEditing,
    setIsEditing,
    moveWidget,
    toggleWidget,
    resizeWidget,
    resetLayout,
    visibleWidgets: layout.filter((w) => w.visible),
    hiddenWidgets: layout.filter((w) => !w.visible),
  };
}

// 위젯 추가 버튼
interface AddWidgetButtonProps {
  availableWidgets: WidgetConfig[];
  onAdd: (widgetId: string) => void;
}

export function AddWidgetButton({ availableWidgets, onAdd }: AddWidgetButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (availableWidgets.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>위젯 추가</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-2">
            {availableWidgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => {
                  onAdd(widget.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900">{widget.title}</p>
                <p className="text-xs text-gray-500">
                  {widget.size === "small" && "작은 크기"}
                  {widget.size === "medium" && "중간 크기"}
                  {widget.size === "large" && "큰 크기"}
                  {widget.size === "full" && "전체 너비"}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
