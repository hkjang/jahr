'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Home, Briefcase, Clock, Plus, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface FlexibleWorkPolicy {
  id: string;
  name: string;
  workType: string;
  description: string | null;
  coreStartTime: string | null;
  coreEndTime: string | null;
  minDailyHours: number;
  maxDailyHours: number;
  maxRemoteDays: number | null;
  requiresApproval: boolean;
  isActive: boolean;
  applicableOrgs: string[];
  applicablePositions: string[];
  _count: { requests: number };
}

const workTypeLabels: Record<string, string> = {
  CORE_HOURS: '코어 타임제',
  FLEXIBLE_HOURS: '시차 출퇴근',
  COMPRESSED: '압축 근무',
  REMOTE: '원격 근무',
  HYBRID: '하이브리드',
};

const workTypeIcons: Record<string, typeof Home> = {
  CORE_HOURS: Clock,
  FLEXIBLE_HOURS: Clock,
  COMPRESSED: Briefcase,
  REMOTE: Home,
  HYBRID: Briefcase,
};

export default function FlexWorkAdminPage() {
  const [policies, setPolicies] = useState<FlexibleWorkPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    workType: 'REMOTE',
    description: '',
    coreStartTime: '',
    coreEndTime: '',
    minDailyHours: 8,
    maxDailyHours: 12,
    maxRemoteDays: 5,
    requiresApproval: true,
  });

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flex-work/policies');
      if (res.ok) {
        const data = await res.json();
        setPolicies(data);
      }
    } catch (error) {
      console.error('Failed to fetch policies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/flex-work/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setDialogOpen(false);
        setFormData({
          name: '',
          workType: 'REMOTE',
          description: '',
          coreStartTime: '',
          coreEndTime: '',
          minDailyHours: 8,
          maxDailyHours: 12,
          maxRemoteDays: 5,
          requiresApproval: true,
        });
        fetchPolicies();
      }
    } catch (error) {
      console.error('Failed to create policy:', error);
    }
  };

  // Statistics
  const activePolicies = policies.filter(p => p.isActive).length;
  const totalRequests = policies.reduce((sum, p) => sum + p._count.requests, 0);
  const remotePolices = policies.filter(p => p.workType === 'REMOTE' || p.workType === 'HYBRID').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">유연 근무 관리</h1>
          <p className="text-gray-500">유연 근무 정책 및 신청 관리</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              새 정책
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>새 유연 근무 정책</DialogTitle>
              <DialogDescription>정책 정보를 입력하세요.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">정책명</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 주 2일 재택근무"
                  required
                />
              </div>
              <div>
                <Label htmlFor="workType">근무 유형</Label>
                <Select
                  value={formData.workType}
                  onValueChange={(v) => setFormData({ ...formData, workType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(workTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="정책에 대한 설명"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coreStartTime">코어 시작 시간</Label>
                  <Input
                    id="coreStartTime"
                    type="time"
                    value={formData.coreStartTime}
                    onChange={(e) => setFormData({ ...formData, coreStartTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="coreEndTime">코어 종료 시간</Label>
                  <Input
                    id="coreEndTime"
                    type="time"
                    value={formData.coreEndTime}
                    onChange={(e) => setFormData({ ...formData, coreEndTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxRemoteDays">최대 재택일 (주)</Label>
                  <Input
                    id="maxRemoteDays"
                    type="number"
                    min="0"
                    max="5"
                    value={formData.maxRemoteDays}
                    onChange={(e) => setFormData({ ...formData, maxRemoteDays: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                    className="mr-2"
                  />
                  <Label htmlFor="requiresApproval">승인 필요</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">생성</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>전체 정책</CardDescription>
            <CardTitle className="text-3xl">{policies.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Briefcase className="w-4 h-4" />
              <span>활성: {activePolicies}개</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>재택/하이브리드</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{remotePolices}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Home className="w-4 h-4" />
              <span>원격 근무 가능</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>전체 신청</CardDescription>
            <CardTitle className="text-3xl">{totalRequests}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>누적 신청 건수</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>승인 필요</CardDescription>
            <CardTitle className="text-3xl">{policies.filter(p => p.requiresApproval).length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <CheckCircle className="w-4 h-4" />
              <span>관리자 승인 정책</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>정책 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>정책명</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>코어 타임</TableHead>
                <TableHead className="text-center">최대 재택일</TableHead>
                <TableHead className="text-center">승인 필요</TableHead>
                <TableHead className="text-center">상태</TableHead>
                <TableHead className="text-right">신청 수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => {
                const IconComponent = workTypeIcons[policy.workType] || Briefcase;
                return (
                  <TableRow key={policy.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{policy.name}</p>
                          {policy.description && (
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">{policy.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{workTypeLabels[policy.workType]}</Badge>
                    </TableCell>
                    <TableCell>
                      {policy.coreStartTime && policy.coreEndTime
                        ? `${policy.coreStartTime} ~ ${policy.coreEndTime}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {policy.maxRemoteDays ? `${policy.maxRemoteDays}일` : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {policy.requiresApproval ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {policy.isActive ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {policy._count.requests}
                    </TableCell>
                  </TableRow>
                );
              })}
              {policies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    유연 근무 정책이 없습니다. 새 정책을 생성해 주세요.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
