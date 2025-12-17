'use client';

import React, { useState } from 'react';

interface Opportunity {
  id: string;
  type: string;
  title: string;
  description: string;
  organizationId: string;
  status: string;
  openings: number;
  filledCount: number;
  closingDate?: string;
  publishedAt?: string;
  _count?: { applications: number; matches: number };
}

// Mock data
const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    type: 'FULL_TIME',
    title: '시니어 백엔드 개발자',
    description: '핵심 서비스 개발팀에서 시니어 백엔드 개발자를 찾습니다.',
    organizationId: 'org1',
    status: 'OPEN',
    openings: 2,
    filledCount: 0,
    closingDate: '2025-01-15',
    publishedAt: '2024-12-10',
    _count: { applications: 5, matches: 12 }
  },
  {
    id: '2',
    type: 'PROJECT',
    title: 'AI 챗봇 구축 프로젝트',
    description: '고객 서비스 AI 챗봇 구축 프로젝트에 참여할 팀원을 모집합니다.',
    organizationId: 'org2',
    status: 'OPEN',
    openings: 3,
    filledCount: 1,
    closingDate: '2024-12-31',
    publishedAt: '2024-12-05',
    _count: { applications: 8, matches: 15 }
  },
  {
    id: '3',
    type: 'ROTATION',
    title: '해외 지사 순환 근무',
    description: '미국 지사에서 6개월간 순환 근무할 직원을 모집합니다.',
    organizationId: 'org1',
    status: 'DRAFT',
    openings: 1,
    filledCount: 0,
    _count: { applications: 0, matches: 0 }
  }
];

const typeLabels: Record<string, string> = {
  'FULL_TIME': '정규 포지션',
  'PROJECT': '프로젝트',
  'TASK_FORCE': 'TF',
  'PILOT': '파일럿',
  'SECONDMENT': '파견',
  'ROTATION': '순환 근무',
};

const typeColors: Record<string, string> = {
  'FULL_TIME': 'bg-blue-100 text-blue-800',
  'PROJECT': 'bg-green-100 text-green-800',
  'TASK_FORCE': 'bg-purple-100 text-purple-800',
  'PILOT': 'bg-yellow-100 text-yellow-800',
  'SECONDMENT': 'bg-orange-100 text-orange-800',
  'ROTATION': 'bg-teal-100 text-teal-800',
};

const statusLabels: Record<string, string> = {
  'DRAFT': '초안',
  'OPEN': '공개',
  'CLOSED': '마감',
  'FILLED': '채용완료',
  'CANCELLED': '취소',
};

const statusColors: Record<string, string> = {
  'DRAFT': 'bg-gray-100 text-gray-600',
  'OPEN': 'bg-green-100 text-green-700',
  'CLOSED': 'bg-red-100 text-red-700',
  'FILLED': 'bg-blue-100 text-blue-700',
  'CANCELLED': 'bg-gray-100 text-gray-500',
};

export default function MarketplaceAdminPage() {
  const [opportunities] = useState<Opportunity[]>(mockOpportunities);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredOpportunities = selectedType
    ? opportunities.filter(o => o.type === selectedType)
    : opportunities;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내부 마켓플레이스 관리</h1>
        <p className="text-gray-600 mt-1">내부 공모 및 프로젝트 기회를 관리합니다</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">전체 공모</div>
          <div className="text-2xl font-bold text-gray-900">{opportunities.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">공개 중</div>
          <div className="text-2xl font-bold text-green-600">
            {opportunities.filter(o => o.status === 'OPEN').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">총 지원자</div>
          <div className="text-2xl font-bold text-blue-600">
            {opportunities.reduce((sum, o) => sum + (o._count?.applications || 0), 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">매칭된 후보</div>
          <div className="text-2xl font-bold text-purple-600">
            {opportunities.reduce((sum, o) => sum + (o._count?.matches || 0), 0)}
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              !selectedType ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {Object.entries(typeLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedType === key ? 'bg-gray-800 text-white' : `${typeColors[key]} hover:opacity-80`
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + 새 공모 등록
        </button>
      </div>

      {/* Opportunities List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">공모</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">지원/TO</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">매칭</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">마감일</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOpportunities.map(opp => (
              <tr key={opp.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{opp.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{opp.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${typeColors[opp.type]}`}>
                    {typeLabels[opp.type]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[opp.status]}`}>
                    {statusLabels[opp.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium">{opp._count?.applications || 0}</span>
                  <span className="text-gray-400"> / {opp.openings}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-purple-600">{opp._count?.matches || 0}명</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {opp.closingDate ? new Date(opp.closingDate).toLocaleDateString('ko-KR') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button className="text-blue-600 hover:underline mr-3">상세</button>
                  {opp.status === 'DRAFT' && (
                    <button className="text-green-600 hover:underline mr-3">공개</button>
                  )}
                  {opp.status === 'OPEN' && (
                    <button className="text-orange-600 hover:underline">매칭 실행</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">새 공모 등록</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="공모 제목" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows={4} placeholder="상세 설명" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">모집 인원</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2" defaultValue={1} min={1} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">필요 스킬</label>
                <p className="text-xs text-gray-500 mb-2">스킬을 선택하고 필요 레벨을 지정하세요</p>
                <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500">
                  + 스킬 추가
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                취소
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                초안 저장
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                바로 공개
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
