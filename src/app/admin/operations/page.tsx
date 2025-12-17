'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Activity,
  Clock,
  Rocket,
  Database,
  CheckCircle
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  affectedSystems: string[];
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
}

interface BackupSchedule {
  id: string;
  name: string;
  type: string;
  schedule: string;
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

  // 통계
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'P1_CRITICAL' && i.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">운영 현황</h1>
        <p className="text-muted-foreground">시스템 인시던트, 배포, 백업 현황을 관리합니다.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={criticalIncidents > 0 ? 'border-red-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 인시던트</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${criticalIncidents > 0 ? 'text-red-500' : 'text-yellow-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${criticalIncidents > 0 ? 'text-red-600' : ''}`}>
              {activeIncidents}
            </div>
            {criticalIncidents > 0 && (
              <p className="text-xs text-red-600">P1 심각: {criticalIncidents}건</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 응답시간</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.stats.avgResponseTime || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">P95: {metrics?.stats.p95ResponseTime || 0}ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">에러율</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.stats.errorRate || 0}%
            </div>
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
          <TabsTrigger value="incidents">
            인시던트 ({incidents.length})
          </TabsTrigger>
          <TabsTrigger value="deployments">
            배포 이력 ({deployments.length})
          </TabsTrigger>
          <TabsTrigger value="backups">
            백업 ({backups.length})
          </TabsTrigger>
        </TabsList>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
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
                        <Badge className={severityColors[incident.severity]}>
                          {incident.severity.replace('_', ' ')}
                        </Badge>
                        <Badge className={statusColors[incident.status]}>
                          {incident.status}
                        </Badge>
                        <h3 className="font-semibold">{incident.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {incident.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>시작: {new Date(incident.startedAt).toLocaleString('ko-KR')}</span>
                        {incident.resolvedAt && (
                          <span>해결: {new Date(incident.resolvedAt).toLocaleString('ko-KR')}</span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">상세</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Deployments Tab */}
        <TabsContent value="deployments" className="space-y-4">
          {deployments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                배포 이력이 없습니다.
              </CardContent>
            </Card>
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
                          <Badge className={deployment.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {deployment.status}
                          </Badge>
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
          {backups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                백업 스케줄이 없습니다.
              </CardContent>
            </Card>
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
                          <Badge className={backup.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {backup.isActive ? '활성' : '비활성'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          스케줄: {backup.schedule}
                          {backup.lastRunAt && ` | 마지막 실행: ${new Date(backup.lastRunAt).toLocaleString('ko-KR')}`}
                        </p>
                      </div>
                    </div>
                    {backup.lastStatus && (
                      <Badge className={backup.lastStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {backup.lastStatus}
                      </Badge>
                    )}
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
