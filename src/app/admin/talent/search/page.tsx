"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { Search, Users, Filter, ArrowUpDown } from "lucide-react";

interface SearchResult {
    employee: {
        id: string;
        name: string;
        email: string;
        position: string;
        organization: string;
    };
    skills: string[];
    experience: number;
    matchScore: number;
}

export default function AdminTalentSearchPage() {
    const [skills, setSkills] = useState("");
    const [minExperience, setMinExperience] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const response = await fetch("/api/talent/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
                    minExperience: minExperience ? parseFloat(minExperience) : undefined,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setResults(data.data.results);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div>
                <h1 className="text-2xl font-bold text-white">인재 검색</h1>
                <p className="text-gray-400 mt-1">스킬 기반으로 적합한 인재를 찾습니다.</p>
            </div>

            {/* 검색 필터 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-400" />
                        검색 조건
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                스킬 (쉼표로 구분)
                            </label>
                            <Input
                                placeholder="예: React, Node.js, Python"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                className="bg-gray-900 border-gray-700 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                최소 경력 (년)
                            </label>
                            <Input
                                type="number"
                                placeholder="예: 3"
                                value={minExperience}
                                onChange={(e) => setMinExperience(e.target.value)}
                                className="bg-gray-900 border-gray-700 text-white"
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                {isSearching ? "검색 중..." : "검색"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 검색 결과 */}
            {results.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                검색 결과 ({results.length}명)
                            </CardTitle>
                            <Button variant="outline" size="sm">
                                <ArrowUpDown className="w-4 h-4 mr-2" />
                                정렬
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {results.map((result, index) => (
                                <div
                                    key={result.employee.id}
                                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-white font-medium text-lg">
                                                {result.employee.name}
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {result.employee.position} • {result.employee.organization}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {result.employee.email}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-green-400">
                                                    {result.matchScore.toFixed(0)}%
                                                </div>
                                                <div className="text-xs text-gray-500">매칭률</div>
                                            </div>
                                            <div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                                                {result.experience.toFixed(1)}년 경력
                                            </div>
                                        </div>
                                    </div>

                                    {/* 스킬 뱃지 */}
                                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-700">
                                        <span className="text-xs text-gray-400 mr-2">보유 스킬:</span>
                                        {result.skills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {/* 액션 버튼 */}
                                    <div className="flex gap-2 mt-4">
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                            프로필 보기
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-gray-600 text-gray-300"
                                        >
                                            비교 추가
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 초기 상태 */}
            {results.length === 0 && !isSearching && (
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="py-20">
                        <div className="text-center text-gray-400">
                            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>스킬과 경력을 입력하여 인재를 검색하세요.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
