"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SearchHighlightProps {
  text: string;
  highlight: string;
  className?: string;
  highlightClassName?: string;
  caseSensitive?: boolean;
}

/**
 * 검색어 하이라이트 컴포넌트
 * 텍스트 내에서 검색어를 찾아 강조 표시합니다.
 */
export function SearchHighlight({
  text,
  highlight,
  className,
  highlightClassName = "bg-yellow-200 text-yellow-900 font-medium px-0.5 rounded",
  caseSensitive = false,
}: SearchHighlightProps) {
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(
    `(${escapeRegExp(highlight)})`,
    caseSensitive ? "g" : "gi"
  );
  
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = caseSensitive
          ? part === highlight
          : part.toLowerCase() === highlight.toLowerCase();

        return isMatch ? (
          <mark key={index} className={cn("bg-transparent", highlightClassName)}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        );
      })}
    </span>
  );
}

/**
 * 여러 검색어 하이라이트 (공백으로 구분된 검색어들)
 */
interface MultiSearchHighlightProps {
  text: string;
  highlights: string[];
  className?: string;
  highlightClassName?: string;
  caseSensitive?: boolean;
}

export function MultiSearchHighlight({
  text,
  highlights,
  className,
  highlightClassName = "bg-yellow-200 text-yellow-900 font-medium px-0.5 rounded",
  caseSensitive = false,
}: MultiSearchHighlightProps) {
  if (!highlights.length || highlights.every((h) => !h.trim())) {
    return <span className={className}>{text}</span>;
  }

  const validHighlights = highlights.filter((h) => h.trim());
  const pattern = validHighlights.map(escapeRegExp).join("|");
  const regex = new RegExp(`(${pattern})`, caseSensitive ? "g" : "gi");
  
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = validHighlights.some((h) =>
          caseSensitive ? part === h : part.toLowerCase() === h.toLowerCase()
        );

        return isMatch ? (
          <mark key={index} className={cn("bg-transparent", highlightClassName)}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        );
      })}
    </span>
  );
}

/**
 * 정규식 특수문자 이스케이프
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 검색어 하이라이트가 적용된 테이블 셀
 */
interface HighlightedCellProps {
  value: string | number | null | undefined;
  searchTerm?: string;
  className?: string;
}

export function HighlightedCell({
  value,
  searchTerm,
  className,
}: HighlightedCellProps) {
  const stringValue = value?.toString() ?? "";
  
  if (!searchTerm) {
    return <span className={className}>{stringValue}</span>;
  }

  return (
    <SearchHighlight
      text={stringValue}
      highlight={searchTerm}
      className={className}
    />
  );
}
