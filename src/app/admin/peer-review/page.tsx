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
import { Users, Plus, Calendar, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface PeerReviewCycle {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  questionsCount: number;
  stats: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-purple-100 text-purple-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: '초안',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CLOSED: '종료',
};

export default function PeerReviewAdminPage() {
  const [cycles, setCycles] = useState<PeerReviewCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const fetchCycles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/peer-reviews/cycles');
      if (res.ok) {
        const data = await res.json();
        setCycles(data);
      }
    } catch (error) {
      console.error('Failed to fetch cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/peer-reviews/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setDialogOpen(false);
        setFormData({ name: '', description: '', startDate: '', endDate: '' });
        fetchCycles();
      }
    } catch (error) {
      console.error('Failed to create cycle:', error);
    }
  };

  // Statistics
  const activeCycles = cycles.filter(c => c.status === 'IN_PROGRESS').length;
  const totalReviews = cycles.reduce((sum, c) => sum + c.stats.total, 0);
  const completedReviews = cycles.reduce((sum, c) => sum + c.stats.completed, 0);
  const avgCompletion = totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0;

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
          <h1 className="text-2xl font-bold">다면 평가 관리</h1>
          <p className="text-gray-500">360도 피드백 평가 주기 관리</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              새 평가 주기
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 평가 주기 생성</DialogTitle>
              <DialogDescription>다면 평가 주기 정보를 입력하세요.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">주기 이름</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 2024년 상반기 다면 평가"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="평가 주기에 대한 설명"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">시작일</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">종료일</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
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
            <CardDescription>전체 주기</CardDescription>
            <CardTitle className="text-3xl">{cycles.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>활성: {activeCycles}개</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>전체 평가</CardDescription>
            <CardTitle className="text-3xl">{totalReviews}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>리뷰 건수</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>완료된 평가</CardDescription>
            <CardTitle className="text-3xl text-green-600">{completedReviews}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>제출 완료</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>평균 완료율</CardDescription>
            <CardTitle className="text-3xl">{avgCompletion}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={avgCompletion} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Cycles Table */}
      <Card>
        <CardHeader>
          <CardTitle>평가 주기 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주기명</TableHead>
                <TableHead>기간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-center">문항수</TableHead>
                <TableHead className="text-center">진행률</TableHead>
                <TableHead className="text-right">완료/전체</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles.map((cycle) => (
                <TableRow key={cycle.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{cycle.name}</p>
                      {cycle.description && (
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{cycle.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-3 h-3" />
                      {new Date(cycle.startDate).toLocaleDateString('ko-KR')} ~{' '}
                      {new Date(cycle.endDate).toLocaleDateString('ko-KR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[cycle.status]}>
                      {statusLabels[cycle.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{cycle.questionsCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={cycle.stats.completionRate} className="h-2 w-20" />
                      <span className="text-sm">{cycle.stats.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">{cycle.stats.completed}</span>
                    <span className="text-gray-400"> / </span>
                    <span>{cycle.stats.total}</span>
                  </TableCell>
                </TableRow>
              ))}
              {cycles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    평가 주기가 없습니다. 새 평가 주기를 생성해 주세요.
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
