"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertTriangle, Info, XCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

export type ToastType = "info" | "success" | "warning" | "error";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string;
  duration?: number; // ms, 0 = 무한
  dismissible?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// 타입별 설정
const typeConfig: Record<ToastType, { icon: React.ComponentType<{ className?: string }>; bgColor: string; borderColor: string; iconColor: string }> = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-500",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-500",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    iconColor: "text-orange-500",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
  },
};

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      id,
      duration: 5000,
      dismissible: true,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    ...context,
    success: (title: string, message?: string, options?: Partial<Toast>) =>
      context.addToast({ type: "success", title, message, ...options }),
    error: (title: string, message?: string, options?: Partial<Toast>) =>
      context.addToast({ type: "error", title, message, ...options }),
    warning: (title: string, message?: string, options?: Partial<Toast>) =>
      context.addToast({ type: "warning", title, message, ...options }),
    info: (title: string, message?: string, options?: Partial<Toast>) =>
      context.addToast({ type: "info", title, message, ...options }),
  };
}

// Toast Container
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="알림"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// 개별 Toast
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const { icon: Icon, bgColor, borderColor, iconColor } = typeConfig[toast.type];
  const [isExiting, setIsExiting] = useState(false);

  // 자동 제거
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, toast.duration - 300); // 애니메이션 시간 고려

      const removeTimer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [toast.id, toast.duration, onRemove]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={cn(
        "pointer-events-auto rounded-xl border shadow-lg transition-all duration-300",
        bgColor,
        borderColor,
        isExiting
          ? "opacity-0 translate-x-full"
          : "opacity-100 translate-x-0 animate-slide-in-right"
      )}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", iconColor)} />
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{toast.title}</p>
          {toast.message && (
            <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>
          )}
          
          {toast.actionHref && (
            <Link
              href={toast.actionHref}
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
            >
              {toast.actionLabel || "바로가기"}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {toast.dismissible && (
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* 진행 바 */}
      {toast.duration && toast.duration > 0 && (
        <div className="h-1 bg-gray-200 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-gray-400 opacity-30"
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// 단독 사용을 위한 InAppNotification 컴포넌트
interface InAppNotificationProps {
  type: ToastType;
  title: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string;
  onClose?: () => void;
  className?: string;
}

export function InAppNotification({
  type,
  title,
  message,
  actionHref,
  actionLabel,
  onClose,
  className,
}: InAppNotificationProps) {
  const { icon: Icon, bgColor, borderColor, iconColor } = typeConfig[type];

  return (
    <div
      className={cn(
        "rounded-xl border shadow-lg",
        bgColor,
        borderColor,
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", iconColor)} />
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{title}</p>
          {message && (
            <p className="text-sm text-gray-600 mt-0.5">{message}</p>
          )}
          
          {actionHref && (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
            >
              {actionLabel || "바로가기"}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}
