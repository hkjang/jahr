// AI Loading Indicator Component
// AI 처리 중 로딩 표시

import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AILoadingIndicatorProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: {
    container: "p-2",
    icon: "h-4 w-4",
    text: "text-xs",
  },
  md: {
    container: "p-4",
    icon: "h-6 w-6",
    text: "text-sm",
  },
  lg: {
    container: "p-6",
    icon: "h-8 w-8",
    text: "text-base",
  },
};

export function AILoadingIndicator({
  message = "AI가 처리 중입니다...",
  size = "md",
  className,
}: AILoadingIndicatorProps) {
  const sizes = sizeClasses[size];
  
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        sizes.container,
        className
      )}
    >
      <div className="relative">
        <Sparkles className={cn(sizes.icon, "text-primary opacity-50")} />
        <Loader2
          className={cn(
            sizes.icon,
            "absolute inset-0 animate-spin text-primary"
          )}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(sizes.text, "text-muted-foreground animate-pulse")}>
          {message}
        </span>
      </div>
      {/* Progress dots animation */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// Inline version for use within text
export function AILoadingInline({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Loader2 className="h-3 w-3 animate-spin" />
      <span className="text-xs text-muted-foreground">처리 중...</span>
    </span>
  );
}
