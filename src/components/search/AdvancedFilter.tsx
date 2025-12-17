"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button, Badge, Input } from "@/components/ui";
import {
  Filter,
  X,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  Search,
  Bookmark,
} from "lucide-react";

export type FilterOperator = "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "gte" | "lt" | "lte" | "between" | "in" | "notEquals";

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | number | [string, string] | [number, number] | string[];
}

export interface FilterField {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "dateRange" | "multiSelect";
  options?: { value: string; label: string }[];
}

export interface FilterPreset {
  id: string;
  name: string;
  conditions: FilterCondition[];
}

interface AdvancedFilterProps {
  fields: FilterField[];
  onApply: (conditions: FilterCondition[]) => void;
  onClear?: () => void;
  presets?: FilterPreset[];
  onSavePreset?: (name: string, conditions: FilterCondition[]) => void;
  onDeletePreset?: (id: string) => void;
  defaultConditions?: FilterCondition[];
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// 연산자별 레이블
const operatorLabels: Record<FilterOperator, string> = {
  equals: "=",
  notEquals: "≠",
  contains: "포함",
  startsWith: "시작",
  endsWith: "끝남",
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
  between: "사이",
  in: "포함(다중)",
};

// 필드 타입별 지원 연산자
const operatorsByType: Record<string, FilterOperator[]> = {
  text: ["equals", "notEquals", "contains", "startsWith", "endsWith"],
  number: ["equals", "notEquals", "gt", "gte", "lt", "lte", "between"],
  select: ["equals", "notEquals", "in"],
  date: ["equals", "gt", "gte", "lt", "lte", "between"],
  dateRange: ["between"],
  multiSelect: ["in"],
};

export function AdvancedFilter({
  fields,
  onApply,
  onClear,
  presets = [],
  onSavePreset,
  onDeletePreset,
  defaultConditions = [],
  className,
  collapsible = true,
  defaultExpanded = false,
}: AdvancedFilterProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [conditions, setConditions] = useState<FilterCondition[]>(defaultConditions);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState("");

  // 조건 추가
  const addCondition = useCallback(() => {
    const newCondition: FilterCondition = {
      id: `cond-${Date.now()}`,
      field: fields[0]?.key || "",
      operator: "equals",
      value: "",
    };
    setConditions((prev) => [...prev, newCondition]);
  }, [fields]);

  // 조건 삭제
  const removeCondition = useCallback((id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // 조건 업데이트
  const updateCondition = useCallback(
    (id: string, updates: Partial<FilterCondition>) => {
      setConditions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    []
  );

  // 필터 적용
  const handleApply = useCallback(() => {
    const validConditions = conditions.filter(
      (c) => c.field && c.value !== "" && c.value !== undefined
    );
    onApply(validConditions);
  }, [conditions, onApply]);

  // 필터 초기화
  const handleClear = useCallback(() => {
    setConditions([]);
    onClear?.();
  }, [onClear]);

  // 프리셋 저장
  const handleSavePreset = useCallback(() => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), conditions);
      setPresetName("");
      setShowPresetDialog(false);
    }
  }, [presetName, conditions, onSavePreset]);

  // 프리셋 적용
  const applyPreset = useCallback((preset: FilterPreset) => {
    setConditions(preset.conditions);
  }, []);

  const activeCount = conditions.filter(
    (c) => c.field && c.value !== "" && c.value !== undefined
  ).length;

  return (
    <div className={cn("border border-gray-200 rounded-xl bg-white", className)}>
      {/* 헤더 */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3",
          collapsible && "cursor-pointer hover:bg-gray-50",
          isExpanded && "border-b border-gray-100"
        )}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">고급 필터</span>
          {activeCount > 0 && (
            <Badge variant="default">{activeCount}개 적용</Badge>
          )}
        </div>

        {collapsible && (
          <button className="p-1">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        )}
      </div>

      {/* 필터 본문 */}
      {(!collapsible || isExpanded) && (
        <div className="p-4 space-y-4">
          {/* 프리셋 */}
          {presets.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">저장된 필터:</span>
              {presets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-1">
                  <button
                    onClick={() => applyPreset(preset)}
                    className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {preset.name}
                  </button>
                  {onDeletePreset && (
                    <button
                      onClick={() => onDeletePreset(preset.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 조건 목록 */}
          <div className="space-y-2">
            {conditions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">필터 조건을 추가하세요</p>
              </div>
            ) : (
              conditions.map((condition, index) => (
                <FilterConditionRow
                  key={condition.id}
                  condition={condition}
                  fields={fields}
                  onUpdate={(updates) => updateCondition(condition.id, updates)}
                  onRemove={() => removeCondition(condition.id)}
                  showAndLabel={index > 0}
                />
              ))
            )}
          </div>

          {/* 조건 추가 버튼 */}
          <button
            onClick={addCondition}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            조건 추가
          </button>

          {/* 액션 버튼 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {conditions.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  초기화
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onSavePreset && conditions.length > 0 && (
                <>
                  {showPresetDialog ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="프리셋 이름"
                        className="w-32 h-8 text-sm"
                      />
                      <Button size="sm" variant="ghost" onClick={handleSavePreset}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPresetDialog(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPresetDialog(true)}
                    >
                      <Bookmark className="w-4 h-4 mr-1" />
                      저장
                    </Button>
                  )}
                </>
              )}
              <Button size="sm" onClick={handleApply} disabled={conditions.length === 0}>
                <Search className="w-4 h-4 mr-1" />
                필터 적용
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 개별 조건 행 컴포넌트
interface FilterConditionRowProps {
  condition: FilterCondition;
  fields: FilterField[];
  onUpdate: (updates: Partial<FilterCondition>) => void;
  onRemove: () => void;
  showAndLabel?: boolean;
}

function FilterConditionRow({
  condition,
  fields,
  onUpdate,
  onRemove,
  showAndLabel,
}: FilterConditionRowProps) {
  const selectedField = fields.find((f) => f.key === condition.field);
  const availableOperators = operatorsByType[selectedField?.type || "text"] || operatorsByType.text;

  // 필드 변경 시 연산자와 값 초기화
  const handleFieldChange = (fieldKey: string) => {
    const newField = fields.find((f) => f.key === fieldKey);
    const newOperators = operatorsByType[newField?.type || "text"];
    onUpdate({
      field: fieldKey,
      operator: newOperators[0],
      value: "",
    });
  };

  return (
    <div className="flex items-center gap-2">
      {showAndLabel && (
        <span className="text-xs text-gray-400 w-8">AND</span>
      )}
      {!showAndLabel && <div className="w-8" />}

      {/* 필드 선택 */}
      <select
        value={condition.field}
        onChange={(e) => handleFieldChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {fields.map((field) => (
          <option key={field.key} value={field.key}>
            {field.label}
          </option>
        ))}
      </select>

      {/* 연산자 선택 */}
      <select
        value={condition.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as FilterOperator })}
        className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {availableOperators.map((op) => (
          <option key={op} value={op}>
            {operatorLabels[op]}
          </option>
        ))}
      </select>

      {/* 값 입력 */}
      {condition.operator === "between" ? (
        <div className="flex items-center gap-1 flex-1">
          <Input
            type={selectedField?.type === "date" ? "date" : "text"}
            value={Array.isArray(condition.value) ? String(condition.value[0] || "") : ""}
            onChange={(e) => {
              const currentValue = Array.isArray(condition.value) ? condition.value : ["", ""];
              onUpdate({
                value: [e.target.value, String(currentValue[1] || "")] as [string, string],
              });
            }}
            className="flex-1 text-sm"
            placeholder="시작"
          />
          <span className="text-gray-400">~</span>
          <Input
            type={selectedField?.type === "date" ? "date" : "text"}
            value={Array.isArray(condition.value) ? String(condition.value[1] || "") : ""}
            onChange={(e) => {
              const currentValue = Array.isArray(condition.value) ? condition.value : ["", ""];
              onUpdate({
                value: [String(currentValue[0] || ""), e.target.value] as [string, string],
              });
            }}
            className="flex-1 text-sm"
            placeholder="끝"
          />
        </div>
      ) : selectedField?.type === "select" || selectedField?.type === "multiSelect" ? (
        <select
          value={condition.value as string}
          onChange={(e) => onUpdate({ value: e.target.value })}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">선택...</option>
          {selectedField.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          type={selectedField?.type === "number" ? "number" : selectedField?.type === "date" ? "date" : "text"}
          value={condition.value as string}
          onChange={(e) => onUpdate({ value: e.target.value })}
          className="flex-1 text-sm"
          placeholder="값 입력"
        />
      )}

      {/* 삭제 버튼 */}
      <button
        onClick={onRemove}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// 필터 조건을 쿼리 파라미터로 변환
export function conditionsToQueryParams(conditions: FilterCondition[]): Record<string, string> {
  const params: Record<string, string> = {};
  
  conditions.forEach((condition, index) => {
    params[`filter[${index}][field]`] = condition.field;
    params[`filter[${index}][operator]`] = condition.operator;
    params[`filter[${index}][value]`] = Array.isArray(condition.value)
      ? condition.value.join(",")
      : String(condition.value);
  });
  
  return params;
}

// 쿼리 파라미터를 필터 조건으로 변환
export function queryParamsToConditions(params: URLSearchParams): FilterCondition[] {
  const conditions: FilterCondition[] = [];
  const indices = new Set<number>();
  
  params.forEach((_, key) => {
    const match = key.match(/^filter\[(\d+)\]/);
    if (match) {
      indices.add(parseInt(match[1]));
    }
  });
  
  indices.forEach((index) => {
    const field = params.get(`filter[${index}][field]`);
    const operator = params.get(`filter[${index}][operator]`) as FilterOperator;
    const valueStr = params.get(`filter[${index}][value]`);
    
    if (field && operator && valueStr) {
      conditions.push({
        id: `cond-${index}`,
        field,
        operator,
        value: operator === "between" || operator === "in" ? valueStr.split(",") : valueStr,
      });
    }
  });
  
  return conditions;
}
