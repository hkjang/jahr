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
  AlertTriangle, 
  CheckCircle,
  Database,
  History,
  Shield,
  Trash2,
  Eye,
  Plus
} from 'lucide-react';

interface DataQualityIssue {
  id: string;
  issueType: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  description: string;
  severity: string;
  isResolved: boolean;
  createdAt: string;
}

interface DataDeletionRequest {
  id: string;
  requesterId: string;
  targetUserId: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface DataSnapshot {
  id: string;
  entityType: string;
  entityId: string;
  operation: string;
  changedBy: string;
  changedAt: string;
  beforeData: unknown;
  afterData: unknown;
}

const issueTypeLabels: Record<string, string> = {
  MISSING_DATA: '결측치',
  INCONSISTENCY: '정합성 오류',
  DUPLICATE: '중복 데이터',
  INVALID_FORMAT: '형식 오류',
  POLICY_VIOLATION: '정책 위반',
};

const severityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

const deletionStatusLabels: Record<string, string> = {
  PENDING: '대기중',
  APPROVED: '승인됨',
  COMPLETED: '완료',
  REJECTED: '거절됨',
};

export default function DataGovernancePage() {
  const [issues, setIssues] = useState<DataQualityIssue[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>([]);
  const [snapshots, setSnapshots] = useState<DataSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quality');
  
  // Dialog states
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [snapshotDetailOpen, setSnapshotDetailOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<DataSnapshot | null>(null);
  
  // Form states
  const [newIssue, setNewIssue] = useState({
    issueType: 'MISSING_DATA',
    entityType: '',
    entityId: '',
    fieldName: '',
    description: '',
    severity: 'MEDIUM',
  });
  
  const [newDeletionRequest, setNewDeletionRequest] = useState({
    requesterId: '',
    targetUserId: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [issuesRes, deletionRes, snapshotsRes] = await Promise.all([
        fetch('/api/data-quality?resolved=false'),
        fetch('/api/data-deletion-requests'),
        fetch('/api/data-snapshots'),
      ]);

      if (issuesRes.ok) setIssues(await issuesRes.json());
      if (deletionRes.ok) setDeletionRequests(await deletionRes.json());
      if (snapshotsRes.ok) setSnapshots(await snapshotsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create Issue
  const handleCreateIssue = async () => {
    try {
      const res = await fetch('/api/data-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIssue),
      });
      
      if (res.ok) {
        setIssueDialogOpen(false);
        setNewIssue({
          issueType: 'MISSING_DATA',
          entityType: '',
          entityId: '',
          fieldName: '',
          description: '',
          severity: 'MEDIUM',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  };

  // Resolve Issue
  const handleResolveIssue = async (id: string) => {
    try {
      const res = await fetch(`/api/data-quality/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: true, resolvedBy: 'admin' }),
      });
      
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Failed to resolve issue:', error);
    }
  };

  // Delete Issue
  const handleDeleteIssue = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const res = await fetch(`/api/data-quality/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Failed to delete issue:', error);
    }
  };

  // Create Deletion Request
  const handleCreateDeletionRequest = async () => {
    try {
      const res = await fetch('/api/data-deletion-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeletionRequest),
      });
      
      if (res.ok) {
        setDeletionDialogOpen(false);
        setNewDeletionRequest({ requesterId: '', targetUserId: '', reason: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create deletion request:', error);
    }
  };

  // Process Deletion Request
  const handleProcessDeletionRequest = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/data-deletion-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, processedBy: 'admin' }),
      });
      
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Failed to process request:', error);
    }
  };

  // 통계
  const stats = {
    pendingIssues: issues.length,
    highSeverity: issues.filter(i => i.severity === 'HIGH').length,
    pendingDeletions: deletionRequests.filter(r => r.status === 'PENDING').length,
    recentChanges: snapshots.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">데이터 거버넌스</h1>
        <p className="text-muted-foreground">데이터 품질 및 보안을 관리합니다.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">품질 이슈</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingIssues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">심각 이슈</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highSeverity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">삭제 요청</CardTitle>
            <Trash2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDeletions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 변경</CardTitle>
            <History className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentChanges}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="quality">품질 이슈 ({issues.length})</TabsTrigger>
          <TabsTrigger value="deletion">삭제 요청 ({deletionRequests.length})</TabsTrigger>
          <TabsTrigger value="history">변경 이력 ({snapshots.length})</TabsTrigger>
        </TabsList>

        {/* Quality Issues Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIssueDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              이슈 등록
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : issues.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>미해결 품질 이슈가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            issues.map(issue => (
              <Card key={issue.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={severityColors[issue.severity]}>{issue.severity}</Badge>
                        <Badge variant="outline">{issueTypeLabels[issue.issueType]}</Badge>
                        <span className="font-medium">{issue.entityType}.{issue.fieldName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      <p className="text-xs text-muted-foreground">
                        엔티티 ID: {issue.entityId} | {new Date(issue.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleResolveIssue(issue.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        해결
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteIssue(issue.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Deletion Requests Tab */}
        <TabsContent value="deletion" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setDeletionDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              삭제 요청
            </Button>
          </div>
          
          {deletionRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                삭제 요청이 없습니다.
              </CardContent>
            </Card>
          ) : (
            deletionRequests.map(req => (
              <Card key={req.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="font-medium">사용자 ID: {req.targetUserId}</span>
                        <Badge variant="outline">{deletionStatusLabels[req.status]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        요청자: {req.requesterId} | {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    {req.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleProcessDeletionRequest(req.id, 'APPROVED')}>
                          승인
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleProcessDeletionRequest(req.id, 'REJECTED')}>
                          거절
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Change History Tab */}
        <TabsContent value="history" className="space-y-4">
          {snapshots.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                변경 이력이 없습니다.
              </CardContent>
            </Card>
          ) : (
            snapshots.slice(0, 20).map(snapshot => (
              <Card key={snapshot.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{snapshot.operation}</Badge>
                      <span className="font-medium">{snapshot.entityType}</span>
                      <span className="text-sm text-muted-foreground">ID: {snapshot.entityId}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{snapshot.changedBy}</span>
                      <span>{new Date(snapshot.changedAt).toLocaleString('ko-KR')}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedSnapshot(snapshot);
                          setSnapshotDetailOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Issue Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>품질 이슈 등록</DialogTitle>
            <DialogDescription>데이터 품질 이슈를 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>이슈 유형</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={newIssue.issueType}
                  onChange={(e) => setNewIssue({ ...newIssue, issueType: e.target.value })}
                >
                  <option value="MISSING_DATA">결측치</option>
                  <option value="INCONSISTENCY">정합성 오류</option>
                  <option value="DUPLICATE">중복 데이터</option>
                  <option value="INVALID_FORMAT">형식 오류</option>
                  <option value="POLICY_VIOLATION">정책 위반</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>심각도</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={newIssue.severity}
                  onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value })}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>엔티티 타입</Label>
                <Input
                  value={newIssue.entityType}
                  onChange={(e) => setNewIssue({ ...newIssue, entityType: e.target.value })}
                  placeholder="Employee, User 등"
                />
              </div>
              <div className="space-y-2">
                <Label>엔티티 ID</Label>
                <Input
                  value={newIssue.entityId}
                  onChange={(e) => setNewIssue({ ...newIssue, entityId: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>필드명</Label>
              <Input
                value={newIssue.fieldName}
                onChange={(e) => setNewIssue({ ...newIssue, fieldName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                placeholder="이슈에 대한 상세 설명"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>취소</Button>
            <Button onClick={handleCreateIssue}>등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Deletion Request Dialog */}
      <Dialog open={deletionDialogOpen} onOpenChange={setDeletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>데이터 삭제 요청</DialogTitle>
            <DialogDescription>GDPR에 따른 데이터 삭제 요청을 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>요청자 ID</Label>
              <Input
                value={newDeletionRequest.requesterId}
                onChange={(e) => setNewDeletionRequest({ ...newDeletionRequest, requesterId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>삭제 대상 사용자 ID</Label>
              <Input
                value={newDeletionRequest.targetUserId}
                onChange={(e) => setNewDeletionRequest({ ...newDeletionRequest, targetUserId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>삭제 사유</Label>
              <Textarea
                value={newDeletionRequest.reason}
                onChange={(e) => setNewDeletionRequest({ ...newDeletionRequest, reason: e.target.value })}
                placeholder="삭제 요청 사유를 입력하세요"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletionDialogOpen(false)}>취소</Button>
            <Button onClick={handleCreateDeletionRequest}>요청</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Snapshot Detail Dialog */}
      <Dialog open={snapshotDetailOpen} onOpenChange={setSnapshotDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>변경 상세</DialogTitle>
            <DialogDescription>
              {selectedSnapshot?.entityType} - {selectedSnapshot?.operation}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">변경 전</Label>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(selectedSnapshot?.beforeData, null, 2) || 'N/A'}
                </pre>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">변경 후</Label>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(selectedSnapshot?.afterData, null, 2) || 'N/A'}
                </pre>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
