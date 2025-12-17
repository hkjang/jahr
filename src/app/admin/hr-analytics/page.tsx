'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Heart,
  FileText,
  Target,
  Plus
} from 'lucide-react';

interface ExecutiveReport {
  id: string;
  title: string;
  reportType: string;
  period: string;
  summary: string | null;
  keyInsights: string[];
  generatedAt: string;
}

interface TurnoverRisk {
  id: string;
  employeeId: string;
  riskScore: number;
  riskLevel: string;
  factors: Record<string, unknown>;
  recommendations: string[];
  analyzedAt: string;
}

interface HealthIndex {
  id: string;
  organizationId: string | null;
  period: string;
  overallScore: number;
  turnoverRate: number | null;
  engagementScore: number | null;
  trend: string | null;
}

const riskColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export default function HRAnalyticsPage() {
  const [reports, setReports] = useState<ExecutiveReport[]>([]);
  const [turnoverRisks, setTurnoverRisks] = useState<TurnoverRisk[]>([]);
  const [healthIndices, setHealthIndices] = useState<HealthIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Dialog states
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [healthDialogOpen, setHealthDialogOpen] = useState(false);

  // Form states
  const [reportForm, setReportForm] = useState({ title: '', reportType: 'MONTHLY', period: '', summary: '', keyInsights: '' });
  const [riskForm, setRiskForm] = useState({ employeeId: '', riskScore: '50', riskLevel: 'MEDIUM', recommendations: '' });
  const [healthForm, setHealthForm] = useState({ period: '', overallScore: '70', turnoverRate: '', engagementScore: '', trend: 'STABLE' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, riskRes, healthRes] = await Promise.all([
        fetch('/api/executive-reports'),
        fetch('/api/turnover-risk'),
        fetch('/api/org-health'),
      ]);

      if (reportsRes.ok) setReports(await reportsRes.json());
      if (riskRes.ok) setTurnoverRisks(await riskRes.json());
      if (healthRes.ok) setHealthIndices(await healthRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Report CRUD
  const handleCreateReport = async () => {
    try {
      const res = await fetch('/api/executive-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportForm,
          keyInsights: reportForm.keyInsights.split('\n').filter(Boolean),
          data: {},
        }),
      });
      if (res.ok) {
        setReportDialogOpen(false);
        setReportForm({ title: '', reportType: 'MONTHLY', period: '', summary: '', keyInsights: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  };

  // Risk Analysis CRUD
  const handleCreateRiskAnalysis = async () => {
    try {
      const res = await fetch('/api/turnover-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: riskForm.employeeId,
          riskScore: parseFloat(riskForm.riskScore),
          riskLevel: riskForm.riskLevel,
          factors: {},
          recommendations: riskForm.recommendations.split('\n').filter(Boolean),
        }),
      });
      if (res.ok) {
        setRiskDialogOpen(false);
        setRiskForm({ employeeId: '', riskScore: '50', riskLevel: 'MEDIUM', recommendations: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create risk analysis:', error);
    }
  };

  // Health Index CRUD
  const handleCreateHealthIndex = async () => {
    try {
      const res = await fetch('/api/org-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: healthForm.period,
          overallScore: parseFloat(healthForm.overallScore),
          turnoverRate: healthForm.turnoverRate ? parseFloat(healthForm.turnoverRate) : null,
          engagementScore: healthForm.engagementScore ? parseFloat(healthForm.engagementScore) : null,
          trend: healthForm.trend,
          dimensions: {},
        }),
      });
      if (res.ok) {
        setHealthDialogOpen(false);
        setHealthForm({ period: '', overallScore: '70', turnoverRate: '', engagementScore: '', trend: 'STABLE' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create health index:', error);
    }
  };

  const latestHealth = healthIndices[0];
  const highRiskCount = turnoverRisks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR 분석</h1>
          <p className="text-muted-foreground">데이터 기반 HR 의사결정을 지원합니다.</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">조직 건강도</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{latestHealth?.overallScore?.toFixed(0) || '-'}</div>
              <span className="text-sm text-muted-foreground">/ 100</span>
              {latestHealth?.trend === 'UP' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {latestHealth?.trend === 'DOWN' && <TrendingDown className="h-4 w-4 text-red-500" />}
            </div>
            <Progress value={latestHealth?.overallScore || 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이탈 위험 인원</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highRiskCount}</div>
            <p className="text-xs text-muted-foreground">HIGH/CRITICAL 레벨</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이직률</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestHealth?.turnoverRate?.toFixed(1) || '-'}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">참여도</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestHealth?.engagementScore?.toFixed(0) || '-'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="reports">경영 리포트 ({reports.length})</TabsTrigger>
          <TabsTrigger value="turnover">이탈 위험 ({turnoverRisks.length})</TabsTrigger>
          <TabsTrigger value="health">건강도 ({healthIndices.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-lg">최신 경영 리포트</CardTitle></CardHeader>
                <CardContent>
                  {reports.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{reports[0].reportType}</Badge>
                        <span className="font-medium">{reports[0].title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{reports[0].period}</p>
                      {reports[0].keyInsights.length > 0 && (
                        <ul className="text-sm space-y-1">
                          {reports[0].keyInsights.slice(0, 3).map((insight, i) => (
                            <li key={i} className="flex items-start gap-2"><span className="text-green-500">•</span>{insight}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : <p className="text-muted-foreground">리포트가 없습니다.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">이탈 위험 직원</CardTitle></CardHeader>
                <CardContent>
                  {turnoverRisks.length > 0 ? (
                    <div className="space-y-3">
                      {turnoverRisks.slice(0, 5).map(risk => (
                        <div key={risk.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{risk.employeeId}</span>
                            <Badge className={riskColors[risk.riskLevel]}>{risk.riskLevel}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={risk.riskScore} className="w-20" />
                            <span className="text-sm">{risk.riskScore.toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted-foreground">위험 직원이 없습니다.</p>}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setReportDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />리포트 생성</Button>
          </div>
          {reports.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground">경영 리포트가 없습니다.</CardContent></Card>
          ) : (
            reports.map(report => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{report.reportType}</Badge>
                        <h3 className="font-semibold">{report.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{report.period}</p>
                      {report.summary && <p className="text-sm">{report.summary}</p>}
                    </div>
                    <Button size="sm" variant="outline"><FileText className="h-4 w-4 mr-1" />보기</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Turnover Risk Tab */}
        <TabsContent value="turnover" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setRiskDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />분석 추가</Button>
          </div>
          {turnoverRisks.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground">이탈 위험 분석 데이터가 없습니다.</CardContent></Card>
          ) : (
            turnoverRisks.map(risk => (
              <Card key={risk.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">직원 ID: {risk.employeeId}</span>
                        <Badge className={riskColors[risk.riskLevel]}>{risk.riskLevel}</Badge>
                        <span className="text-sm text-muted-foreground">위험도: {risk.riskScore.toFixed(1)}점</span>
                      </div>
                      {risk.recommendations.length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium text-xs text-muted-foreground mb-1">권고사항:</p>
                          <ul className="space-y-1">{risk.recommendations.slice(0, 2).map((rec, i) => <li key={i}>• {rec}</li>)}</ul>
                        </div>
                      )}
                    </div>
                    <Progress value={risk.riskScore} className="w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Health Index Tab */}
        <TabsContent value="health" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setHealthDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />지수 추가</Button>
          </div>
          {healthIndices.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground">건강도 지수 데이터가 없습니다.</CardContent></Card>
          ) : (
            healthIndices.map(health => (
              <Card key={health.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Heart className="h-5 w-5 text-red-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{health.period}</span>
                          <Badge variant="outline">점수: {health.overallScore.toFixed(0)}</Badge>
                          {health.trend && <Badge className={health.trend === 'UP' ? 'bg-green-100 text-green-800' : health.trend === 'DOWN' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>{health.trend}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          이직률: {health.turnoverRate?.toFixed(1) || '-'}% | 참여도: {health.engagementScore?.toFixed(0) || '-'}
                        </p>
                      </div>
                    </div>
                    <Progress value={health.overallScore} className="w-32" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>경영 리포트 생성</DialogTitle><DialogDescription>CEO 전용 경영 리포트를 생성합니다.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>제목</Label><Input value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} placeholder="2024년 1분기 HR 리포트" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>타입</Label>
                <select className="w-full border rounded-md p-2" value={reportForm.reportType} onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })}>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div className="space-y-2"><Label>기간</Label><Input value={reportForm.period} onChange={(e) => setReportForm({ ...reportForm, period: e.target.value })} placeholder="2024-Q1" /></div>
            </div>
            <div className="space-y-2"><Label>요약</Label><Textarea value={reportForm.summary} onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })} placeholder="리포트 요약" /></div>
            <div className="space-y-2"><Label>핵심 인사이트 (줄 단위)</Label><Textarea value={reportForm.keyInsights} onChange={(e) => setReportForm({ ...reportForm, keyInsights: e.target.value })} placeholder="핵심 인사이트를 줄 단위로 입력" rows={4} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setReportDialogOpen(false)}>취소</Button><Button onClick={handleCreateReport}>생성</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Risk Analysis Dialog */}
      <Dialog open={riskDialogOpen} onOpenChange={setRiskDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>이탈 위험 분석 추가</DialogTitle><DialogDescription>직원 이탈 위험도를 분석합니다.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>직원 ID</Label><Input value={riskForm.employeeId} onChange={(e) => setRiskForm({ ...riskForm, employeeId: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>위험 점수 (0-100)</Label><Input type="number" value={riskForm.riskScore} onChange={(e) => setRiskForm({ ...riskForm, riskScore: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>위험 레벨</Label>
                <select className="w-full border rounded-md p-2" value={riskForm.riskLevel} onChange={(e) => setRiskForm({ ...riskForm, riskLevel: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            <div className="space-y-2"><Label>권고사항 (줄 단위)</Label><Textarea value={riskForm.recommendations} onChange={(e) => setRiskForm({ ...riskForm, recommendations: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setRiskDialogOpen(false)}>취소</Button><Button onClick={handleCreateRiskAnalysis}>추가</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Health Index Dialog */}
      <Dialog open={healthDialogOpen} onOpenChange={setHealthDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>조직 건강도 추가</DialogTitle><DialogDescription>조직 건강도 지수를 기록합니다.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>기간</Label><Input value={healthForm.period} onChange={(e) => setHealthForm({ ...healthForm, period: e.target.value })} placeholder="2024-Q1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>종합 점수 (0-100)</Label><Input type="number" value={healthForm.overallScore} onChange={(e) => setHealthForm({ ...healthForm, overallScore: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>추세</Label>
                <select className="w-full border rounded-md p-2" value={healthForm.trend} onChange={(e) => setHealthForm({ ...healthForm, trend: e.target.value })}>
                  <option value="UP">Up</option>
                  <option value="STABLE">Stable</option>
                  <option value="DOWN">Down</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>이직률 (%)</Label><Input type="number" value={healthForm.turnoverRate} onChange={(e) => setHealthForm({ ...healthForm, turnoverRate: e.target.value })} /></div>
              <div className="space-y-2"><Label>참여도 점수</Label><Input type="number" value={healthForm.engagementScore} onChange={(e) => setHealthForm({ ...healthForm, engagementScore: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setHealthDialogOpen(false)}>취소</Button><Button onClick={handleCreateHealthIndex}>추가</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
