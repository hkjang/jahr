'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Plus,
  Filter,
  Download,
  BarChart3
} from 'lucide-react';

interface WorkforcePlan {
  id: string;
  year: number;
  quarter: number | null;
  organizationId: string;
  organization: {
    id: string;
    code: string;
    name: string;
    level: string;
  };
  currentHeadcount: number;
  plannedHeadcount: number;
  budgetAmount: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface Organization {
  id: string;
  code: string;
  name: string;
  level: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: '초안',
  SUBMITTED: '제출됨',
  APPROVED: '승인됨',
  REJECTED: '반려됨',
};

export default function WorkforcePlanningPage() {
  const [plans, setPlans] = useState<WorkforcePlan[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    quarter: '',
    organizationId: '',
    currentHeadcount: 0,
    plannedHeadcount: 0,
    budgetAmount: 0,
    notes: '',
  });

  useEffect(() => {
    fetchPlans();
    fetchOrganizations();
  }, [selectedYear]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workforce-plans?year=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/workforce-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quarter: formData.quarter ? parseInt(formData.quarter) : null,
          createdBy: 'admin',
        }),
      });
      
      if (response.ok) {
        setShowCreateForm(false);
        fetchPlans();
        setFormData({
          year: new Date().getFullYear(),
          quarter: '',
          organizationId: '',
          currentHeadcount: 0,
          plannedHeadcount: 0,
          budgetAmount: 0,
          notes: '',
        });
      }
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  // 통계 계산
  const stats = {
    totalOrgs: new Set(plans.map(p => p.organizationId)).size,
    totalCurrentHeadcount: plans.reduce((sum, p) => sum + p.currentHeadcount, 0),
    totalPlannedHeadcount: plans.reduce((sum, p) => sum + p.plannedHeadcount, 0),
    totalBudget: plans.reduce((sum, p) => sum + parseFloat(p.budgetAmount), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">인력 계획</h1>
          <p className="text-muted-foreground">연간 및 분기별 인력 수요 계획을 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            계획 추가
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대상 조직</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrgs}</div>
            <p className="text-xs text-muted-foreground">개 부서</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">현재 인원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCurrentHeadcount}</div>
            <p className="text-xs text-muted-foreground">명</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">계획 인원</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlannedHeadcount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPlannedHeadcount - stats.totalCurrentHeadcount >= 0 ? '+' : ''}
              {stats.totalPlannedHeadcount - stats.totalCurrentHeadcount}명 변동
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 예산</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">연간 인건비</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025, 2026].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}년</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Plans List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="annual">연간</TabsTrigger>
          <TabsTrigger value="quarterly">분기별</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : plans.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                등록된 인력 계획이 없습니다.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {plans.map(plan => (
                <Card key={plan.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{plan.organization.name}</h3>
                          <Badge className={statusColors[plan.status]}>
                            {statusLabels[plan.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {plan.year}년 {plan.quarter ? `Q${plan.quarter}` : '연간'} 계획
                        </p>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">현재 → 계획</p>
                          <p className="font-semibold">
                            {plan.currentHeadcount}명 → {plan.plannedHeadcount}명
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">예산</p>
                          <p className="font-semibold">{formatCurrency(plan.budgetAmount)}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          상세
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="annual">
          <div className="grid gap-4">
            {plans.filter(p => !p.quarter).map(plan => (
              <Card key={plan.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{plan.organization.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.year}년 연간 계획</p>
                    </div>
                    <Badge className={statusColors[plan.status]}>
                      {statusLabels[plan.status]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quarterly">
          <div className="grid gap-4">
            {plans.filter(p => p.quarter).map(plan => (
              <Card key={plan.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{plan.organization.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.year}년 Q{plan.quarter}</p>
                    </div>
                    <Badge className={statusColors[plan.status]}>
                      {statusLabels[plan.status]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>인력 계획 추가</CardTitle>
              <CardDescription>새로운 인력 계획을 등록합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>연도</Label>
                    <Select
                      value={formData.year.toString()}
                      onValueChange={(v) => setFormData({ ...formData, year: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2024, 2025, 2026].map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}년</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>분기 (선택)</Label>
                    <Select
                      value={formData.quarter}
                      onValueChange={(v) => setFormData({ ...formData, quarter: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="연간" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">연간</SelectItem>
                        <SelectItem value="1">Q1</SelectItem>
                        <SelectItem value="2">Q2</SelectItem>
                        <SelectItem value="3">Q3</SelectItem>
                        <SelectItem value="4">Q4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>조직</Label>
                  <Select
                    value={formData.organizationId}
                    onValueChange={(v) => setFormData({ ...formData, organizationId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="조직 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>현재 인원</Label>
                    <Input
                      type="number"
                      value={formData.currentHeadcount}
                      onChange={(e) => setFormData({ ...formData, currentHeadcount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>계획 인원</Label>
                    <Input
                      type="number"
                      value={formData.plannedHeadcount}
                      onChange={(e) => setFormData({ ...formData, plannedHeadcount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>예산 (원)</Label>
                  <Input
                    type="number"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData({ ...formData, budgetAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>비고</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="계획 관련 메모"
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
