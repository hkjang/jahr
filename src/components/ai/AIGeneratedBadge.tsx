// AI Generated Badge Component
// AI가 생성한 콘텐츠를 표시하는 배지

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AIGeneratedBadgeProps {
  model?: string;
  timestamp?: Date;
  className?: string;
}

export function AIGeneratedBadge({ model, timestamp, className }: AIGeneratedBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={`gap-1 cursor-help ${className || ""}`}
          >
            <Sparkles className="h-3 w-3" />
            AI 생성
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p>이 콘텐츠는 AI에 의해 생성되었습니다</p>
            {model && <p className="text-muted-foreground">모델: {model}</p>}
            {timestamp && (
              <p className="text-muted-foreground">
                생성: {timestamp.toLocaleString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
