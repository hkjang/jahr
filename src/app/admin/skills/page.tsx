'use client';

import React, { useState } from 'react';

// Types
interface Skill {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  children?: Skill[];
  _count?: { employeeSkills: number; jobRequirements: number };
}

interface EmployeeSkillSummary {
  employeeId: string;
  name: string;
  department: string;
  skillCount: number;
  avgLevel: number;
  topSkills: string[];
}

// Mock data
const mockSkillTaxonomy: Skill[] = [
  {
    id: 's1',
    code: 'TECH',
    name: '기술 역량',
    category: 'TECHNICAL',
    children: [
      { id: 's1-1', code: 'PROG', name: '프로그래밍', category: 'TECHNICAL', _count: { employeeSkills: 45, jobRequirements: 12 } },
      { id: 's1-2', code: 'DB', name: '데이터베이스', category: 'TECHNICAL', _count: { employeeSkills: 32, jobRequirements: 8 } },
      { id: 's1-3', code: 'CLOUD', name: '클라우드', category: 'TECHNICAL', _count: { employeeSkills: 28, jobRequirements: 6 } },
    ]
  },
  {
    id: 's2',
    code: 'SOFT',
    name: '소프트 스킬',
    category: 'SOFT_SKILL',
    children: [
      { id: 's2-1', code: 'COMM', name: '커뮤니케이션', category: 'SOFT_SKILL', _count: { employeeSkills: 67, jobRequirements: 15 } },
      { id: 's2-2', code: 'LEAD', name: '리더십', category: 'SOFT_SKILL', _count: { employeeSkills: 23, jobRequirements: 7 } },
    ]
  },
  {
    id: 's3',
    code: 'BIZ',
    name: '업무 역량',
    category: 'BUSINESS',
    children: [
      { id: 's3-1', code: 'PM', name: '프로젝트 관리', category: 'BUSINESS', _count: { employeeSkills: 34, jobRequirements: 10 } },
      { id: 's3-2', code: 'ANAL', name: '데이터 분석', category: 'BUSINESS', _count: { employeeSkills: 41, jobRequirements: 9 } },
    ]
  }
];

const mockEmployeeSummary: EmployeeSkillSummary[] = [
  { employeeId: 'emp001', name: '김개발', department: '개발팀', skillCount: 8, avgLevel: 3.5, topSkills: ['JavaScript', 'React', 'Node.js'] },
  { employeeId: 'emp002', name: '이분석', department: '데이터팀', skillCount: 6, avgLevel: 4.0, topSkills: ['Python', 'SQL', '데이터 분석'] },
  { employeeId: 'emp003', name: '박기획', department: '기획팀', skillCount: 5, avgLevel: 3.2, topSkills: ['프로젝트 관리', '커뮤니케이션', '문서작성'] },
];

const categoryColors: Record<string, string> = {
  'TECHNICAL': 'bg-blue-100 text-blue-800 border-blue-200',
  'SOFT_SKILL': 'bg-green-100 text-green-800 border-green-200',
  'BUSINESS': 'bg-purple-100 text-purple-800 border-purple-200',
  'LEADERSHIP': 'bg-orange-100 text-orange-800 border-orange-200',
  'DOMAIN': 'bg-teal-100 text-teal-800 border-teal-200',
  'CERTIFICATION': 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const categoryLabels: Record<string, string> = {
  'TECHNICAL': '기술',
  'SOFT_SKILL': '소프트 스킬',
  'BUSINESS': '업무',
  'LEADERSHIP': '리더십',
  'DOMAIN': '도메인',
  'CERTIFICATION': '자격증',
};

export default function SkillsAdminPage() {
  const [activeTab, setActiveTab] = useState<'taxonomy' | 'employees' | 'gaps'>('taxonomy');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">스킬 그래프 관리</h1>
        <p className="text-gray-600 mt-1">조직의 역량 및 스킬을 관리하고 분석합니다</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">등록된 스킬</div>
          <div className="text-2xl font-bold text-blue-600">127</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">직원 스킬 매핑</div>
          <div className="text-2xl font-bold text-green-600">892</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">직무 요구 역량</div>
          <div className="text-2xl font-bold text-purple-600">67</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">평균 스킬 레벨</div>
          <div className="text-2xl font-bold text-orange-600">3.4</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'taxonomy', label: '스킬 사전' },
            { key: 'employees', label: '직원 스킬 현황' },
            { key: 'gaps', label: '스킬 갭 분석' }
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
      {activeTab === 'taxonomy' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 rounded-full text-sm ${
                  !selectedCategory ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === key ? 'bg-gray-800 text-white' : `${categoryColors[key]} hover:opacity-80`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              + 스킬 추가
            </button>
          </div>

          <div className="bg-white rounded-lg shadow">
            {mockSkillTaxonomy
              .filter(s => !selectedCategory || s.category === selectedCategory)
              .map(category => (
              <div key={category.id} className="border-b last:border-b-0">
                <div className="p-4 bg-gray-50 font-medium flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${categoryColors[category.category]}`}>
                    {categoryLabels[category.category]}
                  </span>
                  <span>{category.name}</span>
                  <span className="text-gray-400 text-sm">({category.children?.length || 0})</span>
                </div>
                {category.children && (
                  <div className="divide-y">
                    {category.children.map(skill => (
                      <div key={skill.id} className="p-4 pl-8 flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-gray-400 text-sm ml-2">({skill.code})</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{skill._count?.employeeSkills || 0}명 보유</span>
                          <span>{skill._count?.jobRequirements || 0}개 직무 요구</span>
                          <button className="text-blue-600 hover:underline">편집</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">직원</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">부서</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">스킬 수</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평균 레벨</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주요 스킬</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockEmployeeSummary.map(emp => (
                <tr key={emp.employeeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{emp.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{emp.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{emp.skillCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(emp.avgLevel / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{emp.avgLevel.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {emp.topSkills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{skill}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:underline text-sm">상세</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">조직 스킬 갭 요약</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">23%</div>
                <div className="text-sm text-gray-500">스킬 갭 있는 직원</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">8</div>
                <div className="text-sm text-gray-500">부족한 핵심 역량</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">15</div>
                <div className="text-sm text-gray-500">권장 교육 과정</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">부족 역량 Top 5</h3>
            <div className="space-y-3">
              {[
                { name: 'AI/ML', gap: 45, level: 'ADVANCED' },
                { name: '클라우드 아키텍처', gap: 38, level: 'INTERMEDIATE' },
                { name: '데이터 엔지니어링', gap: 32, level: 'ADVANCED' },
                { name: '보안', gap: 28, level: 'INTERMEDIATE' },
                { name: 'DevOps', gap: 25, level: 'INTERMEDIATE' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-32 font-medium">{item.name}</span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-red-400 h-3 rounded-full"
                        style={{ width: `${item.gap}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-16 text-sm text-gray-500">{item.gap}% 부족</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{item.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">새 스킬 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">스킬 코드</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="예: REACT" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">스킬명</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="예: React" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows={3} />
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
