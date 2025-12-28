'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Plus } from 'lucide-react';

export default function AppointmentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">인사 발령</h1>
                    <p className="text-gray-400 mt-1">인사 발령 및 조직 변경을 관리합니다.</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    발령 등록
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">이번 달 발령</CardTitle>
                        <Calendar className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">12</div>
                        <p className="text-xs text-gray-400">건</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">대기 중</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">5</div>
                        <p className="text-xs text-gray-400">승인 대기</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">영향 인원</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">23</div>
                        <p className="text-xs text-gray-400">명</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="text-center py-12 text-gray-400">
                    인사 발령 목록이 여기에 표시됩니다.
                </CardContent>
            </Card>
        </div>
    );
}
