'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, 
  Plus,
  Play,
  Trash2,
  GitBranch,
  Users,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface OrgSimulation {
  id: string;
  name: string;
  description: string | null;
  currentStructure: {
    departments?: Array<{ id: string; name: string; headcount: number }>;
  };
  proposedStructure: {
    departments?: Array<{ id: string; name: string; headcount: number }>;
  };
  impactAnalysis: {
    currentDepartmentCount?: number;
    proposedDepartmentCount?: number;
    departmentChange?: number;
    currentHeadcount?: number;
    proposedHeadcount?: number;
    headcountChange?: number;
    affectedEmployees?: number;
    estimatedTransitionTime?: string;
    riskLevel?: string;
  } | null;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  RUNNING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: '초안',
  RUNNING: '실행 중',
  COMPLETED: '완료',
};

const riskColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

export default function RestructurePage() {
  const [simulations, setSimulations] = useState<OrgSimulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currentDepts: '',
    proposedDepts: '',
  });

  useEffect(() => {
    fetchSimulations();
  }, []);

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/org-simulations');
      if (response.ok) {
        const data = await response.json();
        setSimulations(data);
      }
    } catch (error) {
      console.error('Failed to fetch simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseDeptsInput = (input: string) => {
    // 형식: "부서명:인원, 부서명:인원"
    const depts = input.split(',').map(item => {
      const [name, headcount] = item.trim().split(':');
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: name?.trim() || '',
        headcount: parseInt(headcount) || 0,
      };
    }).filter(d => d.name);
    return { departments: depts };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/org-simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          currentStructure: parseDeptsInput(formData.currentDepts),
          proposedStructure: parseDeptsInput(formData.proposedDepts),
          createdBy: 'admin',
        }),
      });
      
      if (response.ok) {
        setShowCreateForm(false);
        fetchSimulations();
        setFormData({ name: '', description: '', currentDepts: '', proposedDepts: '' });
      }
    } catch (error) {
      console.error('Failed to create simulation:', error);
    }
  };

  const runSimulation = async (id: string) => {
    try {
      setRunning(id);
      const response = await fetch(`/api/org-simulations/${id}/run`, {
        method: 'POST',
      });
      
      if (response.ok) {
        fetchSimulations();
      }
    } catch (error) {
      console.error('Failed to run simulation:', error);
    } finally {
      setRunning(null);
    }
  };

  const deleteSimulation = async (id: string) => {
    if (!confirm('이 시뮬레이션을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/org-simulations/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchSimulations();
      }
    } catch (error) {
      console.error('Failed to delete simulation:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">조직 개편 시뮬레이션</h1>
          <p className="text-muted-foreground">조직 구조 변경의 영향을 분석합니다.</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          시뮬레이션 생성
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 시뮬레이션</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{simulations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">분석 완료</CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {simulations.filter(s => s.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">고위험</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {simulations.filter(s => s.impactAnalysis?.riskLevel === 'HIGH').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulations List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
      ) : simulations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            생성된 시뮬레이션이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {simulations.map(simulation => (
            <Card key={simulation.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{simulation.name}</h3>
                        <Badge className={statusColors[simulation.status]}>
                          {statusLabels[simulation.status]}
                        </Badge>
                        {simulation.impactAnalysis?.riskLevel && (
                          <Badge className={riskColors[simulation.impactAnalysis.riskLevel]}>
                            {simulation.impactAnalysis.riskLevel} 위험
                          </Badge>
                        )}
                      </div>
                      {simulation.description && (
                        <p className="text-sm text-muted-foreground">{simulation.description}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {simulation.status === 'DRAFT' && (
                        <Button 
                          onClick={() => runSimulation(simulation.id)}
                          disabled={running === simulation.id}
                        >
                          {running === simulation.id ? (
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
                        onClick={() => deleteSimulation(simulation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Impact Analysis Results */}
                  {simulation.status === 'COMPLETED' && simulation.impactAnalysis && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">부서 변동</p>
                        <p className="font-semibold">
                          {simulation.impactAnalysis.currentDepartmentCount} → {simulation.impactAnalysis.proposedDepartmentCount}
                          <span className="text-sm text-muted-foreground ml-1">
                            ({simulation.impactAnalysis.departmentChange! >= 0 ? '+' : ''}{simulation.impactAnalysis.departmentChange})
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">인원 변동</p>
                        <p className="font-semibold">
                          {simulation.impactAnalysis.currentHeadcount} → {simulation.impactAnalysis.proposedHeadcount}
                          <span className="text-sm text-muted-foreground ml-1">
                            ({simulation.impactAnalysis.headcountChange! >= 0 ? '+' : ''}{simulation.impactAnalysis.headcountChange})
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">영향 인원</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {simulation.impactAnalysis.affectedEmployees}명
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">예상 전환 기간</p>
                        <p className="font-semibold">{simulation.impactAnalysis.estimatedTransitionTime}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>조직 개편 시뮬레이션 생성</CardTitle>
              <CardDescription>현재 조직과 제안 조직 구조를 입력합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>시뮬레이션 이름</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 2025년 조직 개편안"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>설명</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="시뮬레이션에 대한 설명"
                  />
                </div>

                <div className="space-y-2">
                  <Label>현재 조직 구조</Label>
                  <Textarea
                    value={formData.currentDepts}
                    onChange={(e) => setFormData({ ...formData, currentDepts: e.target.value })}
                    placeholder="형식: 개발팀:20, 마케팅팀:10, 영업팀:15"
                    required
                  />
                  <p className="text-xs text-muted-foreground">부서명:인원 형식으로 쉼표로 구분하여 입력</p>
                </div>

                <div className="space-y-2">
                  <Label>제안 조직 구조</Label>
                  <Textarea
                    value={formData.proposedDepts}
                    onChange={(e) => setFormData({ ...formData, proposedDepts: e.target.value })}
                    placeholder="형식: 개발1팀:12, 개발2팀:12, 마케팅팀:8, 영업팀:18"
                    required
                  />
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
