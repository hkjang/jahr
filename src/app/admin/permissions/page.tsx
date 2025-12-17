"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { Shield, Users, Key, Plus, ChevronRight } from "lucide-react";

interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  action: string;
}

interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: { permission: Permission }[];
  _count: { users: number };
}

async function fetchRoles() {
  const res = await fetch("/api/roles");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const moduleLabels: Record<string, string> = {
  employee: "직원 관리",
  organization: "조직 관리",
  attendance: "근태 관리",
  leave: "휴가 관리",
  salary: "급여 관리",
  evaluation: "평가 관리",
  training: "교육 관리",
  approval: "결재 관리",
  system: "시스템 관리",
};

const actionLabels: Record<string, string> = {
  read: "조회",
  write: "등록/수정",
  delete: "삭제",
  approve: "승인",
  admin: "관리",
};

export default function AdminPermissionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  const roles: Role[] = data?.data || [];

  // 기본 역할 (실제 데이터가 없을 때)
  const defaultRoles: Role[] = [
    {
      id: "1",
      code: "EMPLOYEE",
      name: "일반 직원",
      description: "기본 직원 권한",
      isSystem: true,
      permissions: [],
      _count: { users: 42 },
    },
    {
      id: "2",
      code: "TEAM_LEADER",
      name: "팀장",
      description: "팀 관리 권한",
      isSystem: true,
      permissions: [],
      _count: { users: 8 },
    },
    {
      id: "3",
      code: "HR_ADMIN",
      name: "HR 관리자",
      description: "인사 관리 전체 권한",
      isSystem: true,
      permissions: [],
      _count: { users: 3 },
    },
    {
      id: "4",
      code: "SYSTEM_ADMIN",
      name: "시스템 관리자",
      description: "시스템 전체 권한",
      isSystem: true,
      permissions: [],
      _count: { users: 1 },
    },
  ];

  const displayRoles = roles.length > 0 ? roles : defaultRoles;

  // 권한 매트릭스
  const modules = Object.keys(moduleLabels);
  const actions = ["read", "write", "delete"];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">권한 관리</h1>
          <p className="text-gray-400 mt-1">역할 및 권한을 관리합니다.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          역할 추가
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* 역할 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayRoles.map((role) => (
              <Card
                key={role.id}
                className="bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    {role.isSystem && (
                      <Badge variant="outline" className="text-xs">시스템</Badge>
                    )}
                  </div>
                  <h3 className="text-white font-medium mb-1">{role.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{role.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{role._count.users}명</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 권한 매트릭스 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-400" />
                권한 매트릭스
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">모듈</th>
                      {displayRoles.map((role) => (
                        <th
                          key={role.id}
                          className="text-center py-3 px-4 text-gray-400 font-medium"
                        >
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((module) => (
                      <tr
                        key={module}
                        className="border-b border-gray-700/50 hover:bg-gray-700/30"
                      >
                        <td className="py-3 px-4 text-white">{moduleLabels[module]}</td>
                        {displayRoles.map((role) => {
                          // 역할별 권한 레벨 시뮬레이션
                          let level = 0;
                          if (role.code === "SYSTEM_ADMIN") level = 3;
                          else if (role.code === "HR_ADMIN") level = 2;
                          else if (role.code === "TEAM_LEADER") level = 1;
                          else level = 0;

                          return (
                            <td key={role.id} className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {actions.map((action, idx) => (
                                  <div
                                    key={action}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                                      idx <= level
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-gray-700 text-gray-500"
                                    }`}
                                    title={actionLabels[action]}
                                  >
                                    {actionLabels[action].charAt(0)}
                                  </div>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-green-400 text-xs">
                    O
                  </div>
                  <span>허용</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                    -
                  </div>
                  <span>거부</span>
                </div>
                <span className="ml-4">조=조회, 등=등록/수정, 삭=삭제</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
