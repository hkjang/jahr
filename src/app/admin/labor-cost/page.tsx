'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DollarSign, Calculator, BarChart3, ArrowRight, TrendingUp } from 'lucide-react';

const laborCostMenus = [
    {
        title: '인건비 예측',
        description: '부서별/직군별 인건비 예측',
        href: '/admin/hr-strategy/labor-cost',
        icon: TrendingUp,
    },
    {
        title: '실적 관리',
        description: '월별 인건비 실적 데이터',
        href: '/admin/labor-cost/actuals',
        icon: BarChart3,
    },
];

export default function LaborCostPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">인건비 관리</h1>
                <p className="text-gray-400 mt-1">인건비 분석 및 예측을 관리합니다.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">월 인건비</CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₩2.4B</div>
                        <p className="text-xs text-gray-400">이번 달 예상</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">전월 대비</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">+2.3%</div>
                        <p className="text-xs text-gray-400">변동률</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">예산 대비</CardTitle>
                        <Calculator className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">98.5%</div>
                        <p className="text-xs text-gray-400">소진율</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {laborCostMenus.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all cursor-pointer group">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                                        <item.icon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{item.title}</h3>
                                        <p className="text-sm text-gray-400">{item.description}</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
