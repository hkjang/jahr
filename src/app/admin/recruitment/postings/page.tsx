'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Plus,
  Users,
  Eye,
  Edit,
  Trash2,
  Globe
} from 'lucide-react';

interface JobPosting {
  id: string;
  title: string;
  organizationId: string;
  positionId: string;
  description: string;
  requirements: string;
  benefits: string | null;
  salaryRange: string | null;
  employmentType: string;
  location: string | null;
  status: string;
  publishedAt: string | null;
  closingDate: string | null;
  createdAt: string;
  _count: {
    applications: number;
  };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-yellow-100 text-yellow-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: '초안',
  PUBLISHED: '게시중',
  CLOSED: '마감',
  CANCELLED: '취소',
};

const employmentTypeLabels: Record<string, string> = {
  REGULAR: '정규직',
  CONTRACT: '계약직',
  INTERN: '인턴',
  PART_TIME: '파트타임',
};

export default function JobPostingsPage() {
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    organizationId: '',
    positionId: '',
    description: '',
    requirements: '',
    benefits: '',
    salaryRange: '',
    employmentType: 'REGULAR',
    location: '',
    closingDate: '',
  });

  useEffect(() => {
    fetchPostings();
  }, [statusFilter]);

  const fetchPostings = async () => {
    try {
      setLoading(true);
      const url = statusFilter !== 'all'
        ? `/api/job-postings?status=${statusFilter}`
        : '/api/job-postings';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPostings(data);
      }
    } catch (error) {
      console.error('Failed to fetch postings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/job-postings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: 'admin',
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        fetchPostings();
        setFormData({
          title: '',
          organizationId: '',
          positionId: '',
          description: '',
          requirements: '',
          benefits: '',
          salaryRange: '',
          employmentType: 'REGULAR',
          location: '',
          closingDate: '',
        });
      }
    } catch (error) {
      console.error('Failed to create posting:', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/job-postings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchPostings();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const deletePosting = async (id: string) => {
    if (!confirm('이 채용 공고를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/job-postings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPostings();
      }
    } catch (error) {
      console.error('Failed to delete posting:', error);
    }
  };

  // 통계
  const stats = {
    total: postings.length,
    published: postings.filter(p => p.status === 'PUBLISHED').length,
    totalApplications: postings.reduce((sum, p) => sum + p._count.applications, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">채용 공고</h1>
          <p className="text-gray-400 mt-1">채용 공고를 관리하고 지원자를 모집합니다.</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          공고 등록
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">전체 공고</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">게시중</CardTitle>
            <Globe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.published}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">총 지원자</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.totalApplications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>상태</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="DRAFT">초안</SelectItem>
            <SelectItem value="PUBLISHED">게시중</SelectItem>
            <SelectItem value="CLOSED">마감</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Postings List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">로딩 중...</div>
      ) : postings.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-8 text-gray-400">
            등록된 채용 공고가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {postings.map(posting => (
            <Card key={posting.id} className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-white">{posting.title}</h3>
                      <Badge className={statusColors[posting.status]}>
                        {statusLabels[posting.status]}
                      </Badge>
                      <Badge variant="outline">
                        {employmentTypeLabels[posting.employmentType]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {posting.location && <span>📍 {posting.location}</span>}
                      {posting.salaryRange && <span>💰 {posting.salaryRange}</span>}
                      {posting.closingDate && (
                        <span>📅 마감: {new Date(posting.closingDate).toLocaleDateString('ko-KR')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{posting._count.applications}명 지원</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {posting.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(posting.id, 'PUBLISHED')}
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        게시
                      </Button>
                    )}
                    {posting.status === 'PUBLISHED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(posting.id, 'CLOSED')}
                      >
                        마감
                      </Button>
                    )}
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deletePosting(posting.id)}
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

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>채용 공고 등록</CardTitle>
              <CardDescription>새로운 채용 공고를 등록합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>공고 제목</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="예: 프론트엔드 개발자 (React/TypeScript)"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>조직 ID</Label>
                    <Input
                      value={formData.organizationId}
                      onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                      placeholder="조직 ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>직급 ID</Label>
                    <Input
                      value={formData.positionId}
                      onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                      placeholder="직급 ID"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>고용 형태</Label>
                    <Select
                      value={formData.employmentType}
                      onValueChange={(v) => setFormData({ ...formData, employmentType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REGULAR">정규직</SelectItem>
                        <SelectItem value="CONTRACT">계약직</SelectItem>
                        <SelectItem value="INTERN">인턴</SelectItem>
                        <SelectItem value="PART_TIME">파트타임</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>근무지</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="서울시 강남구"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>직무 설명</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="담당 업무 및 역할에 대해 설명해주세요."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>자격 요건</Label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="필수 자격 요건 및 우대 사항을 입력하세요."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>연봉 범위</Label>
                    <Input
                      value={formData.salaryRange}
                      onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                      placeholder="4,000~6,000만원"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>마감일</Label>
                    <Input
                      type="date"
                      value={formData.closingDate}
                      onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
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
