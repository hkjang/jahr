"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Building2, Users, ChevronDown, ChevronRight, User, Download } from "lucide-react";
import { useState } from "react";

interface OrgNode {
  id: string;
  code: string;
  name: string;
  level: string;
  _count?: { employees: number };
  children?: OrgNode[];
}

async function fetchOrgTree() {
  const res = await fetch("/api/organizations?tree=true");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

// 조직 노드 컴포넌트
function OrgTreeNode({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  const levelColors: Record<string, string> = {
    COMPANY: "bg-blue-500",
    DIVISION: "bg-purple-500",
    DEPARTMENT: "bg-green-500",
    TEAM: "bg-orange-500",
  };

  const levelLabels: Record<string, string> = {
    COMPANY: "회사",
    DIVISION: "본부",
    DEPARTMENT: "부서",
    TEAM: "팀",
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
          depth === 0 ? "bg-gray-50" : ""
        }`}
        style={{ marginLeft: `${depth * 24}px` }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )
        ) : (
          <div className="w-4" />
        )}
        <div className={`w-8 h-8 ${levelColors[node.level]} rounded-lg flex items-center justify-center`}>
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{node.name}</span>
            <span className="text-xs text-gray-400">{levelLabels[node.level]}</span>
          </div>
          {node._count && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              {node._count.employees}명
            </div>
          )}
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <OrgTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["orgTree"],
    queryFn: fetchOrgTree,
  });

  // 모의 데이터
  const mockOrgTree: OrgNode = {
    id: "1",
    code: "CORP",
    name: "주식회사 JaHR",
    level: "COMPANY",
    _count: { employees: 150 },
    children: [
      {
        id: "2",
        code: "DEV",
        name: "개발본부",
        level: "DIVISION",
        _count: { employees: 80 },
        children: [
          {
            id: "3",
            code: "FE",
            name: "프론트엔드팀",
            level: "TEAM",
            _count: { employees: 25 },
          },
          {
            id: "4",
            code: "BE",
            name: "백엔드팀",
            level: "TEAM",
            _count: { employees: 30 },
          },
          {
            id: "5",
            code: "DEVOPS",
            name: "DevOps팀",
            level: "TEAM",
            _count: { employees: 15 },
          },
        ],
      },
      {
        id: "6",
        code: "BIZ",
        name: "경영지원본부",
        level: "DIVISION",
        _count: { employees: 40 },
        children: [
          {
            id: "7",
            code: "HR",
            name: "인사팀",
            level: "TEAM",
            _count: { employees: 10 },
          },
          {
            id: "8",
            code: "FIN",
            name: "재무팀",
            level: "TEAM",
            _count: { employees: 15 },
          },
          {
            id: "9",
            code: "GA",
            name: "총무팀",
            level: "TEAM",
            _count: { employees: 8 },
          },
        ],
      },
      {
        id: "10",
        code: "SALES",
        name: "영업본부",
        level: "DIVISION",
        _count: { employees: 30 },
        children: [
          {
            id: "11",
            code: "SALES1",
            name: "영업1팀",
            level: "TEAM",
            _count: { employees: 15 },
          },
          {
            id: "12",
            code: "SALES2",
            name: "영업2팀",
            level: "TEAM",
            _count: { employees: 15 },
          },
        ],
      },
    ],
  };

  const orgTree = data?.data || mockOrgTree;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">조직도</h1>
          <p className="text-gray-500 mt-1">회사 조직 구조를 확인합니다.</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          다운로드
        </Button>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span>회사</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded" />
          <span>본부</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span>부서</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded" />
          <span>팀</span>
        </div>
      </div>

      {/* 조직도 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            조직 구조
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <OrgTreeNode node={orgTree} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
