'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileCheck2,
  Plus,
  Copy,
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface CertificateTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  isActive: boolean;
}

interface CertificateIssuance {
  id: string;
  templateId: string;
  employeeId: string;
  verificationCode: string;
  status: string;
  issuedAt: string;
  expiresAt: string | null;
  template: { name: string };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ISSUED: 'bg-green-100 text-green-800',
  REVOKED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
};

export default function CertificatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [issuances, setIssuances] = useState<CertificateIssuance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('issuances');

  // Dialog states
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);

  // Form states
  const [templateForm, setTemplateForm] = useState({ name: '', type: 'EMPLOYMENT', content: '' });
  const [issueForm, setIssueForm] = useState({ templateId: '', employeeId: '', expiresAt: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [templatesRes, issuancesRes] = await Promise.all([
        fetch('/api/certificate-templates'),
        fetch('/api/certificates'),
      ]);

      if (templatesRes.ok) setTemplates(await templatesRes.json());
      if (issuancesRes.ok) setIssuances(await issuancesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Template CRUD
  const handleCreateTemplate = async () => {
    try {
      const res = await fetch('/api/certificate-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm),
      });
      if (res.ok) {
        setTemplateDialogOpen(false);
        setTemplateForm({ name: '', type: 'EMPLOYMENT', content: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  // Issuance CRUD
  const handleIssueCertificate = async () => {
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...issueForm,
          expiresAt: issueForm.expiresAt || null,
        }),
      });
      if (res.ok) {
        setIssueDialogOpen(false);
        setIssueForm({ templateId: '', employeeId: '', expiresAt: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to issue certificate:', error);
    }
  };

  const handleRevokeCertificate = async (id: string) => {
    if (!confirm('정말 취소하시겠습니까?')) return;
    try {
      await fetch(`/api/certificates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REVOKED' }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to revoke certificate:', error);
    }
  };

  const issuedCount = issuances.filter(i => i.status === 'ISSUED').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">증명서 관리</h1>
        <p className="text-gray-400 mt-1">증명서 템플릿 및 발급을 관리합니다.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">템플릿</CardTitle>
            <FileCheck2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">{templates.length}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">발급 완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">{issuedCount}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">총 발급</CardTitle>
            <Send className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">{issuances.length}</div></CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="issuances">발급 내역 ({issuances.length})</TabsTrigger>
          <TabsTrigger value="templates">템플릿 ({templates.length})</TabsTrigger>
        </TabsList>

        {/* Issuances Tab */}
        <TabsContent value="issuances" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIssueDialogOpen(true)} disabled={templates.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              증명서 발급
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : issuances.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground">발급된 증명서가 없습니다.</CardContent></Card>
          ) : (
            issuances.map(issuance => (
              <Card key={issuance.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="h-4 w-4 text-blue-500" />
                        <h3 className="font-semibold">{issuance.template.name}</h3>
                        <Badge className={statusColors[issuance.status]}>{issuance.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">직원 ID: {issuance.employeeId}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{issuance.verificationCode}</span>
                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(issuance.verificationCode)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        발급일: {new Date(issuance.issuedAt).toLocaleDateString('ko-KR')}
                        {issuance.expiresAt && ` | 만료일: ${new Date(issuance.expiresAt).toLocaleDateString('ko-KR')}`}
                      </p>
                    </div>
                    {issuance.status === 'ISSUED' && (
                      <Button size="sm" variant="outline" onClick={() => handleRevokeCertificate(issuance.id)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        취소
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setTemplateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              템플릿 추가
            </Button>
          </div>
          {templates.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground">템플릿이 없습니다.</CardContent></Card>
          ) : (
            templates.map(template => (
              <Card key={template.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="outline">{template.type}</Badge>
                        <Badge className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {template.isActive ? '활성' : '비활성'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{template.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>증명서 템플릿 추가</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>이름</Label><Input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} placeholder="재직증명서" /></div>
            <div className="space-y-2">
              <Label>유형</Label>
              <select className="w-full border rounded-md p-2" value={templateForm.type} onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}>
                <option value="EMPLOYMENT">재직증명서</option>
                <option value="CAREER">경력증명서</option>
                <option value="SALARY">급여명세서</option>
                <option value="OTHER">기타</option>
              </select>
            </div>
            <div className="space-y-2"><Label>내용 템플릿</Label><Textarea value={templateForm.content} onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })} rows={5} placeholder="증명서 내용 (변수: {{name}}, {{position}}, {{department}})" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>취소</Button><Button onClick={handleCreateTemplate}>추가</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Certificate Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>증명서 발급</DialogTitle><DialogDescription>직원에게 증명서를 발급합니다.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>템플릿</Label>
              <select className="w-full border rounded-md p-2" value={issueForm.templateId} onChange={(e) => setIssueForm({ ...issueForm, templateId: e.target.value })}>
                <option value="">선택하세요</option>
                {templates.filter(t => t.isActive).map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2"><Label>직원 ID</Label><Input value={issueForm.employeeId} onChange={(e) => setIssueForm({ ...issueForm, employeeId: e.target.value })} /></div>
            <div className="space-y-2"><Label>만료일 (선택)</Label><Input type="date" value={issueForm.expiresAt} onChange={(e) => setIssueForm({ ...issueForm, expiresAt: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIssueDialogOpen(false)}>취소</Button><Button onClick={handleIssueCertificate}>발급</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
