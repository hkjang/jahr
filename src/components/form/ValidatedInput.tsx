"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui";
import { Check, X, AlertCircle, Eye, EyeOff } from "lucide-react";

export type ValidationType = "required" | "email" | "phone" | "minLength" | "maxLength" | "pattern" | "custom";

export interface ValidationRule {
  type: ValidationType;
  message: string;
  value?: number | string | RegExp;
  validate?: (value: string) => boolean | Promise<boolean>;
}

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  rules?: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showSuccessIcon?: boolean;
  helpText?: string;
  error?: string; // 외부에서 주입하는 에러
}

export function ValidatedInput({
  label,
  value,
  onChange,
  rules = [],
  validateOnChange = true,
  validateOnBlur = true,
  showSuccessIcon = true,
  helpText,
  error: externalError,
  type = "text",
  required,
  className,
  ...props
}: ValidatedInputProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isTouched, setIsTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const error = externalError || internalError;
  const isPassword = type === "password";

  // required 속성이 있으면 자동으로 규칙 추가
  const allRules = React.useMemo(() => {
    if (required && !rules.some((r) => r.type === "required")) {
      return [{ type: "required" as const, message: "필수 입력 항목입니다." }, ...rules];
    }
    return rules;
  }, [rules, required]);

  // 유효성 검사 실행
  const validate = useCallback(async (val: string): Promise<boolean> => {
    for (const rule of allRules) {
      let isRuleValid = true;

      switch (rule.type) {
        case "required":
          isRuleValid = val.trim().length > 0;
          break;
        case "email":
          isRuleValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
          break;
        case "phone":
          isRuleValid = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(val.replace(/-/g, ""));
          break;
        case "minLength":
          isRuleValid = val.length >= (rule.value as number);
          break;
        case "maxLength":
          isRuleValid = val.length <= (rule.value as number);
          break;
        case "pattern":
          isRuleValid = (rule.value as RegExp).test(val);
          break;
        case "custom":
          if (rule.validate) {
            isRuleValid = await rule.validate(val);
          }
          break;
      }

      if (!isRuleValid) {
        setInternalError(rule.message);
        setIsValid(false);
        return false;
      }
    }

    setInternalError(null);
    setIsValid(val.length > 0 ? true : null);
    return true;
  }, [allRules]);

  // 값 변경 시
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      if (validateOnChange && isTouched) {
        validate(newValue);
      }
    },
    [onChange, validateOnChange, isTouched, validate]
  );

  // blur 시 검증
  const handleBlur = useCallback(() => {
    setIsTouched(true);
    if (validateOnBlur) {
      validate(value);
    }
  }, [validateOnBlur, validate, value]);

  // 외부 에러 변경 시 상태 업데이트
  useEffect(() => {
    if (externalError) {
      setIsValid(false);
    }
  }, [externalError]);

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <Input
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "pr-10",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            isValid === true && !error && "border-green-500 focus:ring-green-500 focus:border-green-500"
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : helpText ? `${props.id}-help` : undefined}
          {...props}
        />

        {/* 상태 아이콘 */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 hover:bg-gray-100 rounded"
              tabIndex={-1}
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}
          
          {error && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          
          {showSuccessIcon && isValid === true && !error && (
            <Check className="w-4 h-4 text-green-500" />
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p id={`${props.id}-error`} className="text-sm text-red-500 flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}

      {/* 도움말 텍스트 */}
      {helpText && !error && (
        <p id={`${props.id}-help`} className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
}

// 텍스트 영역 버전
interface ValidatedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  rules?: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  helpText?: string;
  error?: string;
  maxLengthDisplay?: boolean;
}

export function ValidatedTextarea({
  label,
  value,
  onChange,
  rules = [],
  validateOnChange = true,
  validateOnBlur = true,
  helpText,
  error: externalError,
  required,
  maxLength,
  maxLengthDisplay = true,
  className,
  ...props
}: ValidatedTextareaProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  const error = externalError || internalError;

  // 유효성 검사
  const validate = useCallback(async (val: string): Promise<boolean> => {
    const allRules = required && !rules.some((r) => r.type === "required")
      ? [{ type: "required" as const, message: "필수 입력 항목입니다." }, ...rules]
      : rules;

    for (const rule of allRules) {
      let isRuleValid = true;

      switch (rule.type) {
        case "required":
          isRuleValid = val.trim().length > 0;
          break;
        case "minLength":
          isRuleValid = val.length >= (rule.value as number);
          break;
        case "maxLength":
          isRuleValid = val.length <= (rule.value as number);
          break;
        case "custom":
          if (rule.validate) {
            isRuleValid = await rule.validate(val);
          }
          break;
      }

      if (!isRuleValid) {
        setInternalError(rule.message);
        return false;
      }
    }

    setInternalError(null);
    return true;
  }, [rules, required]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      if (validateOnChange && isTouched) {
        validate(newValue);
      }
    },
    [onChange, validateOnChange, isTouched, validate]
  );

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    if (validateOnBlur) {
      validate(value);
    }
  }, [validateOnBlur, validate, value]);

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={maxLength}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:ring-red-500"
        )}
        aria-invalid={!!error}
        {...props}
      />

      <div className="flex items-center justify-between">
        {error ? (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <X className="w-3 h-3" />
            {error}
          </p>
        ) : helpText ? (
          <p className="text-sm text-gray-500">{helpText}</p>
        ) : (
          <div />
        )}

        {maxLength && maxLengthDisplay && (
          <span className={cn(
            "text-xs",
            value.length > maxLength * 0.9 ? "text-orange-500" : "text-gray-400"
          )}>
            {value.length} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
