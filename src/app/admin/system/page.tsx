'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Server, Database, Shield, Activity } from 'lucide-react';

export default function SystemPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">시스템 관리</h1>
                <p className="text-gray-400 mt-1">시스템 설정 및 모니터링을 관리합니다.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">서버 상태</CardTitle>
                        <Server className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-lg font-bold text-green-400">정상</span>
                        </div>
                        <p className="text-xs text-gray-400">모든 서비스 운영 중</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">DB 상태</CardTitle>
                        <Database className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-lg font-bold text-green-400">정상</span>
                        </div>
                        <p className="text-xs text-gray-400">연결 정상</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">보안</CardTitle>
                        <Shield className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-blue-400">안전</div>
                        <p className="text-xs text-gray-400">위협 없음</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">API 응답</CardTitle>
                        <Activity className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-white">45ms</div>
                        <p className="text-xs text-gray-400">평균 응답 시간</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">시스템 로그</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8 text-gray-400">
                    시스템 로그가 여기에 표시됩니다.
                </CardContent>
            </Card>
        </div>
    );
}
