"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Plus, Minus, Equal } from "lucide-react";

interface DiffViewerProps {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  labels?: Record<string, string>;
  className?: string;
  mode?: "inline" | "side-by-side";
}

// 필드명 한글 레이블 기본값
const defaultLabels: Record<string, string> = {
  name: "이름",
  department: "부서",
  position: "직위",
  salary: "급여",
  startDate: "시작일",
  endDate: "종료일",
  email: "이메일",
  phone: "전화번호",
  address: "주소",
  status: "상태",
  type: "유형",
  reason: "사유",
  amount: "금액",
  days: "일수",
  manager: "담당자",
};

export function DiffViewer({
  before,
  after,
  labels = {},
  className,
  mode = "inline",
}: DiffViewerProps) {
  const allLabels = { ...defaultLabels, ...labels };

  // 모든 키 수집
  const allKeys = Array.from(
    new Set([...Object.keys(before), ...Object.keys(after)])
  );

  // 변경 타입 결정
  const getChangeType = (key: string): "added" | "removed" | "modified" | "unchanged" => {
    const hasInBefore = key in before;
    const hasInAfter = key in after;

    if (!hasInBefore && hasInAfter) return "added";
    if (hasInBefore && !hasInAfter) return "removed";
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) return "modified";
    return "unchanged";
  };

  // 값 포맷팅
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "예" : "아니오";
    if (typeof value === "number") {
      // 숫자가 크면 통화 포맷
      if (value >= 1000) {
        return new Intl.NumberFormat("ko-KR").format(value);
      }
      return value.toString();
    }
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  // 변경 아이콘
  const getIcon = (type: "added" | "removed" | "modified" | "unchanged") => {
    switch (type) {
      case "added":
        return <Plus className="w-4 h-4 text-green-500" />;
      case "removed":
        return <Minus className="w-4 h-4 text-red-500" />;
      case "modified":
        return <ArrowRight className="w-4 h-4 text-blue-500" />;
      case "unchanged":
        return <Equal className="w-4 h-4 text-gray-300" />;
    }
  };

  // 변경 스타일
  const getRowStyle = (type: "added" | "removed" | "modified" | "unchanged") => {
    switch (type) {
      case "added":
        return "bg-green-50 border-l-4 border-green-500";
      case "removed":
        return "bg-red-50 border-l-4 border-red-500";
      case "modified":
        return "bg-blue-50 border-l-4 border-blue-500";
      case "unchanged":
        return "bg-gray-50";
    }
  };

  // 변경된 항목만 필터링 (unchanged 제외)
  const changedKeys = allKeys.filter((key) => getChangeType(key) !== "unchanged");

  if (changedKeys.length === 0) {
    return (
      <div className={cn("p-4 bg-gray-50 rounded-lg text-center text-gray-500", className)}>
        변경 사항이 없습니다
      </div>
    );
  }

  if (mode === "side-by-side") {
    return (
      <div className={cn("border border-gray-200 rounded-lg overflow-hidden", className)}>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">항목</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">변경 전</th>
              <th className="px-4 py-2 text-center w-12"></th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">변경 후</th>
            </tr>
          </thead>
          <tbody>
            {changedKeys.map((key) => {
              const changeType = getChangeType(key);
              const label = allLabels[key] || key;

              return (
                <tr key={key} className={cn("border-t border-gray-100", getRowStyle(changeType))}>
                  <td className="px-4 py-3 font-medium text-gray-700">{label}</td>
                  <td className={cn(
                    "px-4 py-3",
                    changeType === "removed" && "line-through text-red-600",
                    changeType === "modified" && "text-gray-500"
                  )}>
                    {key in before ? formatValue(before[key]) : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getIcon(changeType)}
                  </td>
                  <td className={cn(
                    "px-4 py-3",
                    changeType === "added" && "text-green-600 font-medium",
                    changeType === "modified" && "text-blue-600 font-medium"
                  )}>
                    {key in after ? formatValue(after[key]) : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Inline 모드
  return (
    <div className={cn("space-y-2", className)}>
      {changedKeys.map((key) => {
        const changeType = getChangeType(key);
        const label = allLabels[key] || key;

        return (
          <div
            key={key}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg",
              getRowStyle(changeType)
            )}
          >
            {getIcon(changeType)}
            <span className="font-medium text-gray-700 min-w-[100px]">
              {label}
            </span>
            
            {changeType === "modified" && (
              <>
                <span className="text-gray-500 line-through">
                  {formatValue(before[key])}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="text-blue-600 font-medium">
                  {formatValue(after[key])}
                </span>
              </>
            )}

            {changeType === "added" && (
              <span className="text-green-600 font-medium">
                {formatValue(after[key])} (추가됨)
              </span>
            )}

            {changeType === "removed" && (
              <span className="text-red-600 line-through">
                {formatValue(before[key])} (삭제됨)
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// 간단한 변경 요약 컴포넌트
export function DiffSummary({
  before,
  after,
}: {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}) {
  const allKeys = Array.from(
    new Set([...Object.keys(before), ...Object.keys(after)])
  );

  let added = 0;
  let removed = 0;
  let modified = 0;

  allKeys.forEach((key) => {
    const hasInBefore = key in before;
    const hasInAfter = key in after;

    if (!hasInBefore && hasInAfter) added++;
    else if (hasInBefore && !hasInAfter) removed++;
    else if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) modified++;
  });

  const total = added + removed + modified;

  if (total === 0) {
    return <span className="text-gray-500 text-sm">변경 없음</span>;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {modified > 0 && (
        <span className="text-blue-600">
          {modified}개 수정
        </span>
      )}
      {added > 0 && (
        <span className="text-green-600">
          +{added}개 추가
        </span>
      )}
      {removed > 0 && (
        <span className="text-red-600">
          -{removed}개 삭제
        </span>
      )}
    </div>
  );
}
