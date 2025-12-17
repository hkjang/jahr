// AI Settings Admin Page
// Provider 설정 관리 메인 페이지

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Settings, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Server,
  Loader2,
  Star,
} from "lucide-react";
import { AI_PROVIDER_LABELS, AI_STATUS_LABELS } from "@/types/ai-provider";
import type { AIProviderType, AIProviderStatus } from "@/types/ai-provider";

interface Provider {
  id: string;
  name: string;
  type: AIProviderType;
  baseUrl: string;
  isDefault: boolean;
  status: AIProviderStatus;
  defaultModel?: string;
  timeout: number;
  maxTokens: number;
  temperature: number;
  lastHealthCheck?: string;
  lastError?: string;
}

interface TestResult {
  connected: boolean;
  message: string;
  latencyMs?: number;
  modelCount?: number;
}

export default function AISettingsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  
  // 새 Provider 폼 상태
  const [newProvider, setNewProvider] = useState({
    name: "",
    type: "VLLM" as AIProviderType,
    baseUrl: "",
    apiKey: "",
  });

  // Provider 목록 로드
  const loadProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/ai-providers");
      const data = await res.json();
      if (data.success) {
        setProviders(data.data);
      }
    } catch (error) {
      console.error("Failed to load providers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  // Provider 생성
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/ai-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProvider),
      });
      const data = await res.json();
      if (data.success) {
        setDialogOpen(false);
        setNewProvider({ name: "", type: "VLLM", baseUrl: "", apiKey: "" });
        loadProviders();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Failed to create provider:", error);
    }
  };

  // Provider 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    
    try {
      const res = await fetch(`/api/admin/ai-providers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadProviders();
      }
    } catch (error) {
      console.error("Failed to delete provider:", error);
    }
  };

  // 연결 테스트
  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/admin/ai-providers/${id}/test`, {
        method: "POST",
      });
      const data = await res.json();
      setTestResults(prev => ({ ...prev, [id]: data.data }));
      loadProviders(); // 상태 업데이트 반영
    } catch (error) {
      console.error("Failed to test connection:", error);
    } finally {
      setTestingId(null);
    }
  };

  // 기본 Provider 설정
  const handleSetDefault = async (id: string) => {
    try {
      await fetch(`/api/admin/ai-providers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setDefault: true }),
      });
      loadProviders();
    } catch (error) {
      console.error("Failed to set default:", error);
    }
  };

  // 모델 동기화
  const handleSyncModels = async (id: string) => {
    try {
      setTestingId(id);
      const res = await fetch(`/api/admin/ai-providers/${id}/models`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Failed to sync models:", error);
    } finally {
      setTestingId(null);
    }
  };

  const getStatusIcon = (status: AIProviderStatus) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "ERROR":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: AIProviderStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "ERROR":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI 설정</h1>
          <p className="text-muted-foreground">
            AI Provider 연결 및 모델 설정을 관리합니다
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Provider 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 AI Provider 추가</DialogTitle>
              <DialogDescription>
                vLLM 또는 Ollama 서버 연결 정보를 입력하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>이름</Label>
                <Input
                  placeholder="예: 내부 vLLM 서버"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Provider 유형</Label>
                <Select
                  value={newProvider.type}
                  onValueChange={(v) => setNewProvider({ ...newProvider, type: v as AIProviderType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VLLM">vLLM</SelectItem>
                    <SelectItem value="OLLAMA">Ollama</SelectItem>
                    <SelectItem value="OPENAI_COMPATIBLE">OpenAI Compatible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>API URL</Label>
                <Input
                  placeholder={newProvider.type === "OLLAMA" ? "http://localhost:11434" : "http://localhost:8000"}
                  value={newProvider.baseUrl}
                  onChange={(e) => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  오프라인망 정책: 내부 네트워크 주소만 허용됩니다
                </p>
              </div>
              <div className="space-y-2">
                <Label>API Key (선택)</Label>
                <Input
                  type="password"
                  placeholder="서버에 인증이 필요한 경우 입력"
                  value={newProvider.apiKey}
                  onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreate} disabled={!newProvider.name || !newProvider.baseUrl}>
                  추가
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => window.location.href = "/admin/ai-settings/mappings"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              기능별 모델 매핑
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              HR 기능별 사용할 AI 모델을 설정합니다
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => window.location.href = "/admin/ai-settings/logs"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4" />
              AI 호출 로그
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              AI 사용 이력 및 감사 로그를 확인합니다
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold">{providers.length}</p>
                <p className="text-xs text-muted-foreground">Provider</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {providers.filter(p => p.status === "ACTIVE").length}
                </p>
                <p className="text-xs text-muted-foreground">활성</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">AI Providers</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : providers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                등록된 AI Provider가 없습니다
              </p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                첫 Provider 추가하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {providers.map((provider) => (
              <Card key={provider.id} className={provider.isDefault ? "border-primary" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                      {provider.isDefault && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3" />
                          기본
                        </Badge>
                      )}
                      <Badge variant={getStatusVariant(provider.status)}>
                        {getStatusIcon(provider.status)}
                        <span className="ml-1">{AI_STATUS_LABELS[provider.status]}</span>
                      </Badge>
                    </div>
                    <Badge variant="secondary">{AI_PROVIDER_LABELS[provider.type]}</Badge>
                  </div>
                  <CardDescription>{provider.baseUrl}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground space-y-1">
                      {provider.defaultModel && (
                        <p>기본 모델: {provider.defaultModel}</p>
                      )}
                      {provider.lastHealthCheck && (
                        <p>마지막 확인: {new Date(provider.lastHealthCheck).toLocaleString()}</p>
                      )}
                      {provider.lastError && (
                        <p className="text-red-500">오류: {provider.lastError}</p>
                      )}
                      {testResults[provider.id] && (
                        <p className={testResults[provider.id].connected ? "text-green-600" : "text-red-500"}>
                          테스트: {testResults[provider.id].message}
                          {testResults[provider.id].latencyMs && ` (${testResults[provider.id].latencyMs}ms)`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(provider.id)}
                        disabled={testingId === provider.id}
                      >
                        {testingId === provider.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        <span className="ml-1">테스트</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncModels(provider.id)}
                        disabled={testingId === provider.id}
                      >
                        모델 동기화
                      </Button>
                      {!provider.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(provider.id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(provider.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
