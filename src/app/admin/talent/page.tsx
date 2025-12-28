'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    UserCheck,
    Search,
    Plus,
    Star,
    TrendingUp,
    Users,
    Target
} from 'lucide-react';

// Mock data
const talents = [
    { id: '1', name: '김개발', department: '개발팀', position: '시니어 개발자', rating: 'A', potential: 'High', skills: ['React', 'Node.js', 'TypeScript'] },
    { id: '2', name: '이분석', department: '데이터팀', position: '데이터 분석가', rating: 'A+', potential: 'High', skills: ['Python', 'SQL', 'Tableau'] },
    { id: '3', name: '박기획', department: '기획팀', position: '시니어 기획자', rating: 'B+', potential: 'Medium', skills: ['프로젝트 관리', 'Figma', 'Jira'] },
    { id: '4', name: '최마케터', department: '마케팅팀', position: '마케팅 매니저', rating: 'A', potential: 'High', skills: ['디지털 마케팅', 'GA', 'SEO'] },
];

const potentialColors: Record<string, string> = {
    High: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Low: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function TalentManagementPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTalents = talents.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">인재 관리</h1>
                    <p className="text-gray-400 mt-1">핵심 인재를 발굴하고 관리합니다.</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    인재 등록
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">전체 인재</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{talents.length}</div>
                        <p className="text-xs text-gray-400">등록된 핵심 인재</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">High Potential</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                            {talents.filter(t => t.potential === 'High').length}
                        </div>
                        <p className="text-xs text-gray-400">고성장 잠재력</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">A등급 이상</CardTitle>
                        <Star className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">
                            {talents.filter(t => t.rating.startsWith('A')).length}
                        </div>
                        <p className="text-xs text-gray-400">최고 성과자</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">승계 후보</CardTitle>
                        <Target className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">2</div>
                        <p className="text-xs text-gray-400">핵심 직책 승계 후보</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="이름, 부서, 스킬로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
            </div>

            {/* Talent List */}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredTalents.map(talent => (
                    <Card key={talent.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {talent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{talent.name}</h3>
                                        <p className="text-sm text-gray-400">{talent.department} · {talent.position}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant="outline" className="text-white border-gray-600">
                                        {talent.rating}
                                    </Badge>
                                    <Badge className={potentialColors[talent.potential]}>
                                        {talent.potential}
                                    </Badge>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {talent.skills.map((skill, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTalents.length === 0 && (
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="text-center py-8 text-gray-400">
                        검색 결과가 없습니다.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
