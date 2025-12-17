// AI Feature Mappings Admin Page
// 기능별 모델 매핑 설정

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { AI_FEATURE_LABELS } from "@/types/ai-provider";
import type { AIFeatureType, AIProviderType } from "@/types/ai-provider";

interface Model {
  id: string;
  modelId: string;
  displayName: string;
  description?: string;
  contextLength?: number;
  isAvailable: boolean;
  provider?: {
    id: string;
    name: string;
    type: AIProviderType;
  };
}

interface Mapping {
  id: string;
  featureType: AIFeatureType;
  modelId: string;
  model: Model;
  isDefault: boolean;
  priority: number;
  maxTokensOverride?: number;
  temperatureOverride?: number;
  systemPrompt?: string;
}

interface Provider {
  id: string;
  name: string;
  type: AIProviderType;
}

const FEATURE_TYPES: AIFeatureType[] = [
  'HR_SUMMARY',
  'AI_RECOMMENDATION',
  'REGULATION_QA',
  'DOCUMENT_GENERATION',
  'SENTIMENT_ANALYSIS',
  'CHATBOT',
];

export default function AIFeatureMappingsPage() {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<AIFeatureType | null>(null);
  
  // 편집 상태
  const [editingFeature, setEditingFeature] = useState<AIFeatureType | null>(null);
  const [editForm, setEditForm] = useState({
    modelId: "",
    isDefault: true,
    maxTokensOverride: "",
    temperatureOverride: "",
    systemPrompt: "",
  });

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 매핑 로드
        const mappingsRes = await fetch("/api/admin/ai-feature-mappings");
        const mappingsData = await mappingsRes.json();
        if (mappingsData.success) {
          setMappings(mappingsData.data);
        }
        
        // Provider 로드
        const providersRes = await fetch("/api/admin/ai-providers");
        const providersData = await providersRes.json();
        if (providersData.success) {
          setProviders(providersData.data);
          
          // 각 Provider의 모델 로드
          const modelsPromises = providersData.data.map(async (p: Provider) => {
            const modelsRes = await fetch(`/api/admin/ai-providers/${p.id}/models`);
            const modelsData = await modelsRes.json();
            if (modelsData.success) {
              return modelsData.data.map((m: Model) => ({ ...m, provider: p }));
            }
            return [];
          });
          
          const modelsArrays = await Promise.all(modelsPromises);
          setAllModels(modelsArrays.flat());
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // 매핑 저장
  const handleSave = async (featureType: AIFeatureType) => {
    setSaving(featureType);
    try {
      const res = await fetch("/api/admin/ai-feature-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureType,
          modelId: editForm.modelId,
          isDefault: editForm.isDefault,
          maxTokensOverride: editForm.maxTokensOverride ? parseInt(editForm.maxTokensOverride) : undefined,
          temperatureOverride: editForm.temperatureOverride ? parseFloat(editForm.temperatureOverride) : undefined,
          systemPrompt: editForm.systemPrompt || undefined,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        // 매핑 다시 로드
        const mappingsRes = await fetch("/api/admin/ai-feature-mappings");
        const mappingsData = await mappingsRes.json();
        if (mappingsData.success) {
          setMappings(mappingsData.data);
        }
        setEditingFeature(null);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Failed to save mapping:", error);
    } finally {
      setSaving(null);
    }
  };

  // 편집 시작
  const startEditing = (featureType: AIFeatureType) => {
    const existing = mappings.find(m => m.featureType === featureType && m.isDefault);
    if (existing) {
      setEditForm({
        modelId: existing.modelId,
        isDefault: true,
        maxTokensOverride: existing.maxTokensOverride?.toString() || "",
        temperatureOverride: existing.temperatureOverride?.toString() || "",
        systemPrompt: existing.systemPrompt || "",
      });
    } else {
      setEditForm({
        modelId: "",
        isDefault: true,
        maxTokensOverride: "",
        temperatureOverride: "",
        systemPrompt: "",
      });
    }
    setEditingFeature(featureType);
  };

  // 기능별 현재 매핑 가져오기
  const getMappingForFeature = (featureType: AIFeatureType) => {
    return mappings.find(m => m.featureType === featureType && m.isDefault);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => window.location.href = "/admin/ai-settings"}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">기능별 모델 매핑</h1>
          <p className="text-muted-foreground">
            각 HR 기능에서 사용할 AI 모델을 설정합니다
          </p>
        </div>
      </div>

      {/* No Providers Warning */}
      {providers.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <p className="text-yellow-800">
              먼저 AI Provider를 등록해주세요.{" "}
              <a href="/admin/ai-settings" className="underline">
                AI 설정으로 이동
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Feature Cards */}
      <div className="grid gap-4">
        {FEATURE_TYPES.map((featureType) => {
          const mapping = getMappingForFeature(featureType);
          const isEditing = editingFeature === featureType;
          
          return (
            <Card key={featureType}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {AI_FEATURE_LABELS[featureType]}
                  </CardTitle>
                  {mapping ? (
                    <Badge variant="default">설정됨</Badge>
                  ) : (
                    <Badge variant="secondary">미설정</Badge>
                  )}
                </div>
                {mapping && !isEditing && (
                  <CardDescription>
                    {mapping.model.displayName} ({mapping.model.provider?.name})
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>모델 선택</Label>
                      <Select
                        value={editForm.modelId}
                        onValueChange={(v) => setEditForm({ ...editForm, modelId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="모델을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {allModels.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.displayName} ({model.provider?.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>최대 토큰 (선택)</Label>
                        <Input
                          type="number"
                          placeholder="Provider 기본값 사용"
                          value={editForm.maxTokensOverride}
                          onChange={(e) => setEditForm({ ...editForm, maxTokensOverride: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Temperature (선택)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          placeholder="Provider 기본값 사용"
                          value={editForm.temperatureOverride}
                          onChange={(e) => setEditForm({ ...editForm, temperatureOverride: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>시스템 프롬프트 (선택)</Label>
                      <Textarea
                        placeholder="이 기능에서 사용할 시스템 프롬프트를 입력하세요"
                        value={editForm.systemPrompt}
                        onChange={(e) => setEditForm({ ...editForm, systemPrompt: e.target.value })}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`default-${featureType}`}
                        checked={editForm.isDefault}
                        onCheckedChange={(v: boolean) => setEditForm({ ...editForm, isDefault: v })}
                      />
                      <Label htmlFor={`default-${featureType}`}>기본 모델로 설정</Label>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingFeature(null)}>
                        취소
                      </Button>
                      <Button
                        onClick={() => handleSave(featureType)}
                        disabled={!editForm.modelId || saving === featureType}
                      >
                        {saving === featureType ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        저장
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {mapping ? (
                        <>
                          {mapping.systemPrompt && (
                            <p className="truncate max-w-md">
                              프롬프트: {mapping.systemPrompt.slice(0, 50)}...
                            </p>
                          )}
                          {(mapping.maxTokensOverride || mapping.temperatureOverride) && (
                            <p>
                              설정: 
                              {mapping.maxTokensOverride && ` 토큰=${mapping.maxTokensOverride}`}
                              {mapping.temperatureOverride && ` 온도=${mapping.temperatureOverride}`}
                            </p>
                          )}
                        </>
                      ) : (
                        <p>기본 Provider의 기본 모델을 사용합니다</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(featureType)}
                      disabled={allModels.length === 0}
                    >
                      설정
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
