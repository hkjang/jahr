'use client';

import React, { useState } from 'react';

// Types
interface OnboardingTask {
  id: string;
  category: string;
  name: string;
  description?: string;
  status: string;
  dueDate?: string;
  assigneeName?: string;
  completedAt?: string;
}

interface OnboardingChecklist {
  id: string;
  employeeId: string;
  status: string;
  startDate: string;
  targetEndDate?: string;
  completedDate?: string;
  tasks: OnboardingTask[];
  template?: { id: string; name: string };
  mentorAssignment?: {
    id: string;
    mentorId: string;
    matchScore?: number;
    status: string;
  };
}

interface OffboardingChecklist {
  id: string;
  employeeId: string;
  status: string;
  lastWorkingDate: string;
  reason?: string;
  tasks: { id: string; name: string; status: string }[];
  knowledgeTransfers: { id: string; title: string; status: string }[];
  exitInterview?: { id: string; scheduledDate?: string; conductedDate?: string };
}

// Mock data for demo
const mockOnboardingData: OnboardingChecklist[] = [
  {
    id: '1',
    employeeId: 'emp001',
    status: 'IN_PROGRESS',
    startDate: '2024-12-15',
    targetEndDate: '2025-01-15',
    tasks: [
      { id: 't1', category: 'EQUIPMENT', name: '노트북 지급', status: 'COMPLETED', completedAt: '2024-12-16' },
      { id: 't2', category: 'ACCOUNT', name: '이메일 계정 생성', status: 'COMPLETED', completedAt: '2024-12-15' },
      { id: 't3', category: 'SECURITY', name: '보안 교육 이수', status: 'IN_PROGRESS', dueDate: '2024-12-20' },
      { id: 't4', category: 'TRAINING', name: '신입사원 교육', status: 'NOT_STARTED', dueDate: '2024-12-22' },
    ],
    template: { id: 'tpl1', name: '일반 온보딩 템플릿' },
    mentorAssignment: { id: 'ma1', mentorId: 'emp010', matchScore: 85, status: 'ACTIVE' }
  }
];

const mockOffboardingData: OffboardingChecklist[] = [
  {
    id: '2',
    employeeId: 'emp020',
    status: 'IN_PROGRESS',
    lastWorkingDate: '2024-12-31',
    reason: '개인 사유',
    tasks: [
      { id: 'ot1', name: '장비 반납', status: 'NOT_STARTED' },
      { id: 'ot2', name: '업무 인수인계', status: 'IN_PROGRESS' },
      { id: 'ot3', name: '계정 접근 권한 해제', status: 'NOT_STARTED' },
    ],
    knowledgeTransfers: [
      { id: 'kt1', title: '프로젝트 A 인수인계 문서', status: 'DRAFT' }
    ],
    exitInterview: { id: 'ei1', scheduledDate: '2024-12-27' }
  }
];

const statusColors: Record<string, string> = {
  'NOT_STARTED': 'bg-gray-100 text-gray-800',
  'IN_PROGRESS': 'bg-blue-100 text-blue-800',
  'COMPLETED': 'bg-green-100 text-green-800',
  'BLOCKED': 'bg-red-100 text-red-800',
  'DRAFT': 'bg-yellow-100 text-yellow-800',
  'PENDING_APPROVAL': 'bg-orange-100 text-orange-800',
};

const statusLabels: Record<string, string> = {
  'NOT_STARTED': '시작 전',
  'IN_PROGRESS': '진행 중',
  'COMPLETED': '완료',
  'BLOCKED': '지연',
  'DRAFT': '초안',
  'PENDING_APPROVAL': '승인 대기',
};

const categoryLabels: Record<string, string> = {
  'EQUIPMENT': '장비',
  'SECURITY': '보안',
  'ACCOUNT': '계정',
  'TRAINING': '교육',
  'DOCUMENTATION': '문서',
  'INTRODUCTION': '인사',
  'EQUIPMENT_RETURN': '장비 반납',
  'ACCESS_REVOKE': '권한 해제',
  'HANDOVER': '인수인계',
};

export default function LifecyclePage() {
  const [activeTab, setActiveTab] = useState<'onboarding' | 'offboarding'>('onboarding');
  const [onboardingData] = useState<OnboardingChecklist[]>(mockOnboardingData);
  const [offboardingData] = useState<OffboardingChecklist[]>(mockOffboardingData);

  const getProgressPercentage = (tasks: { status: string }[]) => {
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">인재 라이프사이클 관리</h1>
        <p className="text-gray-600 mt-1">온보딩 및 오프보딩 프로세스를 관리합니다</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">진행 중 온보딩</div>
          <div className="text-2xl font-bold text-blue-600">{onboardingData.filter(c => c.status === 'IN_PROGRESS').length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">완료된 온보딩</div>
          <div className="text-2xl font-bold text-green-600">{onboardingData.filter(c => c.status === 'COMPLETED').length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">진행 중 오프보딩</div>
          <div className="text-2xl font-bold text-orange-600">{offboardingData.filter(c => c.status === 'IN_PROGRESS').length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">멘토 매칭</div>
          <div className="text-2xl font-bold text-purple-600">{onboardingData.filter(c => c.mentorAssignment).length}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'onboarding'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            온보딩 관리
          </button>
          <button
            onClick={() => setActiveTab('offboarding')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'offboarding'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            오프보딩 관리
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'onboarding' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">온보딩 체크리스트</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              + 신규 온보딩 생성
            </button>
          </div>

          {onboardingData.map(checklist => (
            <div key={checklist.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">직원 ID: {checklist.employeeId}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[checklist.status]}`}>
                      {statusLabels[checklist.status]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    시작일: {new Date(checklist.startDate).toLocaleDateString('ko-KR')}
                    {checklist.targetEndDate && ` | 목표 완료일: ${new Date(checklist.targetEndDate).toLocaleDateString('ko-KR')}`}
                  </div>
                  {checklist.template && (
                    <div className="text-sm text-gray-400 mt-1">템플릿: {checklist.template.name}</div>
                  )}
                </div>
                {checklist.mentorAssignment && (
                  <div className="text-right">
                    <div className="text-sm text-purple-600 font-medium">멘토 배정됨</div>
                    <div className="text-xs text-gray-500">매칭 점수: {checklist.mentorAssignment.matchScore}%</div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>진행률</span>
                  <span>{getProgressPercentage(checklist.tasks)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${getProgressPercentage(checklist.tasks)}%` }}
                  />
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {checklist.tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {categoryLabels[task.category] || task.category}
                      </span>
                      <span className={task.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}>
                        {task.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.dueDate && (
                        <span className="text-xs text-gray-400">
                          마감: {new Date(task.dueDate).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[task.status]}`}>
                        {statusLabels[task.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">오프보딩 체크리스트</h2>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700">
              + 신규 오프보딩 생성
            </button>
          </div>

          {offboardingData.map(checklist => (
            <div key={checklist.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">직원 ID: {checklist.employeeId}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[checklist.status]}`}>
                      {statusLabels[checklist.status]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    마지막 근무일: {new Date(checklist.lastWorkingDate).toLocaleDateString('ko-KR')}
                    {checklist.reason && ` | 사유: ${checklist.reason}`}
                  </div>
                </div>
                <div className="text-right">
                  {checklist.exitInterview && (
                    <div className="text-sm">
                      <span className="text-gray-500">퇴직 인터뷰: </span>
                      <span className={checklist.exitInterview.conductedDate ? 'text-green-600' : 'text-orange-600'}>
                        {checklist.exitInterview.conductedDate ? '완료' : 
                          checklist.exitInterview.scheduledDate ? new Date(checklist.exitInterview.scheduledDate).toLocaleDateString('ko-KR') : '미예정'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>진행률</span>
                  <span>{getProgressPercentage(checklist.tasks)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${getProgressPercentage(checklist.tasks)}%` }}
                  />
                </div>
              </div>

              {/* Tasks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">태스크</h4>
                  <div className="space-y-1">
                    {checklist.tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between py-1">
                        <span className="text-sm">{task.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[task.status]}`}>
                          {statusLabels[task.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">인수인계 문서</h4>
                  {checklist.knowledgeTransfers.length > 0 ? (
                    <div className="space-y-1">
                      {checklist.knowledgeTransfers.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between py-1">
                          <span className="text-sm">{doc.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[doc.status]}`}>
                            {statusLabels[doc.status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">인수인계 문서 없음</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
