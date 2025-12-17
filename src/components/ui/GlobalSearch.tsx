"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui";
import {
  Search,
  User,
  Building2,
  Hash,
  X,
  Loader2,
  ChevronRight,
} from "lucide-react";

// 검색 결과 타입
interface SearchResult {
  id: string;
  type: "employee" | "department" | "document";
  title: string;
  subtitle?: string;
  meta?: string;
  href: string;
}

// 검색 결과 그룹
interface SearchResultGroup {
  type: "employee" | "department" | "document";
  label: string;
  items: SearchResult[];
}

// Props
interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({
  placeholder = "사번, 이름, 부서 검색...",
  className = "",
}: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResultGroup[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 모든 결과를 플랫하게
  const flatResults = results.flatMap((group) => group.items);

  // 검색 실행
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.groups || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 디바운스된 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && flatResults[selectedIndex]) {
          handleSelect(flatResults[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // 결과 선택
  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    setIsOpen(false);
    setQuery("");
  };

  // 아이콘 가져오기
  const getIcon = (type: string) => {
    switch (type) {
      case "employee":
        return User;
      case "department":
        return Building2;
      default:
        return Hash;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 검색 입력 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-8 w-full"
          aria-label="전역 검색"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100"
            aria-label="검색어 지우기"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-auto z-50"
          role="listbox"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">검색 중...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {query.length >= 2
                ? "검색 결과가 없습니다"
                : "2글자 이상 입력해주세요"}
            </div>
          ) : (
            results.map((group) => (
              <div key={group.type}>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 sticky top-0">
                  {group.label}
                </div>
                {group.items.map((item, itemIndex) => {
                  const globalIndex = flatResults.indexOf(item);
                  const Icon = getIcon(item.type);
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="p-1.5 rounded bg-gray-100">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-sm text-gray-500 truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      {item.meta && (
                        <span className="text-xs text-gray-400">{item.meta}</span>
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// 단축키 Ctrl+K 또는 Command+K 지원
export function useGlobalSearchShortcut(callback: () => void) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        callback();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [callback]);
}
