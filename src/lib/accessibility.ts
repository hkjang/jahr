// Accessibility utilities for HR System
// 접근성 유틸리티 함수 및 훅

import { useEffect, useRef, useCallback } from "react";

/**
 * 키보드 네비게이션을 위한 포커스 트랩 훅
 * 모달, 드롭다운 등에서 포커스가 벗어나지 않도록 함
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab: 뒤로 이동
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: 앞으로 이동
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // 첫 번째 요소에 포커스
    firstElement?.focus();

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  return containerRef;
}

/**
 * 화살표 키 네비게이션 훅
 * 리스트, 메뉴 등에서 화살표 키로 이동
 */
export function useArrowNavigation(
  items: HTMLElement[] | NodeListOf<HTMLElement>,
  options: {
    loop?: boolean;
    orientation?: "horizontal" | "vertical" | "both";
    onSelect?: (index: number) => void;
  } = {}
) {
  const { loop = true, orientation = "vertical", onSelect } = options;
  const currentIndex = useRef(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const itemsArray = Array.from(items);
      const length = itemsArray.length;
      if (length === 0) return;

      let nextIndex = currentIndex.current;

      const isVertical = orientation === "vertical" || orientation === "both";
      const isHorizontal = orientation === "horizontal" || orientation === "both";

      switch (e.key) {
        case "ArrowDown":
          if (!isVertical) return;
          e.preventDefault();
          nextIndex = loop
            ? (currentIndex.current + 1) % length
            : Math.min(currentIndex.current + 1, length - 1);
          break;
        case "ArrowUp":
          if (!isVertical) return;
          e.preventDefault();
          nextIndex = loop
            ? (currentIndex.current - 1 + length) % length
            : Math.max(currentIndex.current - 1, 0);
          break;
        case "ArrowRight":
          if (!isHorizontal) return;
          e.preventDefault();
          nextIndex = loop
            ? (currentIndex.current + 1) % length
            : Math.min(currentIndex.current + 1, length - 1);
          break;
        case "ArrowLeft":
          if (!isHorizontal) return;
          e.preventDefault();
          nextIndex = loop
            ? (currentIndex.current - 1 + length) % length
            : Math.max(currentIndex.current - 1, 0);
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = length - 1;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onSelect?.(currentIndex.current);
          return;
        default:
          return;
      }

      currentIndex.current = nextIndex;
      itemsArray[nextIndex]?.focus();
    },
    [items, loop, orientation, onSelect]
  );

  return { handleKeyDown, currentIndex };
}

/**
 * 이전 포커스 복원 훅
 * 모달 닫힐 때 이전 요소로 포커스 복원
 */
export function useRestoreFocus() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    previousFocusRef.current?.focus();
  }, []);

  return { saveFocus, restoreFocus };
}

/**
 * 라이브 리전 알림 (스크린 리더용)
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // 메시지가 읽힌 후 제거
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * ARIA 속성 헬퍼
 */
export const ariaHelpers = {
  // 확장/축소 상태
  expanded: (isExpanded: boolean) => ({
    "aria-expanded": isExpanded,
  }),

  // 선택 상태
  selected: (isSelected: boolean) => ({
    "aria-selected": isSelected,
  }),

  // 체크 상태 (3상태 지원)
  checked: (isChecked: boolean | "mixed") => ({
    "aria-checked": isChecked,
  }),

  // 비활성화 상태
  disabled: (isDisabled: boolean) => ({
    "aria-disabled": isDisabled,
    tabIndex: isDisabled ? -1 : 0,
  }),

  // 숨김 상태
  hidden: (isHidden: boolean) => ({
    "aria-hidden": isHidden,
  }),

  // 레이블 연결
  labelledBy: (id: string) => ({
    "aria-labelledby": id,
  }),

  // 설명 연결
  describedBy: (id: string) => ({
    "aria-describedby": id,
  }),

  // 에러 상태
  invalid: (isInvalid: boolean, errorId?: string) => ({
    "aria-invalid": isInvalid,
    ...(isInvalid && errorId ? { "aria-describedby": errorId } : {}),
  }),

  // 로딩 상태
  busy: (isBusy: boolean) => ({
    "aria-busy": isBusy,
  }),

  // 현재 항목 (네비게이션)
  current: (isCurrent: boolean | "page" | "step" | "location") => ({
    "aria-current": isCurrent ? (typeof isCurrent === "boolean" ? "true" : isCurrent) : undefined,
  }),

  // 정렬 순서 (테이블)
  sort: (direction: "ascending" | "descending" | "none") => ({
    "aria-sort": direction,
  }),
};

/**
 * 색상 대비 검사 유틸리티
 * WCAG 2.1 AA 기준: 일반 텍스트 4.5:1, 큰 텍스트 3:1
 */
export function checkColorContrast(
  foreground: string,
  background: string
): { ratio: number; passesAA: boolean; passesAAA: boolean } {
  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
