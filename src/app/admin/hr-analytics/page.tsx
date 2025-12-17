'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Heart,
  FileText,
  Target
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [reportsRes, riskRes, healthRes] = await Promise.all([
        fetch('/api/executive-reports'),
        fetch('/api/turnover-risk?level=HIGH'),
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

  // 통계
  const latestHealth = healthIndices[0];
  const highRiskCount = turnoverRisks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR 분석</h1>
          <p className="text-muted-foreground">데이터 기반 HR 의사결정을 지원합니다.</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          리포트 생성
        </Button>
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
              <div className="text-2xl font-bold">
                {latestHealth?.overallScore?.toFixed(0) || '-'}
              </div>
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
            <div className="text-2xl font-bold">
              {latestHealth?.turnoverRate?.toFixed(1) || '-'}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">참여도</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestHealth?.engagementScore?.toFixed(0) || '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="reports">경영 리포트 ({reports.length})</TabsTrigger>
          <TabsTrigger value="turnover">이탈 위험 ({turnoverRisks.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Latest Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">최신 경영 리포트</CardTitle>
                </CardHeader>
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
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-500">•</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">리포트가 없습니다.</p>
                  )}
                </CardContent>
              </Card>

              {/* High Risk Employees */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">이탈 위험 직원</CardTitle>
                </CardHeader>
                <CardContent>
                  {turnoverRisks.length > 0 ? (
                    <div className="space-y-3">
                      {turnoverRisks.slice(0, 5).map(risk => (
                        <div key={risk.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{risk.employeeId}</span>
                            <Badge className={riskColors[risk.riskLevel]}>
                              {risk.riskLevel}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={risk.riskScore} className="w-20" />
                            <span className="text-sm">{risk.riskScore.toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">위험 직원이 없습니다.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                경영 리포트가 없습니다.
              </CardContent>
            </Card>
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
                      {report.summary && (
                        <p className="text-sm">{report.summary}</p>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-1" />
                      보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Turnover Risk Tab */}
        <TabsContent value="turnover" className="space-y-4">
          {turnoverRisks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                이탈 위험 분석 데이터가 없습니다.
              </CardContent>
            </Card>
          ) : (
            turnoverRisks.map(risk => (
              <Card key={risk.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">직원 ID: {risk.employeeId}</span>
                        <Badge className={riskColors[risk.riskLevel]}>
                          {risk.riskLevel}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          위험도: {risk.riskScore.toFixed(1)}점
                        </span>
                      </div>
                      {risk.recommendations.length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium text-xs text-muted-foreground mb-1">권고사항:</p>
                          <ul className="space-y-1">
                            {risk.recommendations.slice(0, 2).map((rec, i) => (
                              <li key={i}>• {rec}</li>
                            ))}
                          </ul>
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
      </Tabs>
    </div>
  );
}
