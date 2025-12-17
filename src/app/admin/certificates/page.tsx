'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ExternalLink,
  Shield
} from 'lucide-react';

interface CertificateIssuance {
  id: string;
  employeeId: string;
  purpose: string | null;
  status: string;
  verificationCode: string;
  approvedAt: string | null;
  issuedAt: string | null;
  expiryDate: string | null;
  documentUrl: string | null;
  createdAt: string;
  template: {
    id: string;
    name: string;
    type: string;
  };
}

interface CertificateTemplate {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

const statusColors: Record<string, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  ISSUED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  REQUESTED: '요청됨',
  APPROVED: '승인됨',
  ISSUED: '발급됨',
  REJECTED: '거절됨',
  EXPIRED: '만료됨',
};

const typeLabels: Record<string, string> = {
  EMPLOYMENT: '재직증명서',
  CAREER: '경력증명서',
  SALARY: '급여증명서',
  POSITION: '직위증명서',
  CUSTOM: '기타',
};

export default function CertificatesPage() {
  const [issuances, setIssuances] = useState<CertificateIssuance[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  const [formData, setFormData] = useState({
    templateId: '',
    employeeId: '',
    purpose: '',
  });

  useEffect(() => {
    fetchIssuances();
    fetchTemplates();
  }, [statusFilter]);

  const fetchIssuances = async () => {
    try {
      setLoading(true);
      const url = statusFilter !== 'all' 
        ? `/api/certificates?status=${statusFilter}`
        : '/api/certificates';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setIssuances(data);
      }
    } catch (error) {
      console.error('Failed to fetch issuances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/certificate-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setShowRequestForm(false);
        fetchIssuances();
        setFormData({ templateId: '', employeeId: '', purpose: '' });
      }
    } catch (error) {
      console.error('Failed to request certificate:', error);
    }
  };

  const updateStatus = async (id: string, status: string, approvedBy?: string) => {
    try {
      const response = await fetch(`/api/certificates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approvedBy }),
      });
      
      if (response.ok) {
        fetchIssuances();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // 통계
  const stats = {
    total: issuances.length,
    pending: issuances.filter(i => i.status === 'REQUESTED' || i.status === 'APPROVED').length,
    issued: issuances.filter(i => i.status === 'ISSUED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">증명서 관리</h1>
          <p className="text-muted-foreground">증명서 발급을 요청하고 관리합니다.</p>
        </div>
        <Button onClick={() => setShowRequestForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          발급 요청
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 발급</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기중</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">발급 완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.issued}</div>
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
            <SelectItem value="REQUESTED">요청됨</SelectItem>
            <SelectItem value="APPROVED">승인됨</SelectItem>
            <SelectItem value="ISSUED">발급됨</SelectItem>
            <SelectItem value="REJECTED">거절됨</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Issuances List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
      ) : issuances.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            발급된 증명서가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {issuances.map(issuance => (
            <Card key={issuance.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{typeLabels[issuance.template.type]}</Badge>
                      <h3 className="font-semibold">{issuance.template.name}</h3>
                      <Badge className={statusColors[issuance.status]}>
                        {statusLabels[issuance.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>직원 ID: {issuance.employeeId}</span>
                      {issuance.purpose && <span>목적: {issuance.purpose}</span>}
                      <span>요청일: {new Date(issuance.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                    {issuance.status === 'ISSUED' && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-3 w-3 text-green-500" />
                        <span className="font-mono text-xs">{issuance.verificationCode}</span>
                        {issuance.expiryDate && (
                          <span className="text-muted-foreground">
                            (유효기간: {new Date(issuance.expiryDate).toLocaleDateString('ko-KR')})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {issuance.status === 'REQUESTED' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => updateStatus(issuance.id, 'APPROVED', 'admin')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          승인
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateStatus(issuance.id, 'REJECTED')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          거절
                        </Button>
                      </>
                    )}
                    {issuance.status === 'APPROVED' && (
                      <Button 
                        size="sm"
                        onClick={() => updateStatus(issuance.id, 'ISSUED')}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        발급
                      </Button>
                    )}
                    {issuance.status === 'ISSUED' && issuance.documentUrl && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        다운로드
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>증명서 발급 요청</CardTitle>
              <CardDescription>증명서를 선택하고 발급을 요청합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>증명서 종류</Label>
                  <Select
                    value={formData.templateId}
                    onValueChange={(v) => setFormData({ ...formData, templateId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} ({typeLabels[t.type]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>직원 ID</Label>
                  <Input
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="직원 ID 입력"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>발급 목적</Label>
                  <Input
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="예: 대출 신청용"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                    취소
                  </Button>
                  <Button type="submit">요청</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
