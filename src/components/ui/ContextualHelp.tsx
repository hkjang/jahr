"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, X, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface HelpTip {
  title: string;
  content: string | React.ReactNode;
}

interface ContextualHelpProps {
  tips: HelpTip[];
  title?: string;
  className?: string;
  variant?: "inline" | "tooltip" | "expandable";
  learnMoreUrl?: string;
}

export function ContextualHelp({
  tips,
  title = "도움말",
  className,
  variant = "expandable",
  learnMoreUrl,
}: ContextualHelpProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (variant === "inline") {
    return (
      <div className={cn("bg-blue-50 border border-blue-200 rounded-xl p-4", className)}>
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-3">
            {tips.map((tip, index) => (
              <div key={index}>
                <h4 className="font-medium text-blue-900">{tip.title}</h4>
                <div className="text-sm text-blue-700 mt-1">
                  {typeof tip.content === "string" ? <p>{tip.content}</p> : tip.content}
                </div>
              </div>
            ))}
            
            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                자세히 알아보기
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "expandable") {
    return (
      <div className={cn("border border-gray-200 rounded-xl overflow-hidden", className)}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="flex items-center gap-2 text-gray-700 font-medium">
            <HelpCircle className="w-5 h-5 text-gray-500" />
            {title}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-white space-y-4">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{tip.title}</h4>
                  <div className="text-sm text-gray-600 mt-1">
                    {typeof tip.content === "string" ? <p>{tip.content}</p> : tip.content}
                  </div>
                </div>
              </div>
            ))}
            
            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                자세히 알아보기
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  // Tooltip variant는 Tooltip 컴포넌트와 함께 사용
  return null;
}

// 필드 옆 도움말 아이콘
interface FieldHelpProps {
  text: string;
  className?: string;
}

export function FieldHelp({ text, className }: FieldHelpProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="도움말"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 max-w-xs shadow-lg">
            {text}
          </div>
          {/* 화살표 */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

// 단계별 가이드 컴포넌트
interface StepGuideProps {
  steps: {
    title: string;
    description: string;
    isCompleted?: boolean;
    isCurrent?: boolean;
  }[];
  className?: string;
}

export function StepGuide({ steps, className }: StepGuideProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg transition-colors",
            step.isCurrent && "bg-blue-50 border border-blue-200",
            step.isCompleted && "opacity-60"
          )}
        >
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium",
              step.isCompleted
                ? "bg-green-500 text-white"
                : step.isCurrent
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600"
            )}
          >
            {step.isCompleted ? "✓" : index + 1}
          </div>
          <div>
            <h4 className={cn(
              "font-medium",
              step.isCurrent ? "text-blue-900" : "text-gray-900"
            )}>
              {step.title}
            </h4>
            <p className={cn(
              "text-sm mt-0.5",
              step.isCurrent ? "text-blue-700" : "text-gray-600"
            )}>
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// 입력 필드용 헬프 텍스트
interface InputHelpTextProps {
  children: React.ReactNode;
  variant?: "info" | "warning" | "error";
  className?: string;
}

export function InputHelpText({
  children,
  variant = "info",
  className,
}: InputHelpTextProps) {
  const variantStyles = {
    info: "text-gray-500",
    warning: "text-orange-600",
    error: "text-red-600",
  };

  return (
    <p className={cn("text-sm mt-1", variantStyles[variant], className)}>
      {children}
    </p>
  );
}
