"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Undo2, X, Clock } from "lucide-react";

interface UndoItem<T> {
  id: string;
  data: T;
  action: string;
  label: string;
  timestamp: number;
  expiresAt: number;
}

interface UndoManagerProps<T> {
  items: UndoItem<T>[];
  onUndo: (item: UndoItem<T>) => void;
  onDismiss: (id: string) => void;
  className?: string;
}

// Undo Manager UI 컴포넌트
export function UndoManager<T>({
  items,
  onUndo,
  onDismiss,
  className,
}: UndoManagerProps<T>) {
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});

  // 카운트다운 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCountdowns: Record<string, number> = {};

      items.forEach((item) => {
        const remaining = Math.max(0, Math.ceil((item.expiresAt - now) / 1000));
        newCountdowns[item.id] = remaining;

        if (remaining === 0) {
          onDismiss(item.id);
        }
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [items, onDismiss]);

  if (items.length === 0) return null;

  return (
    <div className={cn("fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2", className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-gray-900 text-white rounded-xl shadow-lg flex items-center gap-3 px-4 py-3 animate-slide-up"
        >
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm">{item.label}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {countdowns[item.id] || 0}초
            </span>
          </div>

          <button
            onClick={() => onUndo(item)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
          >
            <Undo2 className="w-4 h-4" />
            되돌리기
          </button>

          <button
            onClick={() => onDismiss(item.id)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// useUndo 훅
interface UseUndoOptions {
  duration?: number; // 되돌리기 가능 시간 (ms)
  maxItems?: number; // 최대 저장 개수
}

export function useUndo<T>(options: UseUndoOptions = {}) {
  const { duration = 10000, maxItems = 5 } = options;

  const [undoItems, setUndoItems] = useState<UndoItem<T>[]>([]);

  // 삭제 항목 추가
  const addUndo = useCallback(
    (data: T, action: string, label: string): string => {
      const id = `undo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();

      const newItem: UndoItem<T> = {
        id,
        data,
        action,
        label,
        timestamp: now,
        expiresAt: now + duration,
      };

      setUndoItems((prev) => {
        const updated = [newItem, ...prev].slice(0, maxItems);
        return updated;
      });

      return id;
    },
    [duration, maxItems]
  );

  // 되돌리기 실행
  const undo = useCallback((id: string): T | null => {
    const item = undoItems.find((i) => i.id === id);
    if (item) {
      setUndoItems((prev) => prev.filter((i) => i.id !== id));
      return item.data;
    }
    return null;
  }, [undoItems]);

  // 항목 제거
  const dismiss = useCallback((id: string) => {
    setUndoItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // 전체 제거
  const clearAll = useCallback(() => {
    setUndoItems([]);
  }, []);

  // 만료된 항목 자동 제거
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setUndoItems((prev) => prev.filter((item) => item.expiresAt > now));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    undoItems,
    addUndo,
    undo,
    dismiss,
    clearAll,
    canUndo: undoItems.length > 0,
  };
}

// 삭제 with Undo 래퍼 함수
export function createUndoableDelete<T>(
  deleteAction: (item: T) => Promise<void>,
  undoAction: (item: T) => Promise<void>,
  options: {
    getLabel: (item: T) => string;
    duration?: number;
  }
) {
  return async (
    item: T,
    addUndo: (data: T, action: string, label: string) => string
  ): Promise<void> => {
    // 먼저 UI에서 제거하고 Undo 옵션 표시
    const label = options.getLabel(item);
    const undoId = addUndo(item, "delete", `${label} 삭제됨`);

    try {
      // 실제 삭제는 undo 시간이 지난 후 실행
      await new Promise((resolve) => setTimeout(resolve, options.duration || 10000));
      await deleteAction(item);
    } catch (error) {
      // 삭제 실패 시 복구
      await undoAction(item);
      throw error;
    }
  };
}
