'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Wallet, Users, ArrowRight } from 'lucide-react';

const insuranceTypes = [
    {
        title: '4대 보험',
        description: '국민연금, 건강보험, 고용보험, 산재보험',
        href: '/admin/insurance/national',
        icon: Shield,
        color: 'from-blue-500 to-blue-600',
        count: 1247,
    },
    {
        title: '민간 보험',
        description: '단체보험, 상해보험, 생명보험',
        href: '/admin/insurance/private',
        icon: Wallet,
        color: 'from-purple-500 to-purple-600',
        count: 892,
    },
];

export default function InsurancePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">보험 관리</h1>
                <p className="text-gray-400 mt-1">직원 보험 가입 현황을 관리합니다.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {insuranceTypes.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                                        <item.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mt-4">{item.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                                <div className="flex items-center gap-2 mt-4 text-sm">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-400">가입자 {item.count}명</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">보험료 현황</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8 text-gray-400">
                    월별 보험료 현황이 여기에 표시됩니다.
                </CardContent>
            </Card>
        </div>
    );
}
