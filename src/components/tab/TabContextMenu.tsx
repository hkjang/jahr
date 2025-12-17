"use client";

/**
 * TabContextMenu - 탭 우클릭 컨텍스트 메뉴
 */

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  XCircle,
  Pin,
  PinOff,
  ExternalLink,
  History,
  Trash2,
} from "lucide-react";

interface TabContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  tabId: string;
  isPinned: boolean;
  onClose: () => void;
  onCloseTab: (tabId: string) => void;
  onCloseOtherTabs: (tabId: string) => void;
  onCloseRightTabs: (tabId: string) => void;
  onCloseAllTabs: () => void;
  onPinTab: (tabId: string) => void;
  onUnpinTab: (tabId: string) => void;
  onOpenInNewWindow?: (tabId: string) => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

function MenuItem({ icon, label, onClick, disabled, danger }: MenuItemProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
        disabled
          ? "text-gray-500 cursor-not-allowed"
          : danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-gray-300 hover:bg-gray-700"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MenuSeparator() {
  return <div className="h-px bg-gray-700 my-1" />;
}

export function TabContextMenu({
  isOpen,
  position,
  tabId,
  isPinned,
  onClose,
  onCloseTab,
  onCloseOtherTabs,
  onCloseRightTabs,
  onCloseAllTabs,
  onPinTab,
  onUnpinTab,
  onOpenInNewWindow,
}: TabContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // 화면 경계 내 위치 조정
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      if (position.x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 8;
      }

      if (position.y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 8;
      }

      menu.style.left = `${adjustedX}px`;
      menu.style.top = `${adjustedY}px`;
    }
  }, [isOpen, position]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[180px] py-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
      style={{ left: position.x, top: position.y }}
      role="menu"
    >
      {/* 탭 닫기 */}
      <MenuItem
        icon={<X className="w-4 h-4" />}
        label="탭 닫기"
        onClick={() => {
          onCloseTab(tabId);
          onClose();
        }}
        disabled={isPinned}
      />

      {/* 다른 탭 모두 닫기 */}
      <MenuItem
        icon={<XCircle className="w-4 h-4" />}
        label="다른 탭 모두 닫기"
        onClick={() => {
          onCloseOtherTabs(tabId);
          onClose();
        }}
      />

      {/* 오른쪽 탭 모두 닫기 */}
      <MenuItem
        icon={<XCircle className="w-4 h-4" />}
        label="오른쪽 탭 모두 닫기"
        onClick={() => {
          onCloseRightTabs(tabId);
          onClose();
        }}
      />

      <MenuSeparator />

      {/* 고정/고정 해제 */}
      {isPinned ? (
        <MenuItem
          icon={<PinOff className="w-4 h-4" />}
          label="탭 고정 해제"
          onClick={() => {
            onUnpinTab(tabId);
            onClose();
          }}
          disabled={tabId === "dashboard"}
        />
      ) : (
        <MenuItem
          icon={<Pin className="w-4 h-4" />}
          label="탭 고정"
          onClick={() => {
            onPinTab(tabId);
            onClose();
          }}
        />
      )}

      {/* 새 창에서 열기 */}
      {onOpenInNewWindow && (
        <>
          <MenuSeparator />
          <MenuItem
            icon={<ExternalLink className="w-4 h-4" />}
            label="새 창에서 열기"
            onClick={() => {
              onOpenInNewWindow(tabId);
              onClose();
            }}
          />
        </>
      )}

      <MenuSeparator />

      {/* 모든 탭 닫기 */}
      <MenuItem
        icon={<Trash2 className="w-4 h-4" />}
        label="모든 탭 닫기"
        onClick={() => {
          onCloseAllTabs();
          onClose();
        }}
        danger
      />
    </div>
  );
}
