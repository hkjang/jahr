'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Plus,
  TrendingUp,
  BarChart3,
  Download
} from 'lucide-react';

interface LaborCostForecast {
  id: string;
  yearMonth: string;
  organizationId: string | null;
  organization: {
    id: string;
    code: string;
    name: string;
  } | null;
  baseSalary: string;
  bonus: string;
  benefits: string;
  totalCost: string;
  isActual: boolean;
  createdAt: string;
}

interface Organization {
  id: string;
  code: string;
  name: string;
}

export default function LaborCostPage() {
  const [forecasts, setForecasts] = useState<LaborCostForecast[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const [formData, setFormData] = useState({
    yearMonth: '',
    organizationId: '',
    baseSalary: 0,
    bonus: 0,
    benefits: 0,
    isActual: false,
  });

  useEffect(() => {
    fetchForecasts();
    fetchOrganizations();
  }, [selectedYear]);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/labor-cost-forecasts`);
      if (response.ok) {
        const data = await response.json();
        // Filter by selected year
        const filtered = data.filter((f: LaborCostForecast) => f.yearMonth.startsWith(selectedYear));
        setForecasts(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch forecasts:', error);
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
      const response = await fetch('/api/labor-cost-forecasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          organizationId: formData.organizationId || null,
        }),
      });
      
      if (response.ok) {
        setShowCreateForm(false);
        fetchForecasts();
        setFormData({
          yearMonth: '',
          organizationId: '',
          baseSalary: 0,
          bonus: 0,
          benefits: 0,
          isActual: false,
        });
      }
    } catch (error) {
      console.error('Failed to create forecast:', error);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatYearMonth = (ym: string) => {
    const year = ym.substring(0, 4);
    const month = ym.substring(4, 6);
    return `${year}년 ${parseInt(month)}월`;
  };

  // 통계 계산
  const totalBaseSalary = forecasts.reduce((sum, f) => sum + parseFloat(f.baseSalary), 0);
  const totalBonus = forecasts.reduce((sum, f) => sum + parseFloat(f.bonus), 0);
  const totalBenefits = forecasts.reduce((sum, f) => sum + parseFloat(f.benefits), 0);
  const grandTotal = forecasts.reduce((sum, f) => sum + parseFloat(f.totalCost), 0);

  // 월별 그룹화
  const byMonth = forecasts.reduce((acc, f) => {
    if (!acc[f.yearMonth]) {
      acc[f.yearMonth] = [];
    }
    acc[f.yearMonth].push(f);
    return acc;
  }, {} as Record<string, LaborCostForecast[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">인건비 예측</h1>
          <p className="text-muted-foreground">급여, 상여, 복리후생비를 포함한 인건비를 예측합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            예측 추가
          </Button>
        </div>
      </div>

      {/* Year Filter */}
      <div className="flex items-center gap-4">
        <Label>연도</Label>
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">기본급 합계</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBaseSalary)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">상여금 합계</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBonus)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">복리후생비</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBenefits)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 인건비</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(grandTotal)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Forecasts by Month */}
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">목록</TabsTrigger>
          <TabsTrigger value="chart">차트</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : Object.keys(byMonth).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                등록된 인건비 예측이 없습니다.
              </CardContent>
            </Card>
          ) : (
            Object.entries(byMonth)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([yearMonth, items]) => {
                const monthTotal = items.reduce((sum, f) => sum + parseFloat(f.totalCost), 0);
                
                return (
                  <Card key={yearMonth}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{formatYearMonth(yearMonth)}</CardTitle>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(monthTotal)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {items.map(forecast => (
                          <div 
                            key={forecast.id} 
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <span className="font-medium">
                              {forecast.organization?.name || '전사'}
                            </span>
                            <div className="flex items-center gap-6 text-sm">
                              <span>기본급: {formatCurrency(forecast.baseSalary)}</span>
                              <span>상여: {formatCurrency(forecast.bonus)}</span>
                              <span>복리: {formatCurrency(forecast.benefits)}</span>
                              <span className="font-bold">{formatCurrency(forecast.totalCost)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </TabsContent>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>월별 인건비 추이</CardTitle>
              <CardDescription>차트 기능은 추후 구현 예정입니다.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              <BarChart3 className="h-16 w-16" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>인건비 예측 추가</CardTitle>
              <CardDescription>월별 인건비를 입력합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>년월 (YYYYMM)</Label>
                  <Input
                    value={formData.yearMonth}
                    onChange={(e) => setFormData({ ...formData, yearMonth: e.target.value })}
                    placeholder="예: 202501"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>조직 (선택)</Label>
                  <Select
                    value={formData.organizationId}
                    onValueChange={(v) => setFormData({ ...formData, organizationId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="전사" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">전사</SelectItem>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>기본급 (원)</Label>
                  <Input
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>상여금 (원)</Label>
                  <Input
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>복리후생비 (원)</Label>
                  <Input
                    type="number"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: parseFloat(e.target.value) || 0 })}
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
