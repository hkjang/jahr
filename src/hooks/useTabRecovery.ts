"use client";

/**
 * useTabRecovery - 탭 복구 훅
 * 세션 만료, 크래시 복구 기능
 */

import { useEffect, useState, useCallback } from "react";
import { useTabStore } from "@/lib/stores/tab-store";
import type { Tab } from "@/types/tab";

interface RecoveryData {
  tabs: Tab[];
  activeTabId: string | null;
  timestamp: string;
  reason: "crash" | "session_expired" | "manual";
}

interface UseTabRecoveryOptions {
  enabled?: boolean;
  storageKey?: string;
  autoSaveInterval?: number;
  onRecoveryAvailable?: (data: RecoveryData) => void;
  onRecoveryComplete?: () => void;
}

interface UseTabRecoveryReturn {
  hasRecoveryData: boolean;
  recoveryData: RecoveryData | null;
  recover: () => void;
  dismiss: () => void;
  saveForRecovery: (reason: RecoveryData["reason"]) => void;
}

const RECOVERY_STORAGE_KEY = "jahr_tab_recovery";

export function useTabRecovery(
  options: UseTabRecoveryOptions = {}
): UseTabRecoveryReturn {
  const {
    enabled = true,
    storageKey = RECOVERY_STORAGE_KEY,
    autoSaveInterval = 10000,
    onRecoveryAvailable,
    onRecoveryComplete,
  } = options;

  const { tabs, activeTabId, restoreSession } = useTabStore();
  const [hasRecoveryData, setHasRecoveryData] = useState(false);
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);

  // 복구 데이터 저장
  const saveForRecovery = useCallback(
    (reason: RecoveryData["reason"]) => {
      if (!enabled || tabs.length === 0) return;

      try {
        const data: RecoveryData = {
          tabs,
          activeTabId,
          timestamp: new Date().toISOString(),
          reason,
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save recovery data:", error);
      }
    },
    [enabled, tabs, activeTabId, storageKey]
  );

  // 복구 데이터 확인
  useEffect(() => {
    if (!enabled) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data: RecoveryData = JSON.parse(stored);
        
        // 24시간 이내 데이터만 유효
        const timestamp = new Date(data.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24 && data.tabs.length > 0) {
          setRecoveryData(data);
          setHasRecoveryData(true);
          onRecoveryAvailable?.(data);
        } else {
          // 오래된 데이터 삭제
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error("Failed to check recovery data:", error);
    }
  }, [enabled, storageKey, onRecoveryAvailable]);

  // 주기적 자동 저장 (크래시 대비)
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      saveForRecovery("crash");
    }, autoSaveInterval);

    // 페이지 언로드 시 저장
    const handleBeforeUnload = () => {
      saveForRecovery("crash");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, autoSaveInterval, saveForRecovery]);

  // 세션 복구
  const recover = useCallback(() => {
    if (!recoveryData) return;

    try {
      // Zustand 스토어에 직접 복원
      useTabStore.setState({
        tabs: recoveryData.tabs,
        activeTabId: recoveryData.activeTabId,
      });

      // 복구 데이터 삭제
      localStorage.removeItem(storageKey);
      setRecoveryData(null);
      setHasRecoveryData(false);
      
      onRecoveryComplete?.();
    } catch (error) {
      console.error("Failed to recover tabs:", error);
    }
  }, [recoveryData, storageKey, onRecoveryComplete]);

  // 복구 무시
  const dismiss = useCallback(() => {
    localStorage.removeItem(storageKey);
    setRecoveryData(null);
    setHasRecoveryData(false);
    restoreSession();
  }, [storageKey, restoreSession]);

  return {
    hasRecoveryData,
    recoveryData,
    recover,
    dismiss,
    saveForRecovery,
  };
}
