"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface AutoSaveOptions {
  interval?: number; // 자동 저장 간격 (ms)
  debounce?: number; // 디바운스 시간 (ms)
  onSave?: (data: unknown) => void; // 저장 콜백
}

interface AutoSaveReturn<T> {
  savedData: T | null;
  lastSaved: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  restore: () => T | null;
  clear: () => void;
  forceSave: () => void;
}

/**
 * 자동 저장 훅 - 데이터 손실 방지를 위한 자동 저장 기능
 * @param key - localStorage 키
 * @param data - 저장할 데이터
 * @param options - 옵션 (interval, debounce, onSave)
 */
export function useAutoSave<T>(
  key: string,
  data: T,
  options: AutoSaveOptions = {}
): AutoSaveReturn<T> {
  const { interval = 30000, debounce = 1000, onSave } = options;

  const [savedData, setSavedData] = useState<T | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const dataRef = useRef(data);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 데이터 업데이트
  useEffect(() => {
    dataRef.current = data;
    setHasUnsavedChanges(true);
  }, [data]);

  // 저장 함수
  const save = useCallback(() => {
    setIsSaving(true);
    try {
      const dataToSave = {
        data: dataRef.current,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(`autosave_${key}`, JSON.stringify(dataToSave));
      setSavedData(dataRef.current);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      onSave?.(dataRef.current);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [key, onSave]);

  // 디바운스된 저장
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (hasUnsavedChanges) {
        save();
      }
    }, debounce);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, debounce, hasUnsavedChanges, save]);

  // 주기적 저장
  useEffect(() => {
    intervalTimerRef.current = setInterval(() => {
      if (hasUnsavedChanges) {
        save();
      }
    }, interval);

    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, [interval, hasUnsavedChanges, save]);

  // 페이지 이탈 시 저장
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        save();
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, save]);

  // 복구 함수
  const restore = useCallback((): T | null => {
    try {
      const stored = localStorage.getItem(`autosave_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data as T;
      }
    } catch (error) {
      console.error("Restore failed:", error);
    }
    return null;
  }, [key]);

  // 초기 로드
  useEffect(() => {
    const restored = restore();
    if (restored) {
      setSavedData(restored);
    }
  }, [restore]);

  // 삭제 함수
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(`autosave_${key}`);
      setSavedData(null);
      setLastSaved(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Clear failed:", error);
    }
  }, [key]);

  // 강제 저장
  const forceSave = useCallback(() => {
    save();
  }, [save]);

  return {
    savedData,
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    restore,
    clear,
    forceSave,
  };
}

/**
 * 자동 저장 상태를 보여주는 UI 컴포넌트용 포맷터
 */
export function formatAutoSaveStatus(
  isSaving: boolean,
  lastSaved: Date | null,
  hasUnsavedChanges: boolean
): string {
  if (isSaving) {
    return "저장 중...";
  }
  if (hasUnsavedChanges) {
    return "변경사항 있음";
  }
  if (lastSaved) {
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes < 1) {
      return "방금 저장됨";
    }
    if (minutes < 60) {
      return `${minutes}분 전 저장됨`;
    }
    return lastSaved.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " 저장됨";
  }
  return "";
}
