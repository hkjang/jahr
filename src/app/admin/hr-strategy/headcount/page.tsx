'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Building2,
  Plus,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface HeadcountLimit {
  id: string;
  organizationId: string;
  organization: {
    id: string;
    code: string;
    name: string;
    level: string;
  };
  limitCount: number;
  effectiveDate: string;
  expiryDate: string | null;
}

interface Organization {
  id: string;
  code: string;
  name: string;
  level: string;
  _count?: {
    employees: number;
  };
}

export default function HeadcountPage() {
  const [limits, setLimits] = useState<HeadcountLimit[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    organizationId: '',
    limitCount: 0,
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
  });

  useEffect(() => {
    fetchLimits();
    fetchOrganizations();
  }, []);

  const fetchLimits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/headcount-limits');
      if (response.ok) {
        const data = await response.json();
        setLimits(data);
      }
    } catch (error) {
      console.error('Failed to fetch limits:', error);
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
      const response = await fetch('/api/headcount-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateForm(false);
        fetchLimits();
        setFormData({
          organizationId: '',
          limitCount: 0,
          effectiveDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
        });
      }
    } catch (error) {
      console.error('Failed to create limit:', error);
    }
  };

  // 조직별 현재 인원 (시뮬레이션 데이터)
  const getOrgCurrentCount = (orgId: string): number => {
    const org = organizations.find(o => o.id === orgId);
    return org?._count?.employees || Math.floor(Math.random() * 30) + 5;
  };

  const getUsageStatus = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 100) return { status: 'over', color: 'text-red-600', bg: 'bg-red-100' };
    if (percentage >= 90) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'normal', color: 'text-green-600', bg: 'bg-green-100' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">정원 관리</h1>
          <p className="text-gray-400 mt-1">부서별 TO(Table of Organization)를 관리합니다.</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          정원 설정
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">정원 설정 조직</CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{limits.length}</div>
            <p className="text-xs text-gray-400">개 부서</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">정원 초과</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {limits.filter(l => getOrgCurrentCount(l.organizationId) > l.limitCount).length}
            </div>
            <p className="text-xs text-gray-400">개 부서에서 초과</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">정상 운영</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {limits.filter(l => getOrgCurrentCount(l.organizationId) <= l.limitCount).length}
            </div>
            <p className="text-xs text-gray-400">개 부서 정상</p>
          </CardContent>
        </Card>
      </div>

      {/* Limits List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">로딩 중...</div>
      ) : limits.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-8 text-gray-400">
            설정된 정원이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {limits.map(limit => {
            const currentCount = getOrgCurrentCount(limit.organizationId);
            const usage = getUsageStatus(currentCount, limit.limitCount);
            const percentage = Math.min((currentCount / limit.limitCount) * 100, 100);

            return (
              <Card key={limit.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">{limit.organization.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(limit.effectiveDate).toLocaleDateString('ko-KR')} 부터 적용
                          </p>
                        </div>
                      </div>
                      <Badge className={usage.bg}>
                        {usage.status === 'over' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {usage.status === 'normal' && <CheckCircle className="h-3 w-3 mr-1" />}
                        <span className={usage.color}>
                          {currentCount} / {limit.limitCount}명
                        </span>
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">정원 사용률</span>
                        <span className={usage.color}>{percentage.toFixed(0)}%</span>
                      </div>
                      <Progress
                        value={percentage}
                        className={`h-2 ${usage.status === 'over' ? '[&>div]:bg-red-500' : usage.status === 'warning' ? '[&>div]:bg-yellow-500' : ''}`}
                      />
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
              <CardTitle>정원 설정</CardTitle>
              <CardDescription>부서별 정원을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="space-y-2">
                  <Label>정원 (TO)</Label>
                  <Input
                    type="number"
                    value={formData.limitCount}
                    onChange={(e) => setFormData({ ...formData, limitCount: parseInt(e.target.value) || 0 })}
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>적용 시작일</Label>
                  <Input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>만료일 (선택)</Label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
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
