// AI Feature Toggle Component
// AI 기능 사용 여부 토글

"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AIFeatureToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  featureName?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function AIFeatureToggle({
  enabled,
  onToggle,
  featureName = "AI 기능",
  description,
  className,
  disabled = false,
}: AIFeatureToggleProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className={cn("h-4 w-4", enabled ? "text-primary" : "text-muted-foreground")} />
        <Label
          htmlFor="ai-toggle"
          className={cn(
            "cursor-pointer",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {featureName}
        </Label>
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Switch
        id="ai-toggle"
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
    </div>
  );
}

// Compact version for cards/panels
export function AIFeatureToggleCompact({
  enabled,
  onToggle,
  disabled = false,
}: {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <Sparkles
              className={cn(
                "h-3 w-3 cursor-pointer transition-colors",
                enabled ? "text-primary" : "text-muted-foreground"
              )}
              onClick={() => !disabled && onToggle(!enabled)}
            />
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              disabled={disabled}
              className="scale-75"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">AI 기능 {enabled ? "활성" : "비활성"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
