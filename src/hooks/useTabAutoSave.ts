"use client";

/**
 * useTabAutoSave - 탭 자동 저장 훅
 * 기존 useAutoSave와 탭 시스템 통합
 */

import { useEffect, useCallback, useRef } from "react";
import { useTabStore } from "@/lib/stores/tab-store";

interface UseTabAutoSaveOptions {
  key: string;
  interval?: number; // 자동 저장 간격 (ms)
  debounce?: number; // 디바운스 시간 (ms)
  onSave?: (data: unknown) => void;
  onRestore?: (data: unknown) => void;
}

interface UseTabAutoSaveReturn<T> {
  save: (data: T) => void;
  restore: () => T | null;
  clear: () => void;
  lastSaved: Date | null;
  isSaving: boolean;
}

export function useTabAutoSave<T>(
  options: UseTabAutoSaveOptions
): UseTabAutoSaveReturn<T> {
  const {
    key,
    interval = 30000,
    debounce = 1000,
    onSave,
    onRestore,
  } = options;

  const { getActiveTab, updateTabState } = useTabStore();
  const lastSavedRef = useRef<Date | null>(null);
  const isSavingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef<T | null>(null);

  // 저장 함수
  const performSave = useCallback(() => {
    if (dataRef.current === null) return;

    isSavingRef.current = true;
    const tab = getActiveTab();

    try {
      const saveData = {
        tabId: tab?.id || "unknown",
        data: dataRef.current,
        timestamp: new Date().toISOString(),
      };

      // localStorage에 저장
      localStorage.setItem(`tab_autosave_${key}`, JSON.stringify(saveData));
      
      // 탭 formData에도 저장
      if (tab) {
        updateTabState(tab.id, {
          formData: dataRef.current as Record<string, unknown>,
          isModified: false,
        });
      }

      lastSavedRef.current = new Date();
      onSave?.(dataRef.current);
    } catch (error) {
      console.error("Tab auto-save failed:", error);
    } finally {
      isSavingRef.current = false;
    }
  }, [key, getActiveTab, updateTabState, onSave]);

  // 공개 저장 함수
  const save = useCallback(
    (data: T) => {
      dataRef.current = data;

      // 디바운스
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        performSave();
      }, debounce);

      // 탭 상태를 수정됨으로 표시
      const tab = getActiveTab();
      if (tab) {
        updateTabState(tab.id, { isModified: true });
      }
    },
    [debounce, performSave, getActiveTab, updateTabState]
  );

  // 복원 함수
  const restore = useCallback((): T | null => {
    try {
      const stored = localStorage.getItem(`tab_autosave_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        onRestore?.(parsed.data);
        return parsed.data as T;
      }
    } catch (error) {
      console.error("Tab restore failed:", error);
    }
    return null;
  }, [key, onRestore]);

  // 삭제 함수
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(`tab_autosave_${key}`);
      dataRef.current = null;
      lastSavedRef.current = null;
    } catch (error) {
      console.error("Tab clear failed:", error);
    }
  }, [key]);

  // 주기적 저장
  useEffect(() => {
    intervalTimerRef.current = setInterval(() => {
      if (dataRef.current !== null) {
        performSave();
      }
    }, interval);

    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [interval, performSave]);

  return {
    save,
    restore,
    clear,
    lastSaved: lastSavedRef.current,
    isSaving: isSavingRef.current,
  };
}
