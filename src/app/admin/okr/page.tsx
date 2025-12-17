'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Plus, RefreshCw } from 'lucide-react';

interface DashboardData {
  period: string;
  summary: {
    total: number;
    completed: number;
    active: number;
    avgProgress: number;
  };
  byLevel: {
    company: number;
    department: number;
    individual: number;
  };
  levelProgress: Array<{
    level: string;
    avgProgress: number;
    count: number;
  }>;
  topPerformers: Array<{
    id: string;
    title: string;
    level: string;
    progress: number;
    ownerId: string;
  }>;
  atRisk: Array<{
    id: string;
    title: string;
    level: string;
    progress: number;
    ownerId: string;
  }>;
  recentCheckIns: Array<{
    id: string;
    value: number;
    note: string | null;
    checkedAt: string;
    keyResultTitle: string;
    objectiveTitle: string;
  }>;
}

const levelColors: Record<string, string> = {
  COMPANY: 'bg-purple-100 text-purple-800',
  DEPARTMENT: 'bg-blue-100 text-blue-800',
  TEAM: 'bg-green-100 text-green-800',
  INDIVIDUAL: 'bg-gray-100 text-gray-800',
};

const getCurrentPeriod = () => {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${quarter}`;
};

export default function OKRAdminPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/okr/dashboard?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setDashboard(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const periods = [
    `${new Date().getFullYear()}-Q1`,
    `${new Date().getFullYear()}-Q2`,
    `${new Date().getFullYear()}-Q3`,
    `${new Date().getFullYear()}-Q4`,
  ];

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
          <h1 className="text-2xl font-bold">OKR 관리</h1>
          <p className="text-gray-500">목표 및 핵심 결과 관리</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 목표
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>전체 목표</CardDescription>
            <CardTitle className="text-3xl">{dashboard?.summary.total || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Target className="w-4 h-4" />
              <span>활성: {dashboard?.summary.active || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>평균 진행률</CardDescription>
            <CardTitle className="text-3xl">{dashboard?.summary.avgProgress || 0}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={dashboard?.summary.avgProgress || 0} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>완료된 목표</CardDescription>
            <CardTitle className="text-3xl text-green-600">{dashboard?.summary.completed || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>달성 완료</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>위험 목표</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{dashboard?.atRisk?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span>진행률 30% 미만</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Badge className={levelColors.COMPANY}>전사</Badge>
            </CardDescription>
            <CardTitle>{dashboard?.byLevel.company || 0}개 목표</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress 
              value={dashboard?.levelProgress?.find(l => l.level === 'COMPANY')?.avgProgress || 0} 
              className="h-2" 
            />
            <p className="text-xs text-gray-500 mt-1">
              평균 {dashboard?.levelProgress?.find(l => l.level === 'COMPANY')?.avgProgress || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Badge className={levelColors.DEPARTMENT}>부서</Badge>
            </CardDescription>
            <CardTitle>{dashboard?.byLevel.department || 0}개 목표</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress 
              value={dashboard?.levelProgress?.find(l => l.level === 'DEPARTMENT')?.avgProgress || 0} 
              className="h-2" 
            />
            <p className="text-xs text-gray-500 mt-1">
              평균 {dashboard?.levelProgress?.find(l => l.level === 'DEPARTMENT')?.avgProgress || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Badge className={levelColors.INDIVIDUAL}>개인</Badge>
            </CardDescription>
            <CardTitle>{dashboard?.byLevel.individual || 0}개 목표</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress 
              value={dashboard?.levelProgress?.find(l => l.level === 'INDIVIDUAL')?.avgProgress || 0} 
              className="h-2" 
            />
            <p className="text-xs text-gray-500 mt-1">
              평균 {dashboard?.levelProgress?.find(l => l.level === 'INDIVIDUAL')?.avgProgress || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              상위 성과 목표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>목표</TableHead>
                  <TableHead>레벨</TableHead>
                  <TableHead className="text-right">진행률</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard?.topPerformers?.map((obj) => (
                  <TableRow key={obj.id}>
                    <TableCell className="font-medium">{obj.title}</TableCell>
                    <TableCell>
                      <Badge className={levelColors[obj.level]}>{obj.level}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600 font-medium">{obj.progress}%</span>
                    </TableCell>
                  </TableRow>
                ))}
                {(!dashboard?.topPerformers || dashboard.topPerformers.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      데이터가 없습니다
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* At Risk */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              주의 필요 목표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>목표</TableHead>
                  <TableHead>레벨</TableHead>
                  <TableHead className="text-right">진행률</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard?.atRisk?.map((obj) => (
                  <TableRow key={obj.id}>
                    <TableCell className="font-medium">{obj.title}</TableCell>
                    <TableCell>
                      <Badge className={levelColors[obj.level]}>{obj.level}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-orange-600 font-medium">{obj.progress}%</span>
                    </TableCell>
                  </TableRow>
                ))}
                {(!dashboard?.atRisk || dashboard.atRisk.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      위험 목표 없음 👍
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle>최근 체크인</CardTitle>
          <CardDescription>최근 업데이트된 핵심 결과</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>목표</TableHead>
                <TableHead>핵심 결과</TableHead>
                <TableHead>값</TableHead>
                <TableHead>메모</TableHead>
                <TableHead className="text-right">일시</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard?.recentCheckIns?.map((ci) => (
                <TableRow key={ci.id}>
                  <TableCell className="font-medium">{ci.objectiveTitle}</TableCell>
                  <TableCell>{ci.keyResultTitle}</TableCell>
                  <TableCell>{ci.value}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{ci.note || '-'}</TableCell>
                  <TableCell className="text-right text-gray-500">
                    {new Date(ci.checkedAt).toLocaleString('ko-KR')}
                  </TableCell>
                </TableRow>
              ))}
              {(!dashboard?.recentCheckIns || dashboard.recentCheckIns.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    최근 체크인이 없습니다
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
