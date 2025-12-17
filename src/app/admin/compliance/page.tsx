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
  FileText,
  Clock,
  BookOpen,
  Plus,
  CheckCircle
} from 'lucide-react';

interface ComplianceAlert {
  id: string;
  alertType: string;
  severity: string;
  title: string;
  description: string;
  entityType: string;
  entityId: string;
  isResolved: boolean;
  createdAt: string;
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
  category: string;
  effectiveDate: string;
  summary: string;
  isReviewed: boolean;
}

const severityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export default function CompliancePage() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [contracts, setContracts] = useState<LaborContract[]>([]);
  const [legalUpdates, setLegalUpdates] = useState<LegalUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');

  // Dialog states
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [legalDialogOpen, setLegalDialogOpen] = useState(false);

  // Form states
  const [alertForm, setAlertForm] = useState({ alertType: 'OVERTIME', severity: 'MEDIUM', title: '', description: '', entityType: 'Employee', entityId: '' });
  const [contractForm, setContractForm] = useState({ employeeId: '', contractType: 'PERMANENT', startDate: '', endDate: '' });
  const [legalForm, setLegalForm] = useState({ title: '', category: 'LABOR_LAW', effectiveDate: '', summary: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alertsRes, contractsRes, legalsRes] = await Promise.all([
        fetch('/api/compliance-alerts'),
        fetch('/api/labor-contracts'),
        fetch('/api/legal-updates'),
      ]);

      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (contractsRes.ok) setContracts(await contractsRes.json());
      if (legalsRes.ok) setLegalUpdates(await legalsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Alert CRUD
  const handleCreateAlert = async () => {
    try {
      const res = await fetch('/api/compliance-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertForm),
      });
      if (res.ok) {
        setAlertDialogOpen(false);
        setAlertForm({ alertType: 'OVERTIME', severity: 'MEDIUM', title: '', description: '', entityType: 'Employee', entityId: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await fetch(`/api/compliance-alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: true, resolvedBy: 'admin' }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  // Contract CRUD
  const handleCreateContract = async () => {
    try {
      const res = await fetch('/api/labor-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contractForm,
          endDate: contractForm.endDate || null,
          status: 'ACTIVE',
        }),
      });
      if (res.ok) {
        setContractDialogOpen(false);
        setContractForm({ employeeId: '', contractType: 'PERMANENT', startDate: '', endDate: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create contract:', error);
    }
  };

  // Legal Update CRUD
  const handleCreateLegalUpdate = async () => {
    try {
      const res = await fetch('/api/legal-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(legalForm),
      });
      if (res.ok) {
        setLegalDialogOpen(false);
        setLegalForm({ title: '', category: 'LABOR_LAW', effectiveDate: '', summary: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create legal update:', error);
    }
  };

  const pendingAlerts = alerts.filter(a => !a.isResolved).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.isResolved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">컴플라이언스</h1>
        <p className="text-muted-foreground">노무 및 법규 준수 현황을 관리합니다.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={criticalAlerts > 0 ? 'border-red-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미해결 알림</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${criticalAlerts > 0 ? 'text-red-500' : 'text-yellow-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${criticalAlerts > 0 ? 'text-red-600' : ''}`}>{pendingAlerts}</div>
            {criticalAlerts > 0 && <p className="text-xs text-red-600">Critical: {criticalAlerts}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">근로 계약</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{contracts.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">법규 업데이트</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{legalUpdates.length}</div></CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="alerts">알림 ({alerts.length})</TabsTrigger>
          <TabsTrigger value="contracts">근로 계약 ({contracts.length})</TabsTrigger>
          <TabsTrigger value="legal">법규 업데이트 ({legalUpdates.length})</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setAlertDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />알림 추가</Button>
          </div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : alerts.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground"><CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" /><p>알림이 없습니다.</p></CardContent></Card>
          ) : (
            alerts.map(alert => (
              <Card key={alert.id} className={alert.severity === 'CRITICAL' && !alert.isResolved ? 'border-red-300' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={severityColors[alert.severity]}>{alert.severity}</Badge>
                        <Badge variant="outline">{alert.alertType}</Badge>
                        <h3 className="font-semibold">{alert.title}</h3>
                        {alert.isResolved && <Badge className="bg-green-100 text-green-800">해결됨</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground">{alert.entityType}: {alert.entityId} | {new Date(alert.createdAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                    {!alert.isResolved && (
                      <Button size="sm" onClick={() => handleResolveAlert(alert.id)}><CheckCircle className="h-4 w-4 mr-1" />해결</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setContractDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />계약 추가</Button>
          </div>
          {contracts.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground">근로 계약이 없습니다.</CardContent></Card>
          ) : (
            contracts.map(contract => (
              <Card key={contract.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">직원 ID: {contract.employeeId}</span>
                          <Badge variant="outline">{contract.contractType}</Badge>
                          <Badge className={contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{contract.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(contract.startDate).toLocaleDateString('ko-KR')} ~ {contract.endDate ? new Date(contract.endDate).toLocaleDateString('ko-KR') : '무기한'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Legal Updates Tab */}
        <TabsContent value="legal" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setLegalDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />법규 추가</Button>
          </div>
          {legalUpdates.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground">법규 업데이트가 없습니다.</CardContent></Card>
          ) : (
            legalUpdates.map(update => (
              <Card key={update.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-500" />
                        <h3 className="font-semibold">{update.title}</h3>
                        <Badge variant="outline">{update.category}</Badge>
                        {update.isReviewed && <Badge className="bg-green-100 text-green-800">검토완료</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{update.summary}</p>
                      <p className="text-xs text-muted-foreground">시행일: {new Date(update.effectiveDate).toLocaleDateString('ko-KR')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Alert Dialog */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>컴플라이언스 알림 추가</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>제목</Label><Input value={alertForm.title} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>알림 유형</Label>
                <select className="w-full border rounded-md p-2" value={alertForm.alertType} onChange={(e) => setAlertForm({ ...alertForm, alertType: e.target.value })}>
                  <option value="OVERTIME">초과근무</option>
                  <option value="CONTRACT_EXPIRY">계약만료</option>
                  <option value="POLICY_VIOLATION">정책위반</option>
                  <option value="LEGAL_UPDATE">법규변경</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>심각도</Label>
                <select className="w-full border rounded-md p-2" value={alertForm.severity} onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>엔티티 타입</Label><Input value={alertForm.entityType} onChange={(e) => setAlertForm({ ...alertForm, entityType: e.target.value })} /></div>
              <div className="space-y-2"><Label>엔티티 ID</Label><Input value={alertForm.entityId} onChange={(e) => setAlertForm({ ...alertForm, entityId: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>설명</Label><Textarea value={alertForm.description} onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAlertDialogOpen(false)}>취소</Button><Button onClick={handleCreateAlert}>추가</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Contract Dialog */}
      <Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>근로 계약 추가</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>직원 ID</Label><Input value={contractForm.employeeId} onChange={(e) => setContractForm({ ...contractForm, employeeId: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>계약 유형</Label>
              <select className="w-full border rounded-md p-2" value={contractForm.contractType} onChange={(e) => setContractForm({ ...contractForm, contractType: e.target.value })}>
                <option value="PERMANENT">정규직</option>
                <option value="CONTRACT">계약직</option>
                <option value="PART_TIME">파트타임</option>
                <option value="INTERN">인턴</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>시작일</Label><Input type="date" value={contractForm.startDate} onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>종료일 (선택)</Label><Input type="date" value={contractForm.endDate} onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setContractDialogOpen(false)}>취소</Button><Button onClick={handleCreateContract}>추가</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Legal Update Dialog */}
      <Dialog open={legalDialogOpen} onOpenChange={setLegalDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>법규 업데이트 추가</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>제목</Label><Input value={legalForm.title} onChange={(e) => setLegalForm({ ...legalForm, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>카테고리</Label>
                <select className="w-full border rounded-md p-2" value={legalForm.category} onChange={(e) => setLegalForm({ ...legalForm, category: e.target.value })}>
                  <option value="LABOR_LAW">근로기준법</option>
                  <option value="TAX">세법</option>
                  <option value="SAFETY">안전보건</option>
                  <option value="OTHER">기타</option>
                </select>
              </div>
              <div className="space-y-2"><Label>시행일</Label><Input type="date" value={legalForm.effectiveDate} onChange={(e) => setLegalForm({ ...legalForm, effectiveDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>요약</Label><Textarea value={legalForm.summary} onChange={(e) => setLegalForm({ ...legalForm, summary: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setLegalDialogOpen(false)}>취소</Button><Button onClick={handleCreateLegalUpdate}>추가</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
