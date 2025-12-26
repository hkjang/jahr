'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  GitBranch,
  Star,
  FileText,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    title: '채용 공고',
    description: '채용 공고를 등록하고 관리합니다.',
    href: '/admin/recruitment/postings',
    icon: Briefcase,
    color: 'bg-blue-500',
  },
  {
    title: '채용 파이프라인',
    description: '지원자의 단계별 진행 상황을 관리합니다.',
    href: '/admin/recruitment/pipeline',
    icon: GitBranch,
    color: 'bg-purple-500',
  },
  {
    title: '인재풀',
    description: '미채용 우수 인재를 관리합니다.',
    href: '/admin/recruitment/talent-pool',
    icon: Star,
    color: 'bg-yellow-500',
  },
  {
    title: '평가 템플릿',
    description: '면접 평가 양식을 관리합니다.',
    href: '/admin/recruitment/templates',
    icon: FileText,
    color: 'bg-green-500',
  },
];

export default function RecruitmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">채용 관리</h1>
        <p className="text-gray-400 mt-1">
          채용 공고 등록부터 입사까지의 전체 채용 프로세스를 관리합니다.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
