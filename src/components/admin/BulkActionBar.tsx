"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import {
  Trash2,
  Download,
  Edit2,
  Copy,
  Archive,
  X,
  MoreHorizontal,
  Check,
} from "lucide-react";

export type BulkActionType = "delete" | "export" | "update" | "copy" | "archive" | "custom";

export interface BulkAction {
  type: BulkActionType;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "danger" | "warning";
  confirmMessage?: string;
  handler?: () => void | Promise<void>;
}

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll?: () => void;
  onClearSelection: () => void;
  actions?: BulkAction[];
  onAction?: (action: BulkActionType) => void | Promise<void>;
  isProcessing?: boolean;
  className?: string;
  position?: "top" | "bottom" | "sticky";
}

// 기본 액션 아이콘
const defaultIcons: Record<BulkActionType, React.ComponentType<{ className?: string }>> = {
  delete: Trash2,
  export: Download,
  update: Edit2,
  copy: Copy,
  archive: Archive,
  custom: MoreHorizontal,
};

// 기본 액션 스타일
const actionVariants = {
  default: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  danger: "bg-red-100 text-red-700 hover:bg-red-200",
  warning: "bg-orange-100 text-orange-700 hover:bg-orange-200",
};

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  actions = [],
  onAction,
  isProcessing = false,
  className,
  position = "top",
}: BulkActionBarProps) {
  const [confirmAction, setConfirmAction] = React.useState<BulkActionType | null>(null);

  const handleAction = async (action: BulkAction) => {
    // 확인이 필요한 경우
    if (action.confirmMessage && confirmAction !== action.type) {
      setConfirmAction(action.type);
      return;
    }

    setConfirmAction(null);

    if (action.handler) {
      await action.handler();
    } else if (onAction) {
      await onAction(action.type);
    }
  };

  const cancelConfirm = () => {
    setConfirmAction(null);
  };

  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  // 기본 액션 (actions가 비어있을 때)
  const defaultActions: BulkAction[] = [
    { type: "delete", label: "삭제", variant: "danger", confirmMessage: "선택한 항목을 삭제하시겠습니까?" },
    { type: "export", label: "내보내기", variant: "default" },
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;

  const positionClasses = {
    top: "",
    bottom: "",
    sticky: "sticky bottom-0 z-20",
  };

  // 선택된 항목이 없으면 표시하지 않음
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl",
        positionClasses[position],
        className
      )}
    >
      {/* 선택 정보 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium text-sm">
            {selectedCount}
          </div>
          <span className="text-sm text-blue-700">
            {selectedCount}개 선택됨 {totalCount > 0 && `(전체 ${totalCount}개)`}
          </span>
        </div>

        {/* 전체 선택 / 해제 */}
        <div className="flex items-center gap-2">
          {onSelectAll && !isAllSelected && (
            <button
              onClick={onSelectAll}
              className="text-sm text-blue-600 hover:underline"
              disabled={isProcessing}
            >
              전체 선택
            </button>
          )}
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            선택 해제
          </button>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2">
        {confirmAction && (
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-200 mr-2">
            <span className="text-sm text-gray-700">
              {displayActions.find((a) => a.type === confirmAction)?.confirmMessage}
            </span>
            <button
              onClick={() => {
                const action = displayActions.find((a) => a.type === confirmAction);
                if (action) handleAction(action);
              }}
              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
              disabled={isProcessing}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={cancelConfirm}
              className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {displayActions.map((action) => {
          const Icon = action.icon || defaultIcons[action.type];
          const variant = action.variant || "default";

          return (
            <Button
              key={action.type}
              size="sm"
              variant="ghost"
              className={cn(actionVariants[variant])}
              onClick={() => handleAction(action)}
              disabled={isProcessing || (confirmAction !== null && confirmAction !== action.type)}
            >
              <Icon className="w-4 h-4 mr-1" />
              {action.label}
            </Button>
          );
        })}

        {/* 닫기 버튼 */}
        <button
          onClick={onClearSelection}
          className="p-2 hover:bg-blue-100 rounded-lg transition-colors ml-2"
          aria-label="닫기"
        >
          <X className="w-4 h-4 text-blue-600" />
        </button>
      </div>
    </div>
  );
}

/**
 * 선택 상태 관리 훅
 */
export function useSelection<T>(
  items: T[],
  keyExtractor: (item: T) => string
) {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());

  const select = React.useCallback((item: T) => {
    const key = keyExtractor(item);
    setSelectedKeys((prev) => new Set([...prev, key]));
  }, [keyExtractor]);

  const deselect = React.useCallback((item: T) => {
    const key = keyExtractor(item);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, [keyExtractor]);

  const toggle = React.useCallback((item: T) => {
    const key = keyExtractor(item);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, [keyExtractor]);

  const selectAll = React.useCallback(() => {
    setSelectedKeys(new Set(items.map(keyExtractor)));
  }, [items, keyExtractor]);

  const clearSelection = React.useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const isSelected = React.useCallback(
    (item: T) => selectedKeys.has(keyExtractor(item)),
    [selectedKeys, keyExtractor]
  );

  const selectedItems = React.useMemo(
    () => items.filter((item) => selectedKeys.has(keyExtractor(item))),
    [items, selectedKeys, keyExtractor]
  );

  return {
    selectedKeys,
    selectedItems,
    selectedCount: selectedKeys.size,
    select,
    deselect,
    toggle,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected: selectedKeys.size === items.length && items.length > 0,
    hasSelection: selectedKeys.size > 0,
  };
}
