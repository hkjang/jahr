'use client';

import React, { useState } from 'react';

interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: string;
  targetLevel?: string;
  yearsExperience?: number;
  endorsementCount: number;
}

interface SkillGap {
  skillName: string;
  requiredLevel: string;
  currentLevel: string;
  gap: number;
  recommendation?: string;
}

// Mock data
const mockMySkills: Skill[] = [
  { id: '1', name: 'JavaScript', category: 'TECHNICAL', currentLevel: 'ADVANCED', targetLevel: 'EXPERT', yearsExperience: 4, endorsementCount: 8 },
  { id: '2', name: 'React', category: 'TECHNICAL', currentLevel: 'ADVANCED', yearsExperience: 3, endorsementCount: 5 },
  { id: '3', name: 'TypeScript', category: 'TECHNICAL', currentLevel: 'INTERMEDIATE', targetLevel: 'ADVANCED', yearsExperience: 2, endorsementCount: 3 },
  { id: '4', name: 'Node.js', category: 'TECHNICAL', currentLevel: 'INTERMEDIATE', yearsExperience: 2, endorsementCount: 4 },
  { id: '5', name: '커뮤니케이션', category: 'SOFT_SKILL', currentLevel: 'ADVANCED', endorsementCount: 12 },
  { id: '6', name: '프로젝트 관리', category: 'BUSINESS', currentLevel: 'BEGINNER', targetLevel: 'INTERMEDIATE', endorsementCount: 1 },
];

const mockSkillGaps: SkillGap[] = [
  { skillName: 'AWS', requiredLevel: 'INTERMEDIATE', currentLevel: 'NOVICE', gap: 2, recommendation: 'AWS 기초 과정 수강 권장' },
  { skillName: 'Docker', requiredLevel: 'INTERMEDIATE', currentLevel: 'BEGINNER', gap: 1, recommendation: 'Docker 실습 프로젝트 참여 권장' },
];

const levelLabels: Record<string, string> = {
  'NOVICE': '초급',
  'BEGINNER': '입문',
  'INTERMEDIATE': '중급',
  'ADVANCED': '고급',
  'EXPERT': '전문가',
};

const levelColors: Record<string, string> = {
  'NOVICE': 'bg-gray-200 text-gray-700',
  'BEGINNER': 'bg-blue-100 text-blue-700',
  'INTERMEDIATE': 'bg-green-100 text-green-700',
  'ADVANCED': 'bg-purple-100 text-purple-700',
  'EXPERT': 'bg-orange-100 text-orange-700',
};

const categoryIcons: Record<string, string> = {
  'TECHNICAL': '💻',
  'SOFT_SKILL': '🤝',
  'BUSINESS': '📊',
  'LEADERSHIP': '👔',
  'DOMAIN': '🎯',
  'CERTIFICATION': '📜',
};

const levelToWidth: Record<string, number> = {
  'NOVICE': 20,
  'BEGINNER': 40,
  'INTERMEDIATE': 60,
  'ADVANCED': 80,
  'EXPERT': 100,
};

export default function SkillsPortalPage() {
  const [activeTab, setActiveTab] = useState<'my-skills' | 'gap-analysis' | 'development'>('my-skills');
  const [showAddModal, setShowAddModal] = useState(false);

  const groupedSkills = mockMySkills.reduce((acc, skill) => {
    const category = skill.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내 스킬 관리</h1>
        <p className="text-gray-600 mt-1">보유 역량을 관리하고 성장 계획을 세워보세요</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-blue-100 text-sm">보유 스킬</div>
          <div className="text-3xl font-bold">{mockMySkills.length}개</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-purple-100 text-sm">평균 레벨</div>
          <div className="text-3xl font-bold">3.2</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-green-100 text-sm">받은 추천</div>
          <div className="text-3xl font-bold">{mockMySkills.reduce((sum, s) => sum + s.endorsementCount, 0)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'my-skills', label: '내 스킬' },
            { key: 'gap-analysis', label: '스킬 갭 분석' },
            { key: 'development', label: '성장 계획' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'my-skills' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              + 스킬 추가
            </button>
          </div>

          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>{categoryIcons[category]}</span>
                {category === 'TECHNICAL' ? '기술 역량' : 
                 category === 'SOFT_SKILL' ? '소프트 스킬' : 
                 category === 'BUSINESS' ? '업무 역량' : category}
              </h3>
              <div className="space-y-4">
                {skills.map(skill => (
                  <div key={skill.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{skill.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${levelColors[skill.currentLevel]}`}>
                          {levelLabels[skill.currentLevel]}
                        </span>
                        {skill.endorsementCount > 0 && (
                          <span className="text-xs text-gray-400">
                            👍 {skill.endorsementCount}
                          </span>
                        )}
                      </div>
                      {skill.yearsExperience && (
                        <span className="text-sm text-gray-500">{skill.yearsExperience}년 경력</span>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${levelToWidth[skill.currentLevel]}%` }}
                        />
                      </div>
                      {skill.targetLevel && (
                        <div 
                          className="absolute top-0 w-0.5 h-4 bg-orange-500 -mt-1"
                          style={{ left: `${levelToWidth[skill.targetLevel]}%` }}
                          title={`목표: ${levelLabels[skill.targetLevel]}`}
                        />
                      )}
                    </div>
                    
                    {skill.targetLevel && (
                      <div className="mt-2 text-xs text-orange-600">
                        🎯 목표: {levelLabels[skill.targetLevel]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'gap-analysis' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">현재 직무 대비 스킬 갭</h3>
            {mockSkillGaps.length > 0 ? (
              <div className="space-y-4">
                {mockSkillGaps.map((gap, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{gap.skillName}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        gap.gap >= 2 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {gap.gap} 레벨 부족
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span>현재: {levelLabels[gap.currentLevel] || gap.currentLevel}</span>
                      <span>→</span>
                      <span>필요: {levelLabels[gap.requiredLevel]}</span>
                    </div>
                    {gap.recommendation && (
                      <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        💡 {gap.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p>현재 직무에 필요한 모든 스킬을 보유하고 있습니다!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'development' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">추천 학습 경로</h3>
            <div className="space-y-3">
              {[
                { course: 'AWS Solutions Architect 기초', type: '온라인 과정', duration: '20시간', skill: 'AWS' },
                { course: 'Docker 실습 워크샵', type: '오프라인 교육', duration: '8시간', skill: 'Docker' },
                { course: '리더십 기초', type: '온라인 과정', duration: '10시간', skill: '리더십' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{item.course}</div>
                    <div className="text-sm text-gray-500">{item.type} · {item.duration}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{item.skill}</span>
                    <button className="text-blue-600 text-sm hover:underline">등록</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">목표 설정</h3>
            <p className="text-gray-500 text-sm mb-4">
              다음 분기까지 달성하고 싶은 스킬 목표를 설정하세요.
            </p>
            <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500">
              + 새 목표 추가
            </button>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">스킬 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">스킬 선택</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option>스킬을 선택하세요</option>
                  <option>Python</option>
                  <option>AWS</option>
                  <option>Docker</option>
                  <option>Kubernetes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">현재 수준</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  {Object.entries(levelLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">경력 (년)</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2" min="0" max="30" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                취소
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
