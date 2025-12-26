'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface Application {
  id: string;
  postingId: string;
  posting: {
    id: string;
    title: string;
  };
  applicant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  status: string;
  currentStage: string;
  appliedAt: string;
  _count: {
    evaluations: number;
  };
}

const stageOrder = ['DOCUMENT', 'FIRST_INTERVIEW', 'SECOND_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'ONBOARDING'];

const stageLabels: Record<string, string> = {
  DOCUMENT: '서류',
  FIRST_INTERVIEW: '1차 면접',
  SECOND_INTERVIEW: '2차 면접',
  FINAL_INTERVIEW: '최종 면접',
  OFFER: '합격',
  ONBOARDING: '입사',
};

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  PASSED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  SUBMITTED: '제출됨',
  IN_REVIEW: '검토중',
  PASSED: '합격',
  REJECTED: '불합격',
  WITHDRAWN: '철회',
};

export default function RecruitmentPipelinePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, [selectedStage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const url = selectedStage !== 'all'
        ? `/api/applications?stage=${selectedStage}`
        : '/api/applications';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (id: string, newStage: string, result: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStage: newStage,
          stageResult: result,
          status: result === 'PASSED' ? 'IN_REVIEW' : (result === 'FAILED' ? 'REJECTED' : 'IN_REVIEW'),
        }),
      });

      if (response.ok) {
        fetchApplications();
      }
    } catch (error) {
      console.error('Failed to update stage:', error);
    }
  };

  // 단계별 지원자 수
  const stageCounts = stageOrder.reduce((acc, stage) => {
    acc[stage] = applications.filter(a => a.currentStage === stage).length;
    return acc;
  }, {} as Record<string, number>);

  // 단계별 그룹화
  const byStage = stageOrder.reduce((acc, stage) => {
    acc[stage] = applications.filter(a => a.currentStage === stage);
    return acc;
  }, {} as Record<string, Application[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">채용 파이프라인</h1>
          <p className="text-gray-400 mt-1">지원자의 채용 단계를 관리합니다.</p>
        </div>
      </div>

      {/* Stage Overview */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {stageOrder.map((stage, index) => (
          <div key={stage} className="flex items-center">
            <Card className={`bg-gray-800 border-gray-700 min-w-[120px] cursor-pointer transition-colors ${selectedStage === stage ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedStage(selectedStage === stage ? 'all' : stage)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{stageCounts[stage]}</div>
                <div className="text-xs text-gray-400">{stageLabels[stage]}</div>
              </CardContent>
            </Card>
            {index < stageOrder.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="전체 단계" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 단계</SelectItem>
            {stageOrder.map(stage => (
              <SelectItem key={stage} value={stage}>{stageLabels[stage]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Applications by Stage */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">로딩 중...</div>
      ) : applications.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-8 text-gray-400">
            지원자가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {(selectedStage === 'all' ? stageOrder : [selectedStage]).map(stage => {
            const stageApps = byStage[stage] || [];
            if (stageApps.length === 0) return null;

            return (
              <Card key={stage} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <span>{stageLabels[stage]}</span>
                    <Badge variant="secondary">{stageApps.length}명</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stageApps.map(app => {
                      const currentIndex = stageOrder.indexOf(app.currentStage);
                      const nextStage = stageOrder[currentIndex + 1];

                      return (
                        <div
                          key={app.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{app.applicant.name}</p>
                              <p className="text-sm text-muted-foreground">{app.applicant.email}</p>
                              <p className="text-xs text-muted-foreground">{app.posting.title}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <Badge className={statusColors[app.status]}>
                              {statusLabels[app.status]}
                            </Badge>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MessageSquare className="h-4 w-4" />
                              {app._count.evaluations}
                            </div>

                            <div className="flex gap-1">
                              {nextStage && (
                                <Button
                                  size="sm"
                                  onClick={() => updateStage(app.id, nextStage, 'PASSED')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  합격
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStage(app.id, app.currentStage, 'FAILED')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                불합격
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
