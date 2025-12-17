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
  FileText, 
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  History,
  Users,
  CheckCircle
} from 'lucide-react';

interface Policy {
  id: string;
  code: string;
  title: string;
  category: {
    id: string;
    name: string;
  } | null;
  currentVersion: number;
  status: string;
  effectiveDate: string | null;
  requiresAcknowledgment: boolean;
  keywords: string[];
  createdAt: string;
  _count: {
    versions: number;
    acknowledgments: number;
  };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  DEPRECATED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: '초안',
  UNDER_REVIEW: '검토중',
  ACTIVE: '시행중',
  DEPRECATED: '폐기',
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    content: '',
    keywords: '',
    effectiveDate: '',
    requiresAcknowledgment: false,
  });

  useEffect(() => {
    fetchPolicies();
  }, [statusFilter, searchQuery]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      let url = '/api/policies?';
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPolicies(data);
      }
    } catch (error) {
      console.error('Failed to fetch policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
          createdBy: 'admin',
        }),
      });
      
      if (response.ok) {
        setShowCreateForm(false);
        fetchPolicies();
        setFormData({
          code: '',
          title: '',
          content: '',
          keywords: '',
          effectiveDate: '',
          requiresAcknowledgment: false,
        });
      }
    } catch (error) {
      console.error('Failed to create policy:', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/policies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        fetchPolicies();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const deletePolicy = async (id: string) => {
    if (!confirm('이 규정을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/policies/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchPolicies();
      }
    } catch (error) {
      console.error('Failed to delete policy:', error);
    }
  };

  // 통계
  const stats = {
    total: policies.length,
    active: policies.filter(p => p.status === 'ACTIVE').length,
    draft: policies.filter(p => p.status === 'DRAFT').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">인사 규정</h1>
          <p className="text-muted-foreground">인사 규정 및 정책을 관리합니다.</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          규정 등록
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 규정</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">시행중</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">초안</CardTitle>
            <Edit className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목, 코드, 키워드 검색..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="DRAFT">초안</SelectItem>
            <SelectItem value="UNDER_REVIEW">검토중</SelectItem>
            <SelectItem value="ACTIVE">시행중</SelectItem>
            <SelectItem value="DEPRECATED">폐기</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Policies List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
      ) : policies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            등록된 규정이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {policies.map(policy => (
            <Card key={policy.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{policy.code}</Badge>
                      <h3 className="font-semibold">{policy.title}</h3>
                      <Badge className={statusColors[policy.status]}>
                        {statusLabels[policy.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {policy.category && <span>📁 {policy.category.name}</span>}
                      <span className="flex items-center gap-1">
                        <History className="h-3 w-3" />
                        v{policy.currentVersion}
                      </span>
                      {policy.requiresAcknowledgment && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {policy._count.acknowledgments}명 확인
                        </span>
                      )}
                      {policy.effectiveDate && (
                        <span>시행일: {new Date(policy.effectiveDate).toLocaleDateString('ko-KR')}</span>
                      )}
                    </div>
                    {policy.keywords.length > 0 && (
                      <div className="flex gap-1">
                        {policy.keywords.map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {policy.status === 'DRAFT' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(policy.id, 'ACTIVE')}
                      >
                        시행
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
                      onClick={() => deletePolicy(policy.id)}
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
              <CardTitle>규정 등록</CardTitle>
              <CardDescription>새로운 인사 규정을 등록합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>규정 코드</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="예: HR-001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>시행일</Label>
                    <Input
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>규정 제목</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="예: 근로시간 및 휴게에 관한 규정"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>내용</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="규정 내용을 입력하세요."
                    className="min-h-[200px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>키워드 (쉼표로 구분)</Label>
                  <Input
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="예: 근로시간, 휴게, 연장근무"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requiresAck"
                    checked={formData.requiresAcknowledgment}
                    onChange={(e) => setFormData({ ...formData, requiresAcknowledgment: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="requiresAck">직원 확인 필요</Label>
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
