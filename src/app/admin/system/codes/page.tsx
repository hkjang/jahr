"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Code, Plus } from "lucide-react";

export default function AdminSystemCodesPage() {
    // Mock data
    const codeGroups = [
        {
            groupCode: "POSITION",
            groupName: "직급",
            codes: [
                { code: "STAFF", name: "사원", sortOrder: 1 },
                { code: "SENIOR", name: "대리", sortOrder: 2 },
                { code: "MANAGER", name: "과장", sortOrder: 3 },
                { code: "DEPUTY_GM", name: "차장", sortOrder: 4 },
                { code: "GM", name: "부장", sortOrder: 5 },
            ],
        },
        {
            groupCode: "DEPT_TYPE",
            groupName: "부서 유형",
            codes: [
                { code: "HQ", name: "본부", sortOrder: 1 },
                { code: "DEPT", name: "부서", sortOrder: 2 },
                { code: "TEAM", name: "팀", sortOrder: 3 },
            ],
        },
        {
            groupCode: "EVAL_GRADE",
            groupName: "평가 등급",
            codes: [
                { code: "S", name: "S등급 (탁월)", sortOrder: 1 },
                { code: "A", name: "A등급 (우수)", sortOrder: 2 },
                { code: "B", name: "B등급 (보통)", sortOrder: 3 },
                { code: "C", name: "C등급 (개선필요)", sortOrder: 4 },
                { code: "D", name: "D등급 (부진)", sortOrder: 5 },
            ],
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">코드 관리</h1>
                    <p className="text-gray-400 mt-1">
                        시스템에서 사용하는 코드를 관리합니다.
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    코드 그룹 추가
                </Button>
            </div>

            {/* 코드 그룹 목록 */}
            <div className="grid grid-cols-1 gap-4">
                {codeGroups.map((group) => (
                    <Card key={group.groupCode} className="bg-gray-800 border-gray-700">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Code className="w-5 h-5 text-blue-400" />
                                    {group.groupName} ({group.groupCode})
                                </CardTitle>
                                <Button size="sm" variant="outline">
                                    코드 추가
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {group.codes.map((code) => (
                                    <div
                                        key={code.code}
                                        className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between hover:bg-gray-900/70 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-500 w-8">
                                                {code.sortOrder}
                                            </span>
                                            <div>
                                                <p className="text-white font-medium">{code.name}</p>
                                                <p className="text-xs text-gray-400">{code.code}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline">
                                                수정
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-red-400">
                                                삭제
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
