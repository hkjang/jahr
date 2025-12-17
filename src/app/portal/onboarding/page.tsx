'use client';

import React, { useState, useEffect } from 'react';

interface OnboardingTask {
  id: string;
  category: string;
  name: string;
  description?: string;
  status: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
}

interface MentorInfo {
  id: string;
  mentorId: string;
  matchScore?: number;
  status: string;
  mentorName?: string;
  mentorPosition?: string;
}

interface OnboardingData {
  id: string;
  status: string;
  startDate: string;
  targetEndDate?: string;
  completedDate?: string;
  tasks: OnboardingTask[];
  mentorAssignment?: MentorInfo;
}

const categoryIcons: Record<string, string> = {
  'EQUIPMENT': '💻',
  'SECURITY': '🔒',
  'ACCOUNT': '👤',
  'TRAINING': '📚',
  'DOCUMENTATION': '📄',
  'INTRODUCTION': '👋',
};

const statusLabels: Record<string, string> = {
  'NOT_STARTED': '시작 전',
  'IN_PROGRESS': '진행 중',
  'COMPLETED': '완료',
  'BLOCKED': '지연',
};

export default function OnboardingPortalPage() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo - in real app, fetch from API
    setData({
      id: '1',
      status: 'IN_PROGRESS',
      startDate: '2024-12-15',
      targetEndDate: '2025-01-15',
      tasks: [
        { id: 't1', category: 'EQUIPMENT', name: '노트북 수령', description: 'IT팀에서 장비를 수령하세요', status: 'COMPLETED', completedAt: '2024-12-16' },
        { id: 't2', category: 'ACCOUNT', name: '이메일 계정 활성화', description: '이메일 계정을 활성화하고 비밀번호를 설정하세요', status: 'COMPLETED', completedAt: '2024-12-15' },
        { id: 't3', category: 'SECURITY', name: '보안 교육 이수', description: '온라인 보안 교육을 완료하세요', status: 'IN_PROGRESS', dueDate: '2024-12-20' },
        { id: 't4', category: 'TRAINING', name: '신입사원 오리엔테이션', description: '인사팀 주관 오리엔테이션 참석', status: 'NOT_STARTED', dueDate: '2024-12-22' },
        { id: 't5', category: 'INTRODUCTION', name: '팀원 소개', description: '팀원들과 인사를 나누세요', status: 'NOT_STARTED', dueDate: '2024-12-18' },
        { id: 't6', category: 'DOCUMENTATION', name: '필수 문서 작성', description: '인사 관련 필수 서류를 작성하세요', status: 'NOT_STARTED', dueDate: '2024-12-19' },
      ],
      mentorAssignment: {
        id: 'ma1',
        mentorId: 'emp010',
        matchScore: 85,
        status: 'ACTIVE',
        mentorName: '김선배',
        mentorPosition: '선임 개발자'
      }
    });
    setLoading(false);
  }, []);

  const handleTaskComplete = (taskId: string) => {
    if (!data) return;
    setData({
      ...data,
      tasks: data.tasks.map(t => 
        t.id === taskId 
          ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() }
          : t
      )
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-900">온보딩 완료</h2>
          <p className="text-gray-500 mt-2">모든 온보딩 과정이 완료되었습니다.</p>
        </div>
      </div>
    );
  }

  const completedCount = data.tasks.filter(t => t.status === 'COMPLETED').length;
  const progress = Math.round((completedCount / data.tasks.length) * 100);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내 온보딩</h1>
        <p className="text-gray-600 mt-1">입사 후 완료해야 할 항목들을 확인하세요</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-blue-100 text-sm">온보딩 진행률</div>
            <div className="text-3xl font-bold">{progress}%</div>
          </div>
          <div className="text-right">
            <div className="text-blue-100 text-sm">완료된 항목</div>
            <div className="text-2xl font-semibold">{completedCount} / {data.tasks.length}</div>
          </div>
        </div>
        <div className="w-full bg-blue-400 bg-opacity-50 rounded-full h-3">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-blue-100 mt-2">
          <span>시작일: {new Date(data.startDate).toLocaleDateString('ko-KR')}</span>
          {data.targetEndDate && <span>목표 완료일: {new Date(data.targetEndDate).toLocaleDateString('ko-KR')}</span>}
        </div>
      </div>

      {/* Mentor Card */}
      {data.mentorAssignment && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="flex-1">
              <div className="text-sm text-purple-600">나의 멘토</div>
              <div className="font-semibold text-gray-900">{data.mentorAssignment.mentorName}</div>
              <div className="text-sm text-gray-500">{data.mentorAssignment.mentorPosition}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-purple-500">매칭 점수 {data.mentorAssignment.matchScore}%</div>
              <button className="mt-1 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                연락하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">체크리스트</h2>
        {data.tasks.map(task => (
          <div 
            key={task.id} 
            className={`bg-white rounded-lg border p-4 transition-all ${
              task.status === 'COMPLETED' ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl">
                {task.status === 'COMPLETED' ? '✅' : categoryIcons[task.category] || '📋'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${task.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {task.name}
                  </span>
                  {task.status === 'IN_PROGRESS' && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">진행 중</span>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  {task.dueDate && task.status !== 'COMPLETED' && (
                    <span>마감: {new Date(task.dueDate).toLocaleDateString('ko-KR')}</span>
                  )}
                  {task.completedAt && (
                    <span className="text-green-600">완료: {new Date(task.completedAt).toLocaleDateString('ko-KR')}</span>
                  )}
                </div>
              </div>
              {task.status !== 'COMPLETED' && (
                <button 
                  onClick={() => handleTaskComplete(task.id)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  완료
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">도움이 필요하신가요?</h3>
        <p className="text-sm text-gray-600 mb-3">
          온보딩 과정에서 어려움이 있으시면 인사팀에 문의하세요.
        </p>
        <button className="text-sm text-blue-600 hover:underline">
          인사팀 연락하기 →
        </button>
      </div>
    </div>
  );
}
