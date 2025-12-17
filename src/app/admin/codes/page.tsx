"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { Database, Plus, Search, Edit, Trash2 } from "lucide-react";

interface CodeItem {
  code: string;
  name: string;
  isActive: boolean;
}

interface CodeGroup {
  id: string;
  name: string;
  description: string;
  items: CodeItem[];
}

// 공통 코드 모의 데이터
const mockCodeGroups: CodeGroup[] = [
  {
    id: "employment_type",
    name: "고용 형태",
    description: "직원의 고용 형태 구분",
    items: [
      { code: "REGULAR", name: "정규직", isActive: true },
      { code: "CONTRACT", name: "계약직", isActive: true },
      { code: "INTERN", name: "인턴", isActive: true },
      { code: "PART_TIME", name: "파트타임", isActive: true },
    ],
  },
  {
    id: "work_type",
    name: "근무 형태",
    description: "근무 방식 구분",
    items: [
      { code: "OFFICE", name: "사무실 근무", isActive: true },
      { code: "REMOTE", name: "재택 근무", isActive: true },
      { code: "HYBRID", name: "하이브리드", isActive: true },
      { code: "FLEXIBLE", name: "유연 근무", isActive: true },
    ],
  },
  {
    id: "leave_type",
    name: "휴가 유형",
    description: "휴가 종류 구분",
    items: [
      { code: "ANNUAL", name: "연차", isActive: true },
      { code: "SICK", name: "병가", isActive: true },
      { code: "OFFICIAL", name: "공가", isActive: true },
      { code: "MATERNITY", name: "출산휴가", isActive: true },
      { code: "PATERNITY", name: "육아휴직", isActive: true },
      { code: "BEREAVEMENT", name: "경조사", isActive: true },
    ],
  },
  {
    id: "attendance_status",
    name: "근태 상태",
    description: "출근 상태 구분",
    items: [
      { code: "NORMAL", name: "정상", isActive: true },
      { code: "LATE", name: "지각", isActive: true },
      { code: "EARLY_LEAVE", name: "조퇴", isActive: true },
      { code: "ABSENT", name: "결근", isActive: true },
    ],
  },
  {
    id: "org_level",
    name: "조직 레벨",
    description: "조직 계층 구분",
    items: [
      { code: "COMPANY", name: "회사", isActive: true },
      { code: "DIVISION", name: "본부", isActive: true },
      { code: "DEPARTMENT", name: "부서", isActive: true },
      { code: "TEAM", name: "팀", isActive: true },
    ],
  },
  {
    id: "evaluation_grade",
    name: "평가 등급",
    description: "인사 평가 등급",
    items: [
      { code: "S", name: "탁월 (S)", isActive: true },
      { code: "A", name: "우수 (A)", isActive: true },
      { code: "B", name: "보통 (B)", isActive: true },
      { code: "C", name: "미흡 (C)", isActive: true },
      { code: "D", name: "부진 (D)", isActive: true },
    ],
  },
];

export default function AdminCodesPage() {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<CodeGroup | null>(null);

  const filteredGroups = mockCodeGroups.filter(
    (g) =>
      g.name.includes(search) ||
      g.description.includes(search) ||
      g.items.some((i) => i.name.includes(search) || i.code.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">코드 관리</h1>
          <p className="text-gray-400 mt-1">시스템 공통 코드를 관리합니다.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          코드 그룹 추가
        </Button>
      </div>

      {/* 검색 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <Input
            placeholder="코드 또는 코드명으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-gray-900 border-gray-700 text-white max-w-md"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 코드 그룹 목록 */}
        <div className="lg:col-span-1 space-y-4">
          {filteredGroups.map((group) => (
            <Card
              key={group.id}
              className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
                selectedGroup?.id === group.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedGroup(group)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.items.length}개 항목</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 코드 상세 */}
        <div className="lg:col-span-2">
          {selectedGroup ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    {selectedGroup.name}
                  </CardTitle>
                  <p className="text-sm text-gray-400 mt-1">{selectedGroup.description}</p>
                </div>
                <Button size="sm" variant="outline" className="border-gray-600">
                  <Plus className="w-4 h-4 mr-1" />
                  항목 추가
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">코드</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">코드명</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">상태</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroup.items.map((item) => (
                        <tr
                          key={item.code}
                          className="border-b border-gray-700/50 hover:bg-gray-700/30"
                        >
                          <td className="py-3 px-4">
                            <code className="text-blue-400 text-sm bg-blue-500/10 px-2 py-1 rounded">
                              {item.code}
                            </code>
                          </td>
                          <td className="py-3 px-4 text-white">{item.name}</td>
                          <td className="py-3 px-4 text-center">
                            {item.isActive ? (
                              <Badge variant="success">활성</Badge>
                            ) : (
                              <Badge variant="default">비활성</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                                <Edit className="w-4 h-4 text-gray-400" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-12 text-center text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>좌측에서 코드 그룹을 선택하세요.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
