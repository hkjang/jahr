"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";
import { Briefcase, Plus, Search } from "lucide-react";
import Link from "next/link";

interface RnR {
    id: string;
    code: string;
    name: string;
    description: string | null;
    category: string;
    level: string;
    isActive: boolean;
    _count: {
        assignments: number;
    };
}

async function fetchRnRs(category?: string): Promise<{ success: boolean; data: RnR[] }> {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    const res = await fetch(`/api/rnr?${params}`);
    if (!res.ok) throw new Error("Failed to fetch R&Rs");
    return res.json();
}

export default function AdminRnRPage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["rnr", category],
        queryFn: () => fetchRnRs(category || undefined),
    });

    const filteredData = data?.data.filter((rnr) =>
        rnr.name.toLowerCase().includes(search.toLowerCase()) ||
        rnr.code.toLowerCase().includes(search.toLowerCase())
    );

    const categoryColors: Record<string, string> = {
        MANAGEMENT: "bg-blue-500/20 text-blue-300",
        TECHNICAL: "bg-green-500/20 text-green-300",
        BUSINESS: "bg-purple-500/20 text-purple-300",
        ADMINISTRATIVE: "bg-orange-500/20 text-orange-300",
    };

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">R&R 관리</h1>
                    <p className="text-gray-400 mt-1">조직의 책임과 역할을 정의하고 관리합니다.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    R&R 추가
                </Button>
            </div>

            {/* 검색 및 필터 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="R&R 이름 또는 코드로 검색..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leftIcon={<Search className="w-4 h-4" />}
                                className="bg-gray-900 border-gray-700 text-white"
                            />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">전체 카테고리</option>
                            <option value="MANAGEMENT">관리</option>
                            <option value="TECHNICAL">기술</option>
                            <option value="BUSINESS">업무</option>
                            <option value="ADMINISTRATIVE">행정</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* R&R 목록 */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                        R&R 목록
                        {data?.data && (
                            <span className="text-sm font-normal text-gray-400 ml-2">
                                (총 {data.data.length}개)
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-400">
                            데이터를 불러오는 중 오류가 발생했습니다.
                        </div>
                    ) : filteredData?.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            등록된 R&R이 없습니다.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">코드</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">이름</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">카테고리</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">레벨</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">배정 인원</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData?.map((rnr) => (
                                        <tr
                                            key={rnr.id}
                                            className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer"
                                        >
                                            <td className="py-4 px-4">
                                                <code className="text-blue-400 font-mono text-sm">{rnr.code}</code>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="text-white font-medium">{rnr.name}</p>
                                                    {rnr.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{rnr.description.slice(0, 50)}...</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded text-xs ${categoryColors[rnr.category] || "bg-gray-700 text-gray-300"}`}>
                                                    {rnr.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-300">
                                                {rnr.level}
                                            </td>
                                            <td className="py-4 px-4 text-gray-300">
                                                <Badge variant="default">{rnr._count.assignments}명</Badge>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Badge variant={rnr.isActive ? "success" : "default"}>
                                                    {rnr.isActive ? "활성" : "비활성"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
