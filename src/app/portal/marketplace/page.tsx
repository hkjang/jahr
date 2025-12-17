'use client';

import React, { useState } from 'react';

interface Opportunity {
  id: string;
  type: string;
  title: string;
  description: string;
  organization: string;
  location?: string;
  duration?: string;
  openings: number;
  closingDate?: string;
  requiredSkills: Array<{ name: string; level: string }>;
  matchScore?: number;
}

// Mock data
const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    type: 'PROJECT',
    title: 'AI 챗봇 구축 프로젝트',
    description: '고객 서비스 AI 챗봇 구축 프로젝트에 참여할 팀원을 모집합니다. Python과 자연어처리 경험이 있으신 분을 찾습니다.',
    organization: '디지털혁신팀',
    duration: '6개월',
    openings: 2,
    closingDate: '2024-12-31',
    requiredSkills: [
      { name: 'Python', level: 'ADVANCED' },
      { name: 'NLP', level: 'INTERMEDIATE' }
    ],
    matchScore: 85
  },
  {
    id: '2',
    type: 'FULL_TIME',
    title: '시니어 프론트엔드 개발자',
    description: '핵심 서비스팀에서 시니어 프론트엔드 개발자를 찾습니다. React와 TypeScript 경험 필수.',
    organization: '핵심서비스개발팀',
    openings: 1,
    closingDate: '2025-01-15',
    requiredSkills: [
      { name: 'React', level: 'ADVANCED' },
      { name: 'TypeScript', level: 'ADVANCED' }
    ],
    matchScore: 92
  },
  {
    id: '3',
    type: 'ROTATION',
    title: '해외 지사 순환 근무 (미국)',
    description: '미국 지사에서 6개월간 순환 근무할 직원을 모집합니다. 영어 회화 가능자 우대.',
    organization: '글로벌사업부',
    location: '미국 샌프란시스코',
    duration: '6개월',
    openings: 1,
    closingDate: '2025-01-31',
    requiredSkills: [
      { name: '영어', level: 'ADVANCED' }
    ],
    matchScore: 70
  }
];

const mockMyApplications = [
  { id: 'app1', opportunityTitle: 'AI 챗봇 구축 프로젝트', status: 'UNDER_REVIEW', appliedAt: '2024-12-10' }
];

const typeLabels: Record<string, string> = {
  'FULL_TIME': '정규 포지션',
  'PROJECT': '프로젝트',
  'TASK_FORCE': 'TF',
  'ROTATION': '순환 근무',
  'SECONDMENT': '파견',
};

const typeColors: Record<string, string> = {
  'FULL_TIME': 'bg-blue-500',
  'PROJECT': 'bg-green-500',
  'TASK_FORCE': 'bg-purple-500',
  'ROTATION': 'bg-teal-500',
  'SECONDMENT': 'bg-orange-500',
};

const levelLabels: Record<string, string> = {
  'NOVICE': '초급',
  'BEGINNER': '입문',
  'INTERMEDIATE': '중급',
  'ADVANCED': '고급',
  'EXPERT': '전문가',
};

const statusLabels: Record<string, string> = {
  'APPLIED': '지원 완료',
  'UNDER_REVIEW': '검토 중',
  'INTERVIEW': '면접 예정',
  'SELECTED': '선발됨',
  'NOT_SELECTED': '미선발',
  'WITHDRAWN': '지원 철회',
};

export default function MarketplacePortalPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'matched' | 'applications'>('browse');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const matchedOpportunities = mockOpportunities.filter(o => o.matchScore && o.matchScore >= 70);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내부 마켓플레이스</h1>
        <p className="text-gray-600 mt-1">새로운 기회를 찾아보고 지원해보세요</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'browse'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            전체 기회
          </button>
          <button
            onClick={() => setActiveTab('matched')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'matched'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            나에게 맞는 기회
            {matchedOpportunities.length > 0 && (
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                {matchedOpportunities.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            내 지원 현황
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'applications' ? (
        <div className="space-y-4">
          {mockMyApplications.length > 0 ? (
            mockMyApplications.map(app => (
              <div key={app.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{app.opportunityTitle}</div>
                    <div className="text-sm text-gray-500">
                      지원일: {new Date(app.appliedAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                    {statusLabels[app.status]}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p>아직 지원한 기회가 없습니다.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(activeTab === 'matched' ? matchedOpportunities : mockOpportunities).map(opp => (
            <div
              key={opp.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedOpp(opp)}
            >
              <div className={`h-2 rounded-t-lg ${typeColors[opp.type]}`} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs text-white ${typeColors[opp.type]}`}>
                      {typeLabels[opp.type]}
                    </span>
                    <h3 className="font-semibold text-gray-900 mt-1">{opp.title}</h3>
                  </div>
                  {opp.matchScore && (
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        opp.matchScore >= 80 ? 'text-green-600' : 'text-orange-500'
                      }`}>
                        {opp.matchScore}%
                      </div>
                      <div className="text-xs text-gray-400">매칭</div>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{opp.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {opp.requiredSkills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {skill.name} ({levelLabels[skill.level]})
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{opp.organization}</span>
                  {opp.closingDate && (
                    <span>마감: {new Date(opp.closingDate).toLocaleDateString('ko-KR')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className={`h-3 rounded-t-xl ${typeColors[selectedOpp.type]}`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs text-white ${typeColors[selectedOpp.type]}`}>
                    {typeLabels[selectedOpp.type]}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mt-2">{selectedOpp.title}</h2>
                  <p className="text-gray-500">{selectedOpp.organization}</p>
                </div>
                {selectedOpp.matchScore && (
                  <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedOpp.matchScore}%</div>
                    <div className="text-xs text-green-600">매칭률</div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">상세 설명</h4>
                  <p className="text-gray-600">{selectedOpp.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedOpp.location && (
                    <div>
                      <span className="text-sm text-gray-500">위치</span>
                      <p className="font-medium">{selectedOpp.location}</p>
                    </div>
                  )}
                  {selectedOpp.duration && (
                    <div>
                      <span className="text-sm text-gray-500">기간</span>
                      <p className="font-medium">{selectedOpp.duration}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-500">모집 인원</span>
                    <p className="font-medium">{selectedOpp.openings}명</p>
                  </div>
                  {selectedOpp.closingDate && (
                    <div>
                      <span className="text-sm text-gray-500">마감일</span>
                      <p className="font-medium">{new Date(selectedOpp.closingDate).toLocaleDateString('ko-KR')}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">필요 역량</h4>
                  <div className="space-y-2">
                    {selectedOpp.requiredSkills.map((skill, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{skill.name}</span>
                        <span className="text-sm text-gray-500">{levelLabels[skill.level]} 이상</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setSelectedOpp(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  닫기
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  지원하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
