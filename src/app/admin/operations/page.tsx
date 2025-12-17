'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
  Activity,
  Rocket,
  Database,
  CheckCircle,
  Plus
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  affectedSystems: string[];
  assignedTo: string | null;
  startedAt: string;
  resolvedAt: string | null;
}

interface DeploymentRecord {
  id: string;
  version: string;
  environment: string;
  deployedBy: string;
  deployedAt: string;
  status: string;
  duration: number | null;
  changelog: string | null;
}

interface BackupSchedule {
  id: string;
  name: string;
  type: string;
  schedule: string;
  retentionDays: number;
  isActive: boolean;
  lastRunAt: string | null;
  lastStatus: string | null;
}

const severityColors: Record<string, string> = {
  P1_CRITICAL: 'bg-red-100 text-red-800',
  P2_HIGH: 'bg-orange-100 text-orange-800',
  P3_MEDIUM: 'bg-yellow-100 text-yellow-800',
  P4_LOW: 'bg-blue-100 text-blue-800',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-800',
  INVESTIGATING: 'bg-orange-100 text-orange-800',
  IDENTIFIED: 'bg-yellow-100 text-yellow-800',
  MONITORING: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
};

export default function OperationsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [backups, setBackups] = useState<BackupSchedule[]>([]);
  const [metrics, setMetrics] = useState<{ stats: { avgResponseTime: number; p95ResponseTime: number; errorRate: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incidents');

  // Dialog states
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [updateIncidentDialogOpen, setUpdateIncidentDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Form states
  const [incidentForm, setIncidentForm] = useState({ title: '', description: '', severity: 'P3_MEDIUM', affectedSystems: '' });
  const [deploymentForm, setDeploymentForm] = useState({ version: '', environment: 'production', changelog: '' });
  const [backupForm, setBackupForm] = useState({ name: '', type: 'FULL', schedule: '0 2 * * *', retentionDays: '30' });
  const [incidentUpdateForm, setIncidentUpdateForm] = useState({ status: '', timelineEvent: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incidentsRes, deploymentsRes, backupsRes, metricsRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/deployments'),
        fetch('/api/backup-schedules'),
        fetch('/api/performance-metrics?hours=24'),
      ]);

      if (incidentsRes.ok) setIncidents(await incidentsRes.json());
      if (deploymentsRes.ok) setDeployments(await deploymentsRes.json());
      if (backupsRes.ok) setBackups(await backupsRes.json());
      if (metricsRes.ok) setMetrics(await metricsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Incident CRUD
  const handleCreateIncident = async () => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...incidentForm,
          affectedSystems: incidentForm.affectedSystems.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setIncidentDialogOpen(false);
        setIncidentForm({ title: '', description: '', severity: 'P3_MEDIUM', affectedSystems: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create incident:', error);
    }
  };

  const handleUpdateIncident = async () => {
    if (!selectedIncident) return;
    try {
      const res = await fetch(`/api/incidents/${selectedIncident.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentUpdateForm),
      });
      if (res.ok) {
        setUpdateIncidentDialogOpen(false);
        setSelectedIncident(null);
        setIncidentUpdateForm({ status: '', timelineEvent: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update incident:', error);
    }
  };

  // Deployment CRUD
  const handleCreateDeployment = async () => {
    try {
      const res = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...deploymentForm,
          deployedBy: 'admin',
          status: 'SUCCESS',
        }),
      });
      if (res.ok) {
        setDeploymentDialogOpen(false);
        setDeploymentForm({ version: '', environment: 'production', changelog: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create deployment:', error);
    }
  };

  // Backup CRUD
  const handleCreateBackup = async () => {
    try {
      const res = await fetch('/api/backup-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...backupForm,
          retentionDays: parseInt(backupForm.retentionDays),
        }),
      });
      if (res.ok) {
        setBackupDialogOpen(false);
        setBackupForm({ name: '', type: 'FULL', schedule: '0 2 * * *', retentionDays: '30' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'P1_CRITICAL' && i.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">운영 현황</h1>
          <p className="text-muted-foreground">시스템 인시던트, 배포, 백업 현황을 관리합니다.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={criticalIncidents > 0 ? 'border-red-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 인시던트</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${criticalIncidents > 0 ? 'text-red-500' : 'text-yellow-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${criticalIncidents > 0 ? 'text-red-600' : ''}`}>{activeIncidents}</div>
            {criticalIncidents > 0 && <p className="text-xs text-red-600">P1 심각: {criticalIncidents}건</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 응답시간</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.stats.avgResponseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground">P95: {metrics?.stats.p95ResponseTime || 0}ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">에러율</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.stats.errorRate || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 배포</CardTitle>
            <Rocket className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deployments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="incidents">인시던트 ({incidents.length})</TabsTrigger>
          <TabsTrigger value="deployments">배포 이력 ({deployments.length})</TabsTrigger>
          <TabsTrigger value="backups">백업 ({backups.length})</TabsTrigger>
        </TabsList>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIncidentDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              인시던트 등록
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : incidents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>인시던트가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            incidents.map(incident => (
              <Card key={incident.id} className={incident.severity === 'P1_CRITICAL' && incident.status !== 'RESOLVED' ? 'border-red-300' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={severityColors[incident.severity]}>{incident.severity.replace('_', ' ')}</Badge>
                        <Badge className={statusColors[incident.status]}>{incident.status}</Badge>
                        <h3 className="font-semibold">{incident.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{incident.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>시작: {new Date(incident.startedAt).toLocaleString('ko-KR')}</span>
                        {incident.resolvedAt && <span>해결: {new Date(incident.resolvedAt).toLocaleString('ko-KR')}</span>}
                      </div>
                    </div>
                    {incident.status !== 'RESOLVED' && (
                      <Button size="sm" variant="outline" onClick={() => { setSelectedIncident(incident); setIncidentUpdateForm({ status: incident.status, timelineEvent: '' }); setUpdateIncidentDialogOpen(true); }}>
                        상태 변경
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Deployments Tab */}
        <TabsContent value="deployments" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setDeploymentDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              배포 기록
            </Button>
          </div>
          
          {deployments.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground">배포 이력이 없습니다.</CardContent></Card>
          ) : (
            deployments.map(deployment => (
              <Card key={deployment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Rocket className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{deployment.version}</span>
                          <Badge variant="outline">{deployment.environment}</Badge>
                          <Badge className={deployment.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{deployment.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {deployment.deployedBy} | {new Date(deployment.deployedAt).toLocaleString('ko-KR')}
                          {deployment.duration && ` | ${deployment.duration}초`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setBackupDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              백업 스케줄 추가
            </Button>
          </div>
          
          {backups.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground">백업 스케줄이 없습니다.</CardContent></Card>
          ) : (
            backups.map(backup => (
              <Card key={backup.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Database className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{backup.name}</span>
                          <Badge variant="outline">{backup.type}</Badge>
                          <Badge className={backup.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{backup.isActive ? '활성' : '비활성'}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          스케줄: {backup.schedule} | 보관: {backup.retentionDays}일
                          {backup.lastRunAt && ` | 마지막 실행: ${new Date(backup.lastRunAt).toLocaleString('ko-KR')}`}
                        </p>
                      </div>
                    </div>
                    {backup.lastStatus && <Badge className={backup.lastStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{backup.lastStatus}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Incident Dialog */}
      <Dialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>인시던트 등록</DialogTitle>
            <DialogDescription>시스템 장애나 이슈를 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>제목</Label>
              <Input value={incidentForm.title} onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })} placeholder="인시던트 제목" />
            </div>
            <div className="space-y-2">
              <Label>심각도</Label>
              <select className="w-full border rounded-md p-2" value={incidentForm.severity} onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}>
                <option value="P1_CRITICAL">P1 - Critical</option>
                <option value="P2_HIGH">P2 - High</option>
                <option value="P3_MEDIUM">P3 - Medium</option>
                <option value="P4_LOW">P4 - Low</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>영향 시스템 (쉼표 구분)</Label>
              <Input value={incidentForm.affectedSystems} onChange={(e) => setIncidentForm({ ...incidentForm, affectedSystems: e.target.value })} placeholder="API, Database, Auth" />
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea value={incidentForm.description} onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })} placeholder="상세 설명" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIncidentDialogOpen(false)}>취소</Button>
            <Button onClick={handleCreateIncident}>등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Incident Dialog */}
      <Dialog open={updateIncidentDialogOpen} onOpenChange={setUpdateIncidentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>인시던트 상태 변경</DialogTitle>
            <DialogDescription>{selectedIncident?.title}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>상태</Label>
              <select className="w-full border rounded-md p-2" value={incidentUpdateForm.status} onChange={(e) => setIncidentUpdateForm({ ...incidentUpdateForm, status: e.target.value })}>
                <option value="OPEN">Open</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="IDENTIFIED">Identified</option>
                <option value="MONITORING">Monitoring</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>타임라인 메모</Label>
              <Textarea value={incidentUpdateForm.timelineEvent} onChange={(e) => setIncidentUpdateForm({ ...incidentUpdateForm, timelineEvent: e.target.value })} placeholder="상태 변경 사유" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateIncidentDialogOpen(false)}>취소</Button>
            <Button onClick={handleUpdateIncident}>변경</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Deployment Dialog */}
      <Dialog open={deploymentDialogOpen} onOpenChange={setDeploymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배포 기록</DialogTitle>
            <DialogDescription>배포 이력을 기록합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>버전</Label>
              <Input value={deploymentForm.version} onChange={(e) => setDeploymentForm({ ...deploymentForm, version: e.target.value })} placeholder="v1.2.3" />
            </div>
            <div className="space-y-2">
              <Label>환경</Label>
              <select className="w-full border rounded-md p-2" value={deploymentForm.environment} onChange={(e) => setDeploymentForm({ ...deploymentForm, environment: e.target.value })}>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>변경 사항</Label>
              <Textarea value={deploymentForm.changelog} onChange={(e) => setDeploymentForm({ ...deploymentForm, changelog: e.target.value })} placeholder="변경 사항 기록" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeploymentDialogOpen(false)}>취소</Button>
            <Button onClick={handleCreateDeployment}>기록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Backup Dialog */}
      <Dialog open={backupDialogOpen} onOpenChange={setBackupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>백업 스케줄 추가</DialogTitle>
            <DialogDescription>정기 백업 스케줄을 설정합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>이름</Label>
              <Input value={backupForm.name} onChange={(e) => setBackupForm({ ...backupForm, name: e.target.value })} placeholder="Daily Full Backup" />
            </div>
            <div className="space-y-2">
              <Label>타입</Label>
              <select className="w-full border rounded-md p-2" value={backupForm.type} onChange={(e) => setBackupForm({ ...backupForm, type: e.target.value })}>
                <option value="FULL">Full</option>
                <option value="INCREMENTAL">Incremental</option>
                <option value="DIFFERENTIAL">Differential</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>스케줄 (Cron)</Label>
              <Input value={backupForm.schedule} onChange={(e) => setBackupForm({ ...backupForm, schedule: e.target.value })} placeholder="0 2 * * *" />
            </div>
            <div className="space-y-2">
              <Label>보관 기간 (일)</Label>
              <Input type="number" value={backupForm.retentionDays} onChange={(e) => setBackupForm({ ...backupForm, retentionDays: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackupDialogOpen(false)}>취소</Button>
            <Button onClick={handleCreateBackup}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
