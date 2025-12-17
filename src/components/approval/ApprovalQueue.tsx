"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { DiffViewer } from "./DiffViewer";
import { ApprovalComment } from "./ApprovalComment";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  requester: {
    id: string;
    name: string;
    department: string;
    position?: string;
  };
  requestDate: string;
  status: ApprovalStatus;
  priority?: "high" | "normal" | "low";
  summary?: string;
  changes?: {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  };
  attachments?: { name: string; url: string }[];
}

interface ApprovalQueueProps {
  items: ApprovalItem[];
  onApprove: (id: string, comment?: string) => void | Promise<void>;
  onReject: (id: string, reason: string) => void | Promise<void>;
  onBulkApprove?: (ids: string[]) => void | Promise<void>;
  onBulkReject?: (ids: string[], reason: string) => void | Promise<void>;
  onItemClick?: (item: ApprovalItem) => void;
  showBulkActions?: boolean;
  className?: string;
}

// 상태별 색상 및 아이콘
const statusConfig: Record<ApprovalStatus, { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { color: "text-orange-600", bgColor: "bg-orange-100", icon: Clock },
  approved: { color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
  rejected: { color: "text-red-600", bgColor: "bg-red-100", icon: XCircle },
};

const statusLabels: Record<ApprovalStatus, string> = {
  pending: "대기",
  approved: "승인",
  rejected: "반려",
};

export function ApprovalQueue({
  items,
  onApprove,
  onReject,
  onBulkApprove,
  onBulkReject,
  onItemClick,
  showBulkActions = true,
  className,
}: ApprovalQueueProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingItems = items.filter((item) => item.status === "pending");
  const allSelected = pendingItems.length > 0 && selectedIds.size === pendingItems.length;

  // 선택 토글
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // 전체 선택
  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingItems.map((item) => item.id)));
    }
  }, [allSelected, pendingItems]);

  // 개별 승인
  const handleApprove = useCallback(
    async (id: string, comment?: string) => {
      setIsProcessing(true);
      try {
        await onApprove(id, comment);
        setCommentingId(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [onApprove]
  );

  // 개별 반려
  const handleReject = useCallback(
    async (id: string, reason: string) => {
      setIsProcessing(true);
      try {
        await onReject(id, reason);
        setRejectingId(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [onReject]
  );

  // 일괄 승인
  const handleBulkApprove = useCallback(async () => {
    if (selectedIds.size === 0 || !onBulkApprove) return;
    
    setIsProcessing(true);
    try {
      await onBulkApprove(Array.from(selectedIds));
      setSelectedIds(new Set());
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, onBulkApprove]);

  // 일괄 반려
  const handleBulkReject = useCallback(
    async (reason: string) => {
      if (selectedIds.size === 0 || !onBulkReject) return;
      
      setIsProcessing(true);
      try {
        await onBulkReject(Array.from(selectedIds), reason);
        setSelectedIds(new Set());
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedIds, onBulkReject]
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* 일괄 처리 바 */}
      {showBulkActions && pendingItems.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">전체 선택</span>
                </label>
                
                {selectedIds.size > 0 && (
                  <Badge variant="default">
                    {selectedIds.size}건 선택됨
                  </Badge>
                )}
              </div>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    일괄 승인
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectingId("bulk")}
                    disabled={isProcessing}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    일괄 반려
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 승인 대기 카운트 */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">승인 대기</h2>
        <Badge variant="warning">{pendingItems.length}건</Badge>
      </div>

      {/* 빈 상태 */}
      {items.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <p className="text-gray-500">대기 중인 결재가 없습니다</p>
          </CardContent>
        </Card>
      )}

      {/* 승인 항목 목록 */}
      <div className="space-y-3">
        {items.map((item) => {
          const { color, bgColor, icon: StatusIcon } = statusConfig[item.status];
          const isExpanded = expandedId === item.id;
          const isCommenting = commentingId === item.id;
          const isRejecting = rejectingId === item.id;
          const isSelected = selectedIds.has(item.id);

          return (
            <Card
              key={item.id}
              className={cn(
                "transition-all",
                isSelected && "ring-2 ring-blue-500",
                isExpanded && "shadow-lg"
              )}
            >
              <CardContent className="p-4">
                {/* 메인 행 */}
                <div className="flex items-start gap-4">
                  {/* 체크박스 (대기 상태만) */}
                  {item.status === "pending" && showBulkActions && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}

                  {/* 상태 아이콘 */}
                  <div className={cn("p-2 rounded-lg", bgColor)}>
                    <StatusIcon className={cn("w-5 h-5", color)} />
                  </div>

                  {/* 내용 */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      onItemClick?.(item);
                      setExpandedId(isExpanded ? null : item.id);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{item.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                      {item.priority === "high" && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          긴급
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {item.requester.name} · {item.requester.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.requestDate}
                      </span>
                    </div>

                    {item.summary && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {item.summary}
                      </p>
                    )}
                  </div>

                  {/* 확장 토글 */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* 액션 버튼 (대기 상태만) */}
                  {item.status === "pending" && !isExpanded && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(item.id);
                        }}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRejectingId(item.id);
                        }}
                        disabled={isProcessing}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        반려
                      </Button>
                    </div>
                  )}
                </div>

                {/* 확장된 상세 영역 */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                    {/* 변경 내용 비교 */}
                    {item.changes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          변경 내용
                        </h4>
                        <DiffViewer
                          before={item.changes.before}
                          after={item.changes.after}
                        />
                      </div>
                    )}

                    {/* 첨부파일 */}
                    {item.attachments && item.attachments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          첨부파일
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {item.attachments.map((file, i) => (
                            <a
                              key={i}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
                            >
                              📎 {file.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 승인/반려 버튼 (확장 시) */}
                    {item.status === "pending" && (
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          onClick={() => setCommentingId(item.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          의견과 함께 승인
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setRejectingId(item.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          반려
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleApprove(item.id)}
                          disabled={isProcessing}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          바로 승인
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* 승인 코멘트 모달 */}
                {isCommenting && (
                  <ApprovalComment
                    type="approve"
                    onSubmit={(comment) => handleApprove(item.id, comment)}
                    onCancel={() => setCommentingId(null)}
                    isProcessing={isProcessing}
                  />
                )}

                {/* 반려 사유 모달 */}
                {isRejecting && (
                  <ApprovalComment
                    type="reject"
                    onSubmit={(reason) => handleReject(item.id, reason)}
                    onCancel={() => setRejectingId(null)}
                    isProcessing={isProcessing}
                    required
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 일괄 반려 모달 */}
      {rejectingId === "bulk" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedIds.size}건 일괄 반려
            </h3>
            <ApprovalComment
              type="reject"
              onSubmit={handleBulkReject}
              onCancel={() => setRejectingId(null)}
              isProcessing={isProcessing}
              required
            />
          </div>
        </div>
      )}
    </div>
  );
}
