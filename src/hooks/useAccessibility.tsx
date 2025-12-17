"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * 키보드 네비게이션 관리 훅
 * 목록에서 화살표 키 네비게이션을 쉽게 구현
 */
export function useKeyboardNavigation<T extends HTMLElement>(options: {
  itemCount: number;
  orientation?: "vertical" | "horizontal";
  loop?: boolean;
  onSelect?: (index: number) => void;
  onEscape?: () => void;
  initialIndex?: number;
}) {
  const {
    itemCount,
    orientation = "vertical",
    loop = true,
    onSelect,
    onEscape,
    initialIndex = 0,
  } = options;

  const containerRef = useRef<T>(null);
  const currentIndexRef = useRef(initialIndex);

  const focusItem = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLElement>('[data-nav-item]');
    if (items.length === 0) return;

    // 범위 보정
    let newIndex = index;
    if (loop) {
      if (newIndex < 0) newIndex = items.length - 1;
      if (newIndex >= items.length) newIndex = 0;
    } else {
      newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
    }

    currentIndexRef.current = newIndex;
    items[newIndex]?.focus();
  }, [loop]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";

    switch (e.key) {
      case prevKey:
        e.preventDefault();
        focusItem(currentIndexRef.current - 1);
        break;
      case nextKey:
        e.preventDefault();
        focusItem(currentIndexRef.current + 1);
        break;
      case "Home":
        e.preventDefault();
        focusItem(0);
        break;
      case "End":
        e.preventDefault();
        focusItem(itemCount - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onSelect?.(currentIndexRef.current);
        break;
      case "Escape":
        e.preventDefault();
        onEscape?.();
        break;
    }
  }, [orientation, focusItem, itemCount, onSelect, onEscape]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    containerRef,
    focusItem,
    currentIndex: currentIndexRef.current,
  };
}

/**
 * 포커스 트랩 훅
 * 모달, 다이얼로그 등에서 포커스가 컴포넌트 내부에만 머무르도록 함
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // 첫 요소에 포커스
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [active]);

  return containerRef;
}

/**
 * 스킵 네비게이션 링크 컴포넌트
 * 스크린 리더 사용자가 반복적인 네비게이션을 건너뛸 수 있도록 함
 */
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`skip-link ${className || ""}`}
    >
      {children}
    </a>
  );
}

/**
 * ARIA 라이브 리전 발표 훅
 * 스크린 리더에게 동적 콘텐츠 변경을 알림
 */
export function useAnnounce() {
  const announce = useCallback((message: string, politeness: "polite" | "assertive" = "polite") => {
    // 기존 라이브 리전 제거
    const existing = document.getElementById("live-announcer");
    if (existing) {
      existing.remove();
    }

    // 새 라이브 리전 생성
    const announcer = document.createElement("div");
    announcer.id = "live-announcer";
    announcer.setAttribute("aria-live", politeness);
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    announcer.textContent = message;

    document.body.appendChild(announcer);

    // 일정 시간 후 제거
    setTimeout(() => {
      announcer.remove();
    }, 1000);
  }, []);

  return announce;
}

/**
 * 감소된 모션 선호도 감지 훅
 */
export function usePrefersReducedMotion(): boolean {
  const query = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

  // SSR에서는 false 반환
  if (!query) return false;

  return query.matches;
}

/**
 * 고대비 모드 감지 훅
 */
export function usePrefersHighContrast(): boolean {
  const query = typeof window !== "undefined"
    ? window.matchMedia("(prefers-contrast: high)")
    : null;

  if (!query) return false;

  return query.matches;
}
