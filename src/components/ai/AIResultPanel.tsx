// AI Result Panel Component
// AI 결과 표시 패널 (근거 데이터 포함)

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { AIGeneratedBadge } from "./AIGeneratedBadge";
import { cn } from "@/lib/utils";

interface AIResultPanelProps {
  content: string;
  model?: string;
  timestamp?: Date;
  sources?: string[];
  confidence?: number;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  onFallback?: () => void;
  className?: string;
}

export function AIResultPanel({
  content,
  model,
  timestamp,
  sources,
  confidence,
  isLoading = false,
  error,
  onRetry,
  onFallback,
  className,
}: AIResultPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 에러 상태
  if (error) {
    return (
      <Card className={cn("border-red-200 bg-red-50", className)}>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">AI 처리 실패</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <div className="flex gap-2 mt-3">
                {onRetry && (
                  <Button size="sm" variant="outline" onClick={onRetry}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    재시도
                  </Button>
                )}
                {onFallback && (
                  <Button size="sm" variant="secondary" onClick={onFallback}>
                    수동 처리로 전환
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">AI 분석 결과</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <AIGeneratedBadge model={model} timestamp={timestamp} />
            {confidence !== undefined && (
              <Badge 
                variant={confidence >= 0.8 ? "default" : confidence >= 0.6 ? "secondary" : "outline"}
              >
                신뢰도 {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Main content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                상세 정보 숨기기
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                상세 정보 보기
              </>
            )}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? "복사됨" : "복사"}
            </Button>
            {onRetry && (
              <Button variant="ghost" size="sm" onClick={onRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                다시 생성
              </Button>
            )}
          </div>
        </div>
        
        {/* Details section */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t space-y-3 text-xs text-muted-foreground">
            {sources && sources.length > 0 && (
              <div>
                <p className="font-medium text-foreground mb-1">참고 데이터</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {sources.map((source, i) => (
                    <li key={i}>{source}</li>
                  ))}
                </ul>
              </div>
            )}
            {model && (
              <div>
                <p className="font-medium text-foreground mb-1">모델 정보</p>
                <p>사용된 모델: {model}</p>
                {timestamp && <p>생성 시간: {timestamp.toLocaleString()}</p>}
              </div>
            )}
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertCircle className="h-3 w-3" />
              <span>AI가 생성한 결과는 참고용이며, 검토가 필요합니다.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
