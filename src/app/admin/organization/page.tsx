"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Building2, Plus, ChevronRight, ChevronDown, Users, Edit2, Trash2 } from "lucide-react";
import { ORG_LEVEL_LABELS } from "@/lib/constants";

interface Organization {
  id: string;
  code: string;
  name: string;
  level: string;
  parentId: string | null;
  isActive: boolean;
  _count?: { employees: number };
  children?: Organization[];
}

async function fetchOrganizations() {
  const res = await fetch("/api/organizations");
  if (!res.ok) throw new Error("Failed to fetch organizations");
  return res.json();
}

function OrgTreeNode({ org, level = 0 }: { org: Organization; level?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = org.children && org.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer ${
          level === 0 ? "bg-gray-700/30" : ""
        }`}
        style={{ paddingLeft: `${level * 24 + 16}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-600 rounded"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        <Building2 className="w-5 h-5 text-blue-400" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{org.name}</span>
            <Badge variant="default" className="text-xs">
              {ORG_LEVEL_LABELS[org.level as keyof typeof ORG_LEVEL_LABELS] || org.level}
            </Badge>
          </div>
          <span className="text-xs text-gray-500">{org.code}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-400">
            <Users className="w-4 h-4" />
            <span className="text-sm">{org._count?.employees || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-gray-600 rounded text-gray-400 hover:text-white">
              <Edit2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-red-600/20 rounded text-gray-400 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {org.children!.map((child) => (
            <OrgTreeNode key={child.id} org={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrganizationPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
  });

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">조직 관리</h1>
          <p className="text-gray-400 mt-1">조직 구조를 조회하고 관리합니다.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          조직 추가
        </Button>
      </div>

      {/* 조직도 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            조직 구조
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">
              조직 정보를 불러오는 중 오류가 발생했습니다.
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              등록된 조직이 없습니다.
            </div>
          ) : (
            <div className="space-y-1">
              {data?.data.map((org: Organization) => (
                <OrgTreeNode key={org.id} org={org} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
