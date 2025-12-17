'use client';

import React, { useState } from 'react';

interface RiskIndicator {
  id: string;
  type: string;
  level: string;
  score: number;
  affectedCount: number;
  description: string;
  suggestedActions: string[];
  detectedAt: string;
}

interface PromotionRecommendation {
  id: string;
  employeeId: string;
  employeeName: string;
  recommendation: string;
  confidenceScore: number;
  factors: { performance: number; skills: number; leadership: number; tenure: number };
  status: string;
}

interface AttritionSignal {
  id: string;
  employeeId: string;
  employeeName: string;
  signalType: string;
  strength: number;
  trend: string;
}

// Mock data
const mockRisks: RiskIndicator[] = [
  {
    id: '1',
    type: 'ATTRITION_CLUSTER',
    level: 'HIGH',
    score: 75,
    affectedCount: 8,
    description: '개발팀 내 8명의 직원에게서 이탈 신호가 감지되었습니다.',
    suggestedActions: ['1:1 면담 실시', '보상 검토', '경력 개발 기회 제공'],
    detectedAt: '2024-12-15'
  },
  {
    id: '2',
    type: 'OVERWORK',
    level: 'MEDIUM',
    score: 55,
    affectedCount: 12,
    description: '마케팅팀의 과도한 초과근무가 감지되었습니다.',
    suggestedActions: ['업무 재분배', '인력 충원 검토'],
    detectedAt: '2024-12-14'
  }
];

const mockPromotions: PromotionRecommendation[] = [
  {
    id: 'p1',
    employeeId: 'emp001',
    employeeName: '김개발',
    recommendation: 'STRONG_RECOMMEND',
    confidenceScore: 85,
    factors: { performance: 92, skills: 88, leadership: 75, tenure: 85 },
    status: 'PENDING'
  },
  {
    id: 'p2',
    employeeId: 'emp002',
    employeeName: '이기획',
    recommendation: 'RECOMMEND',
    confidenceScore: 72,
    factors: { performance: 78, skills: 70, leadership: 68, tenure: 72 },
    status: 'PENDING'
  }
];

const mockSignals: AttritionSignal[] = [
  { id: 's1', employeeId: 'emp005', employeeName: '박직원', signalType: 'PERFORMANCE_DECLINE', strength: 78, trend: 'INCREASING' },
  { id: 's2', employeeId: 'emp008', employeeName: '최직원', signalType: 'OVERTIME_EXCESS', strength: 65, trend: 'STABLE' },
  { id: 's3', employeeId: 'emp012', employeeName: '정직원', signalType: 'CAREER_STALL', strength: 55, trend: 'STABLE' },
];

const riskTypeLabels: Record<string, string> = {
  'ATTRITION_CLUSTER': '집단 이탈 위험',
  'OVERWORK': '과다 업무',
  'PERFORMANCE_DECLINE': '성과 하락',
  'CONFLICT': '갈등 발생',
};

const signalTypeLabels: Record<string, string> = {
  'ENGAGEMENT_DROP': '참여도 하락',
  'PERFORMANCE_DECLINE': '성과 하락',
  'ABSENCE_PATTERN': '결근 패턴',
  'OVERTIME_EXCESS': '과도한 초과근무',
  'CAREER_STALL': '경력 정체',
  'COMPENSATION_GAP': '보상 격차',
};

const recommendationLabels: Record<string, { label: string; color: string }> = {
  'STRONG_RECOMMEND': { label: '강력 추천', color: 'bg-green-500 text-white' },
  'RECOMMEND': { label: '추천', color: 'bg-blue-500 text-white' },
  'HOLD': { label: '보류', color: 'bg-yellow-500 text-white' },
  'NOT_READY': { label: '미준비', color: 'bg-gray-500 text-white' },
};

const levelColors: Record<string, string> = {
  'CRITICAL': 'border-red-500 bg-red-50',
  'HIGH': 'border-orange-500 bg-orange-50',
  'MEDIUM': 'border-yellow-500 bg-yellow-50',
  'LOW': 'border-green-500 bg-green-50',
};

export default function AIInsightsPage() {
  const [activeTab, setActiveTab] = useState<'risks' | 'promotions' | 'attrition'>('risks');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI 의사결정 지원</h1>
        <p className="text-gray-600 mt-1">AI 분석을 통한 HR 인사이트를 확인하세요</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="text-red-100 text-sm">조직 리스크</div>
          <div className="text-3xl font-bold">{mockRisks.length}</div>
          <div className="text-red-200 text-xs mt-1">주의 필요</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-green-100 text-sm">승진 추천</div>
          <div className="text-3xl font-bold">{mockPromotions.length}</div>
          <div className="text-green-200 text-xs mt-1">검토 대기</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="text-orange-100 text-sm">이탈 시그널</div>
          <div className="text-3xl font-bold">{mockSignals.length}</div>
          <div className="text-orange-200 text-xs mt-1">모니터링 중</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-blue-100 text-sm">AI 신뢰도</div>
          <div className="text-3xl font-bold">87%</div>
          <div className="text-blue-200 text-xs mt-1">평균 정확도</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'risks', label: '조직 리스크', count: mockRisks.length },
            { key: 'promotions', label: '승진 추천', count: mockPromotions.length },
            { key: 'attrition', label: '이탈 시그널', count: mockSignals.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'risks' && (
        <div className="space-y-4">
          {mockRisks.map(risk => (
            <div key={risk.id} className={`border-l-4 rounded-lg shadow p-4 ${levelColors[risk.level]}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{riskTypeLabels[risk.type]}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      risk.level === 'CRITICAL' ? 'bg-red-500 text-white' :
                      risk.level === 'HIGH' ? 'bg-orange-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {risk.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{risk.score}점</div>
                  <div className="text-xs text-gray-500">리스크 점수</div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-50 rounded p-3 mt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">권장 조치</div>
                <ul className="space-y-1">
                  {risk.suggestedActions.map((action, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                        {i + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'promotions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">직원</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">추천</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신뢰도</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">요인 분석</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockPromotions.map(promo => (
                <tr key={promo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{promo.employeeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${recommendationLabels[promo.recommendation].color}`}>
                      {recommendationLabels[promo.recommendation].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${promo.confidenceScore >= 75 ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${promo.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-sm">{promo.confidenceScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {Object.entries(promo.factors).map(([key, value]) => (
                        <span key={key} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {key === 'performance' ? '성과' : key === 'skills' ? '역량' : key === 'leadership' ? '리더십' : '재직'}: {value}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-green-600 hover:underline text-sm mr-3">승인</button>
                    <button className="text-gray-600 hover:underline text-sm">상세</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'attrition' && (
        <div className="space-y-3">
          {mockSignals.map(signal => (
            <div key={signal.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                  signal.strength >= 70 ? 'bg-red-500' : signal.strength >= 50 ? 'bg-orange-500' : 'bg-yellow-500'
                }`}>
                  {signal.strength}
                </div>
                <div>
                  <div className="font-medium">{signal.employeeName}</div>
                  <div className="text-sm text-gray-500">{signalTypeLabels[signal.signalType]}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs ${
                  signal.trend === 'INCREASING' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {signal.trend === 'INCREASING' ? '↑ 상승' : '→ 유지'}
                </span>
                <button className="text-blue-600 hover:underline text-sm">조치</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
