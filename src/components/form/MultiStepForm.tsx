"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { ChevronLeft, ChevronRight, Check, Save, Loader2 } from "lucide-react";
import { useAutoSave, formatAutoSaveStatus } from "@/hooks/useAutoSave";

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<StepComponentProps>;
  validation?: (data: Record<string, unknown>) => boolean | Promise<boolean>;
  optional?: boolean;
}

export interface StepComponentProps {
  data: Record<string, unknown>;
  onChange: (updates: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

interface MultiStepFormProps {
  steps: FormStep[];
  onComplete: (data: Record<string, unknown>) => void | Promise<void>;
  onStepChange?: (stepIndex: number) => void;
  initialData?: Record<string, unknown>;
  autoSaveKey?: string; // 자동 저장 키 (설정 시 자동 저장 활성화)
  className?: string;
  submitLabel?: string;
}

export function MultiStepForm({
  steps,
  onComplete,
  onStepChange,
  initialData = {},
  autoSaveKey,
  className,
  submitLabel = "제출",
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // 자동 저장 (키가 설정된 경우에만)
  const autoSave = useAutoSave(
    autoSaveKey || "form",
    { currentStep, formData, completedSteps: Array.from(completedSteps) },
    { interval: 30000, debounce: 2000 }
  );

  // 자동 저장된 데이터 복구
  useEffect(() => {
    if (autoSaveKey && autoSave.savedData) {
      const saved = autoSave.savedData as {
        currentStep: number;
        formData: Record<string, unknown>;
        completedSteps: number[];
      };
      
      // 사용자에게 복구 여부 확인
      const shouldRestore = window.confirm(
        "저장된 입력 내용이 있습니다. 이어서 작성하시겠습니까?"
      );
      
      if (shouldRestore) {
        setCurrentStep(saved.currentStep);
        setFormData(saved.formData);
        setCompletedSteps(new Set(saved.completedSteps));
      } else {
        autoSave.clear();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveKey]);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // 데이터 업데이트
  const handleChange = useCallback((updates: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // 에러 클리어
    const updatedKeys = Object.keys(updates);
    setErrors((prev) => {
      const newErrors = { ...prev };
      updatedKeys.forEach((key) => delete newErrors[key]);
      return newErrors;
    });
  }, []);

  // 현재 단계 유효성 검사
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    if (!currentStepData.validation) return true;

    try {
      const isValid = await currentStepData.validation(formData);
      if (!isValid) {
        // validation 함수가 에러 메시지를 반환할 수도 있음
        return false;
      }
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  }, [currentStepData, formData]);

  // 다음 단계로
  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setCompletedSteps((prev) => new Set([...prev, currentStep]));

    if (isLastStep) {
      setIsSubmitting(true);
      try {
        await onComplete(formData);
        autoSave.clear(); // 완료 후 자동 저장 데이터 삭제
      } catch (error) {
        console.error("Submit error:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    }
  }, [
    currentStep,
    isLastStep,
    validateCurrentStep,
    onComplete,
    onStepChange,
    formData,
    autoSave,
  ]);

  // 이전 단계로
  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  }, [currentStep, isFirstStep, onStepChange]);

  // 특정 단계로 이동 (완료된 단계만)
  const goToStep = useCallback(
    (stepIndex: number) => {
      if (completedSteps.has(stepIndex) || stepIndex <= currentStep) {
        setCurrentStep(stepIndex);
        onStepChange?.(stepIndex);
      }
    },
    [completedSteps, currentStep, onStepChange]
  );

  const StepComponent = currentStepData.component;

  return (
    <div className={cn("space-y-6", className)}>
      {/* 단계 표시기 */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isClickable = isCompleted || index <= currentStep;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => goToStep(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-colors",
                    isClickable ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                >
                  {/* 단계 번호/체크 */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {/* 단계 제목 */}
                  <div className="text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isCurrent ? "text-blue-600" : "text-gray-500"
                      )}
                    >
                      {step.title}
                    </p>
                    {step.optional && (
                      <span className="text-xs text-gray-400">(선택)</span>
                    )}
                  </div>
                </button>

                {/* 연결선 */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded",
                      completedSteps.has(index)
                        ? "bg-green-500"
                        : "bg-gray-200"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 현재 단계 설명 */}
      {currentStepData.description && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">{currentStepData.description}</p>
        </div>
      )}

      {/* 자동 저장 상태 */}
      {autoSaveKey && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {autoSave.isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
          <Save className="w-3 h-3" />
          <span>
            {formatAutoSaveStatus(
              autoSave.isSaving,
              autoSave.lastSaved,
              autoSave.hasUnsavedChanges
            )}
          </span>
        </div>
      )}

      {/* 폼 내용 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <StepComponent data={formData} onChange={handleChange} errors={errors} />
      </div>

      {/* 버튼 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          이전
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        <Button onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              처리 중...
            </>
          ) : isLastStep ? (
            <>
              {submitLabel}
              <Check className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              다음
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// 간단한 단계 래퍼 컴포넌트
interface SimpleStepProps {
  title: string;
  children: React.ReactNode;
}

export function SimpleStep({ title, children }: SimpleStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}
