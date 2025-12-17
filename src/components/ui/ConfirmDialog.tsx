"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { AlertTriangle, Info, AlertCircle, X, Loader2 } from "lucide-react";

export type ConfirmDialogVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  isOpen: boolean;
  variant?: ConfirmDialogVariant;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmDisabled?: boolean;
  requireConfirmText?: string; // 입력해야 하는 확인 텍스트
}

// 변형별 설정
const variantConfig: Record<ConfirmDialogVariant, {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  confirmButtonClass: string;
}> = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmButtonClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  },
  warning: {
    icon: AlertCircle,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    confirmButtonClass: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    confirmButtonClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  },
};

export function ConfirmDialog({
  isOpen,
  variant = "danger",
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
  confirmDisabled = false,
  requireConfirmText,
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const config = variantConfig[variant];
  const Icon = config.icon;

  const isConfirmEnabled = requireConfirmText
    ? confirmInput === requireConfirmText && !confirmDisabled
    : !confirmDisabled;

  const handleConfirm = async () => {
    if (!isConfirmEnabled) return;

    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
      setConfirmInput("");
    }
  };

  const handleCancel = () => {
    setConfirmInput("");
    onCancel();
  };

  // ESC 키 핸들러
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isProcessing) {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, isProcessing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={!isProcessing ? handleCancel : undefined}
      />

      {/* 다이얼로그 */}
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 animate-scale-in"
        role="alertdialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleCancel}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6">
          {/* 아이콘 */}
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4", config.iconBg)}>
            <Icon className={cn("w-6 h-6", config.iconColor)} />
          </div>

          {/* 제목 */}
          <h2
            id="confirm-dialog-title"
            className="text-lg font-semibold text-gray-900 text-center mb-2"
          >
            {title}
          </h2>

          {/* 메시지 */}
          <div
            id="confirm-dialog-message"
            className="text-gray-600 text-center mb-6"
          >
            {typeof message === "string" ? <p>{message}</p> : message}
          </div>

          {/* 확인 텍스트 입력 */}
          {requireConfirmText && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2 text-center">
                계속하려면 <code className="px-1.5 py-0.5 bg-gray-100 rounded text-red-600 font-mono">{requireConfirmText}</code>를 입력하세요.
              </p>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={requireConfirmText}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                autoFocus
              />
            </div>
          )}

          {/* 버튼 */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              {cancelLabel}
            </Button>
            <Button
              className={cn("flex-1", config.confirmButtonClass)}
              onClick={handleConfirm}
              disabled={!isConfirmEnabled || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// useConfirmDialog 훅
interface ConfirmOptions {
  variant?: ConfirmDialogVariant;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  requireConfirmText?: string;
}

export function useConfirmDialog() {
  const [state, setState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        options,
        resolve,
      });
    });
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState({ isOpen: false, options: null, resolve: null });
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState({ isOpen: false, options: null, resolve: null });
  };

  const DialogComponent = state.options ? (
    <ConfirmDialog
      isOpen={state.isOpen}
      variant={state.options.variant}
      title={state.options.title}
      message={state.options.message}
      confirmLabel={state.options.confirmLabel}
      cancelLabel={state.options.cancelLabel}
      requireConfirmText={state.options.requireConfirmText}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, DialogComponent };
}
