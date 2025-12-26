'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Calculator,
  Plus,
  Play,
  Trash2,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  description: string | null;
  baselineData: {
    departments?: Array<{ name: string; headcount: number }>;
    totalHeadcount?: number;
  };
  changes: {
    additions?: number;
    reductions?: number;
    salaryAdjustment?: number;
  };
  costImpact: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ANALYZING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: '초안',
  ANALYZING: '분석 중',
  COMPLETED: '완료',
};

export default function SimulationPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalHeadcount: 100,
    additions: 0,
    reductions: 0,
  });

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/headcount-scenarios');
      if (response.ok) {
        const data = await response.json();
        setScenarios(data);
      }
    } catch (error) {
      console.error('Failed to fetch scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/headcount-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          baselineData: { totalHeadcount: formData.totalHeadcount },
          changes: { additions: formData.additions, reductions: formData.reductions },
          createdBy: 'admin',
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        fetchScenarios();
        setFormData({ name: '', description: '', totalHeadcount: 100, additions: 0, reductions: 0 });
      }
    } catch (error) {
      console.error('Failed to create scenario:', error);
    }
  };

  const analyzeScenario = async (id: string) => {
    try {
      setAnalyzing(id);
      const response = await fetch(`/api/headcount-scenarios/${id}/analyze`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchScenarios();
      }
    } catch (error) {
      console.error('Failed to analyze scenario:', error);
    } finally {
      setAnalyzing(null);
    }
  };

  const deleteScenario = async (id: string) => {
    if (!confirm('이 시나리오를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/headcount-scenarios/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchScenarios();
      }
    } catch (error) {
      console.error('Failed to delete scenario:', error);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">시나리오 분석</h1>
          <p className="text-gray-400 mt-1">증원·감원 시나리오를 생성하고 비용 영향을 분석합니다.</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          시나리오 생성
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">전체 시나리오</CardTitle>
            <Calculator className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{scenarios.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">분석 완료</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {scenarios.filter(s => s.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">대기 중</CardTitle>
            <TrendingDown className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {scenarios.filter(s => s.status === 'DRAFT').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenarios List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">로딩 중...</div>
      ) : scenarios.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-8 text-gray-400">
            생성된 시나리오가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scenarios.map(scenario => {
            const netChange = (scenario.changes.additions || 0) - (scenario.changes.reductions || 0);
            const costImpact = parseFloat(scenario.costImpact);

            return (
              <Card key={scenario.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{scenario.name}</h3>
                        <Badge className={statusColors[scenario.status]}>
                          {statusLabels[scenario.status]}
                        </Badge>
                      </div>
                      {scenario.description && (
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600">
                          +{scenario.changes.additions || 0}명 증원
                        </span>
                        <span className="text-red-600">
                          -{scenario.changes.reductions || 0}명 감원
                        </span>
                        <span className={netChange >= 0 ? 'text-blue-600' : 'text-orange-600'}>
                          = {netChange >= 0 ? '+' : ''}{netChange}명 순변동
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {scenario.status === 'COMPLETED' && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">비용 영향</p>
                          <p className={`font-bold ${costImpact >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {costImpact >= 0 ? '+' : ''}{formatCurrency(costImpact)}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {scenario.status === 'DRAFT' && (
                          <Button
                            onClick={() => analyzeScenario(scenario.id)}
                            disabled={analyzing === scenario.id}
                          >
                            {analyzing === scenario.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            분석 실행
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteScenario(scenario.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>시나리오 생성</CardTitle>
              <CardDescription>증원/감원 시나리오를 생성합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>시나리오 이름</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 2025년 상반기 증원 계획"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>설명</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="시나리오에 대한 설명"
                  />
                </div>

                <div className="space-y-2">
                  <Label>현재 인원 (기준)</Label>
                  <Input
                    type="number"
                    value={formData.totalHeadcount}
                    onChange={(e) => setFormData({ ...formData, totalHeadcount: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>증원 인원</Label>
                    <Input
                      type="number"
                      value={formData.additions}
                      onChange={(e) => setFormData({ ...formData, additions: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>감원 인원</Label>
                    <Input
                      type="number"
                      value={formData.reductions}
                      onChange={(e) => setFormData({ ...formData, reductions: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    취소
                  </Button>
                  <Button type="submit">저장</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
