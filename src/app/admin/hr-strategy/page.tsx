'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  Building2,
  Calculator,
  DollarSign,
  GitBranch,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    title: '인력 계획',
    description: '연간 및 분기별 인력 수요 계획을 수립하고 관리합니다.',
    href: '/admin/hr-strategy/workforce',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    title: '정원 관리',
    description: '부서별 TO(Table of Organization)를 설정하고 모니터링합니다.',
    href: '/admin/hr-strategy/headcount',
    icon: Building2,
    color: 'bg-green-500',
  },
  {
    title: '시나리오 분석',
    description: '증원/감원 시나리오를 생성하고 비용 영향을 분석합니다.',
    href: '/admin/hr-strategy/simulation',
    icon: Calculator,
    color: 'bg-purple-500',
  },
  {
    title: '인건비 예측',
    description: '급여, 상여, 복리후생비를 포함한 인건비를 예측합니다.',
    href: '/admin/hr-strategy/labor-cost',
    icon: DollarSign,
    color: 'bg-yellow-500',
  },
  {
    title: '조직 개편 시뮬레이션',
    description: '조직 구조 변경의 영향을 분석하고 시뮬레이션합니다.',
    href: '/admin/hr-strategy/restructure',
    icon: GitBranch,
    color: 'bg-red-500',
  },
];

export default function HRStrategyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">전략 HR</h1>
        <p className="text-gray-400 mt-1">
          전략적 인력 운영을 위한 계획, 분석, 시뮬레이션 도구를 제공합니다.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.href} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${feature.color}`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="min-h-[40px] text-gray-400">
                {feature.description}
              </CardDescription>
              <Button variant="outline" asChild className="w-full">
                <Link href={feature.href}>
                  시작하기
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
