'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle,
  Clock,
  FileText,
  Shield,
  TrendingUp,
  Users,
  Bell
} from 'lucide-react';

interface ComplianceAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  employeeId: string | null;
  isResolved: boolean;
  createdAt: string;
  rule: {
    id: string;
    name: string;
  } | null;
}

interface LaborContract {
  id: string;
  employeeId: string;
  contractType: string;
  startDate: string;
  endDate: string | null;
  status: string;
}

interface LegalUpdate {
  id: string;
  title: string;
  description: string;
  effectiveDate: string;
  category: string;
  isReviewed: boolean;
}

const severityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const typeLabels: Record<string, string> = {
  OVERTIME_LIMIT: '초과근무',
  CONTRACT_EXPIRY: '계약만료',
  COMPLIANCE_VIOLATION: '규정위반',
  LEGAL_UPDATE: '법규변경',
  RISK_DETECTED: '리스크',
};

const contractStatusLabels: Record<string, string> = {
  ACTIVE: '활성',
  EXPIRING_SOON: '곧만료',
  EXPIRED: '만료됨',
  TERMINATED: '해지',
  RENEWED: '갱신됨',
};

export default function CompliancePage() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [contracts, setContracts] = useState<LaborContract[]>([]);
  const [legalUpdates, setLegalUpdates] = useState<LegalUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [alertsRes, contractsRes, updatesRes] = await Promise.all([
        fetch('/api/compliance-alerts?resolved=false'),
        fetch('/api/labor-contracts?expiringSoon=true'),
        fetch('/api/legal-updates?reviewed=false'),
      ]);

      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (contractsRes.ok) setContracts(await contractsRes.json());
      if (updatesRes.ok) setLegalUpdates(await updatesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      const response = await fetch(`/api/compliance-alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: true, resolvedBy: 'admin' }),
      });
      
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  // 통계
  const stats = {
    criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL').length,
    pendingAlerts: alerts.length,
    expiringContracts: contracts.length,
    pendingUpdates: legalUpdates.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">노무 컴플라이언스</h1>
        <p className="text-muted-foreground">근로 계약 및 컴플라이언스 현황을 모니터링합니다.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={stats.criticalAlerts > 0 ? 'border-red-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">긴급 경고</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.criticalAlerts > 0 ? 'text-red-600' : ''}`}>
              {stats.criticalAlerts}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미해결 경고</CardTitle>
            <Shield className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAlerts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">만료 예정 계약</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">법규 업데이트</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingUpdates}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="alerts">
            경고 ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="contracts">
            계약 관리 ({contracts.length})
          </TabsTrigger>
          <TabsTrigger value="legal">
            법규 업데이트 ({legalUpdates.length})
          </TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>해결되지 않은 경고가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map(alert => (
              <Card key={alert.id} className={alert.severity === 'CRITICAL' ? 'border-red-300' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={severityColors[alert.severity]}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">{typeLabels[alert.type]}</Badge>
                        <h3 className="font-semibold">{alert.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.createdAt).toLocaleDateString('ko-KR')}
                        {alert.employeeId && ` | 직원: ${alert.employeeId}`}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      해결
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          {contracts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                30일 내 만료 예정인 계약이 없습니다.
              </CardContent>
            </Card>
          ) : (
            contracts.map(contract => (
              <Card key={contract.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{contract.employeeId}</span>
                        <Badge variant="outline">{contract.contractType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(contract.startDate).toLocaleDateString('ko-KR')} ~{' '}
                        {contract.endDate ? new Date(contract.endDate).toLocaleDateString('ko-KR') : '무기한'}
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      {contractStatusLabels[contract.status]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Legal Updates Tab */}
        <TabsContent value="legal" className="space-y-4">
          {legalUpdates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                검토가 필요한 법규 업데이트가 없습니다.
              </CardContent>
            </Card>
          ) : (
            legalUpdates.map(update => (
              <Card key={update.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{update.category}</Badge>
                        <h3 className="font-semibold">{update.title}</h3>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        시행일: {new Date(update.effectiveDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {update.description}
                    </p>
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
