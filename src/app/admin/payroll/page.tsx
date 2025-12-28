'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { DollarSign, Calculator, BarChart3, ArrowRight, CreditCard } from 'lucide-react';

const payrollMenus = [
    {
        title: '급여 계산',
        description: '월별 급여 계산 및 명세서 생성',
        href: '/admin/payroll/calculate',
        icon: Calculator,
        color: 'from-green-500 to-green-600',
    },
    {
        title: '임금 밴드',
        description: '직급별 임금 밴드 관리',
        href: '/admin/payroll/bands',
        icon: BarChart3,
        color: 'from-blue-500 to-blue-600',
    },
];

export default function PayrollPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">급여 관리</h1>
                <p className="text-gray-400 mt-1">급여 계산 및 지급을 관리합니다.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">이번 달 총 급여</CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₩1.8B</div>
                        <p className="text-xs text-gray-400">예상 지급액</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">지급 대상</CardTitle>
                        <CreditCard className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">1,247</div>
                        <p className="text-xs text-gray-400">명</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">지급일</CardTitle>
                        <Calculator className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">D-5</div>
                        <p className="text-xs text-gray-400">25일 지급 예정</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {payrollMenus.map((item) => (
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
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
