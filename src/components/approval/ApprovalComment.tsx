"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { MessageSquare, Send, X, Loader2, AlertCircle } from "lucide-react";

interface ApprovalCommentProps {
  type: "approve" | "reject";
  onSubmit: (comment: string) => void | Promise<void>;
  onCancel: () => void;
  isProcessing?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function ApprovalComment({
  type,
  onSubmit,
  onCancel,
  isProcessing = false,
  required = false,
  placeholder,
  className,
}: ApprovalCommentProps) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isApprove = type === "approve";
  const defaultPlaceholder = isApprove
    ? "승인 의견을 입력하세요 (선택사항)"
    : "반려 사유를 입력하세요";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (required && !comment.trim()) {
      setError("사유를 입력해주세요");
      return;
    }

    setError(null);
    await onSubmit(comment);
  };

  return (
    <div className={cn("mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200", className)}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isApprove ? "bg-green-100" : "bg-red-100"
          )}>
            <MessageSquare className={cn(
              "w-5 h-5",
              isApprove ? "text-green-600" : "text-red-600"
            )} />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isApprove ? "승인 의견" : "반려 사유"}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError(null);
              }}
              placeholder={placeholder || defaultPlaceholder}
              rows={3}
              className={cn(
                "w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2",
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
              )}
              disabled={isProcessing}
            />

            {error && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 mt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isProcessing}
              >
                <X className="w-4 h-4 mr-1" />
                취소
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isProcessing}
                className={isApprove 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
                }
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    {isApprove ? "승인" : "반려"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// 읽기 전용 코멘트 표시
interface CommentDisplayProps {
  comment: string;
  author: string;
  date: string;
  type: "approve" | "reject" | "comment";
  className?: string;
}

export function CommentDisplay({
  comment,
  author,
  date,
  type,
  className,
}: CommentDisplayProps) {
  const bgColors = {
    approve: "bg-green-50 border-green-200",
    reject: "bg-red-50 border-red-200",
    comment: "bg-gray-50 border-gray-200",
  };

  const textColors = {
    approve: "text-green-700",
    reject: "text-red-700",
    comment: "text-gray-700",
  };

  const labels = {
    approve: "승인 의견",
    reject: "반려 사유",
    comment: "의견",
  };

  return (
    <div className={cn("p-3 rounded-lg border", bgColors[type], className)}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-sm font-medium", textColors[type])}>
          {labels[type]}
        </span>
        <span className="text-xs text-gray-500">
          {author} · {date}
        </span>
      </div>
      <p className={cn("text-sm", textColors[type])}>{comment}</p>
    </div>
  );
}
