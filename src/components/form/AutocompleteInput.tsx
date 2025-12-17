"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui";
import { Search, X, Loader2, ChevronRight, User, Building2, Briefcase } from "lucide-react";

export type AutocompleteDataSource = "departments" | "positions" | "employees";

interface AutocompleteOption {
  id: string;
  label: string;
  sublabel?: string;
  meta?: string;
}

interface AutocompleteInputProps {
  dataSource: AutocompleteDataSource;
  value?: string;
  onSelect: (item: AutocompleteOption) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  required?: boolean;
  label?: string;
}

// 데이터 소스별 아이콘
const sourceIcons: Record<AutocompleteDataSource, React.ComponentType<{ className?: string }>> = {
  departments: Building2,
  positions: Briefcase,
  employees: User,
};

// API 엔드포인트 매핑
const apiEndpoints: Record<AutocompleteDataSource, string> = {
  departments: "/api/search/departments",
  positions: "/api/search/positions",
  employees: "/api/search/employees",
};

export function AutocompleteInput({
  dataSource,
  value = "",
  onSelect,
  onChange,
  placeholder,
  disabled = false,
  error,
  className,
  required = false,
  label,
}: AutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const Icon = sourceIcons[dataSource];

  // 검색 실행
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiEndpoints[dataSource]}?q=${encodeURIComponent(query)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setOptions(data.results || data || []);
      } else {
        // API가 없을 경우 Mock 데이터 사용
        setOptions(getMockData(dataSource, query));
      }
    } catch {
      // 에러 시 Mock 데이터
      setOptions(getMockData(dataSource, query));
    } finally {
      setIsLoading(false);
    }
  }, [dataSource]);

  // 디바운스된 검색
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(inputValue);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, performSearch]);

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

  // 입력 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && options[selectedIndex]) {
          handleSelect(options[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // 선택 핸들러
  const handleSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onSelect(option);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // 클리어
  const handleClear = () => {
    setInputValue("");
    onChange?.("");
    setOptions([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || getPlaceholder(dataSource)}
          disabled={disabled}
          className={cn(
            "pl-10 pr-8",
            error && "border-red-500 focus:ring-red-500"
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
        
        {inputValue && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100"
            type="button"
            aria-label="지우기"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {/* 드롭다운 */}
      {isOpen && (inputValue.length >= 2 || options.length > 0) && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto z-50"
          role="listbox"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">검색 중...</span>
            </div>
          ) : options.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {inputValue.length >= 2
                ? "검색 결과가 없습니다"
                : "2글자 이상 입력해주세요"}
            </div>
          ) : (
            options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                  index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
                )}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="p-1.5 rounded bg-gray-100">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {option.label}
                  </p>
                  {option.sublabel && (
                    <p className="text-sm text-gray-500 truncate">
                      {option.sublabel}
                    </p>
                  )}
                </div>
                {option.meta && (
                  <span className="text-xs text-gray-400">{option.meta}</span>
                )}
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// 데이터 소스별 플레이스홀더
function getPlaceholder(dataSource: AutocompleteDataSource): string {
  switch (dataSource) {
    case "departments":
      return "부서 검색...";
    case "positions":
      return "직위/직책 검색...";
    case "employees":
      return "직원 검색 (이름, 사번)...";
    default:
      return "검색...";
  }
}

// Mock 데이터 (API 미구현 시)
function getMockData(dataSource: AutocompleteDataSource, query: string): AutocompleteOption[] {
  const mockData: Record<AutocompleteDataSource, AutocompleteOption[]> = {
    departments: [
      { id: "1", label: "개발팀", sublabel: "IT본부", meta: "156명" },
      { id: "2", label: "마케팅팀", sublabel: "영업본부", meta: "89명" },
      { id: "3", label: "인사팀", sublabel: "경영지원본부", meta: "45명" },
      { id: "4", label: "재무팀", sublabel: "경영지원본부", meta: "32명" },
      { id: "5", label: "영업팀", sublabel: "영업본부", meta: "134명" },
    ],
    positions: [
      { id: "1", label: "사원", sublabel: "일반직" },
      { id: "2", label: "대리", sublabel: "일반직" },
      { id: "3", label: "과장", sublabel: "일반직" },
      { id: "4", label: "차장", sublabel: "일반직" },
      { id: "5", label: "부장", sublabel: "관리직" },
      { id: "6", label: "이사", sublabel: "임원" },
    ],
    employees: [
      { id: "1", label: "김철수", sublabel: "개발팀 · 과장", meta: "E001" },
      { id: "2", label: "이영희", sublabel: "마케팅팀 · 대리", meta: "E002" },
      { id: "3", label: "박민수", sublabel: "영업팀 · 차장", meta: "E003" },
      { id: "4", label: "정수진", sublabel: "인사팀 · 사원", meta: "E004" },
      { id: "5", label: "최동현", sublabel: "개발팀 · 사원", meta: "E005" },
    ],
  };

  const lowerQuery = query.toLowerCase();
  return mockData[dataSource].filter(
    (item) =>
      item.label.toLowerCase().includes(lowerQuery) ||
      item.sublabel?.toLowerCase().includes(lowerQuery) ||
      item.meta?.toLowerCase().includes(lowerQuery)
  );
}
