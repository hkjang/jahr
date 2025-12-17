'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle,
  Database,
  History,
  Shield,
  Trash2,
  Eye
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
          <TabsTrigger value="quality">
            품질 이슈 ({issues.length})
          </TabsTrigger>
          <TabsTrigger value="deletion">
            삭제 요청 ({deletionRequests.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            변경 이력 ({snapshots.length})
          </TabsTrigger>
        </TabsList>

        {/* Quality Issues Tab */}
        <TabsContent value="quality" className="space-y-4">
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
                        <Badge className={severityColors[issue.severity]}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline">{issueTypeLabels[issue.issueType]}</Badge>
                        <span className="font-medium">{issue.entityType}.{issue.fieldName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      <p className="text-xs text-muted-foreground">
                        엔티티 ID: {issue.entityId} | {new Date(issue.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      해결
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Deletion Requests Tab */}
        <TabsContent value="deletion" className="space-y-4">
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
                        <Button size="sm">승인</Button>
                        <Button size="sm" variant="outline">거절</Button>
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
                      <Button size="sm" variant="outline">
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
    </div>
  );
}
