"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui";
import { Check, X, Edit2, Loader2 } from "lucide-react";

type InlineEditType = "text" | "number" | "select" | "date" | "textarea";

interface InlineEditProps {
  value: string | number;
  onSave: (newValue: string | number) => void | Promise<void>;
  type?: InlineEditType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  displayClassName?: string;
  formatter?: (value: string | number) => string;
  validator?: (value: string | number) => string | null; // 에러 메시지 반환
  emptyText?: string;
  saveOnBlur?: boolean;
  editOnClick?: boolean;
}

export function InlineEdit({
  value,
  onSave,
  type = "text",
  options = [],
  placeholder = "",
  disabled = false,
  className,
  inputClassName,
  displayClassName,
  formatter,
  validator,
  emptyText = "-",
  saveOnBlur = true,
  editOnClick = true,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(String(value));
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  // 편집 시작
  const startEditing = useCallback(() => {
    if (disabled || isProcessing) return;
    setEditValue(String(value));
    setIsEditing(true);
    setError(null);
  }, [disabled, isProcessing, value]);

  // 편집 취소
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditValue(String(value));
    setError(null);
  }, [value]);

  // 저장
  const handleSave = useCallback(async () => {
    if (isProcessing) return;

    // 유효성 검사
    if (validator) {
      const validationError = validator(type === "number" ? Number(editValue) : editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // 값이 변경되지 않았으면 취소
    if (String(value) === editValue) {
      cancelEditing();
      return;
    }

    setIsProcessing(true);
    try {
      const newValue = type === "number" ? Number(editValue) : editValue;
      await onSave(newValue);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("저장 실패");
      console.error("InlineEdit save error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [editValue, value, type, validator, onSave, cancelEditing, isProcessing]);

  // 키보드 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && type !== "textarea") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        cancelEditing();
      }
    },
    [handleSave, cancelEditing, type]
  );

  // 포커스 설정
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ("select" in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  // 표시값 포맷팅
  const displayValue = formatter
    ? formatter(value)
    : value === "" || value === null || value === undefined
    ? emptyText
    : String(value);

  if (!isEditing) {
    return (
      <div
        className={cn(
          "group flex items-center gap-2 min-h-[32px]",
          editOnClick && !disabled && "cursor-pointer hover:bg-gray-100 rounded px-2 -mx-2",
          className
        )}
        onClick={editOnClick ? startEditing : undefined}
      >
        <span className={cn("flex-1", displayClassName)}>
          {displayValue}
        </span>
        {!disabled && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              startEditing();
            }}
            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
            aria-label="편집"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* 입력 필드 */}
      {type === "select" ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveOnBlur ? handleSave : undefined}
          disabled={isProcessing}
          className={cn(
            "flex-1 px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
            error && "border-red-500",
            inputClassName
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveOnBlur ? handleSave : undefined}
          disabled={isProcessing}
          placeholder={placeholder}
          rows={3}
          className={cn(
            "flex-1 px-2 py-1 border border-blue-500 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500",
            error && "border-red-500",
            inputClassName
          )}
        />
      ) : (
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveOnBlur ? handleSave : undefined}
          disabled={isProcessing}
          placeholder={placeholder}
          className={cn(
            "flex-1 h-8 text-sm border-blue-500 focus:ring-blue-500",
            error && "border-red-500",
            inputClassName
          )}
        />
      )}

      {/* 액션 버튼 */}
      <div className="flex items-center gap-1">
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : (
          <>
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              aria-label="저장"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={cancelEditing}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
              aria-label="취소"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* 에러 표시 */}
      {error && (
        <span className="text-xs text-red-500 absolute -bottom-5 left-0">
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * 인라인 편집 가능한 테이블 셀
 */
interface InlineEditCellProps extends Omit<InlineEditProps, "className"> {
  cellClassName?: string;
}

export function InlineEditCell(props: InlineEditCellProps) {
  return (
    <div className="relative">
      <InlineEdit {...props} className={cn("py-1", props.cellClassName)} />
    </div>
  );
}
