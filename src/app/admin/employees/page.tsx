"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { Users, Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatKoreanDate } from "@/lib/utils";
import { EMPLOYMENT_TYPE_LABELS, USER_STATUS_LABELS } from "@/lib/constants";

interface Employee {
  id: string;
  hireDate: string;
  employmentType: string;
  user: {
    id: string;
    employeeId: string;
    email: string;
    name: string;
    phoneNumber: string | null;
    profileImage: string | null;
    status: string;
  };
  organization: {
    id: string;
    code: string;
    name: string;
  };
  position: {
    id: string;
    code: string;
    name: string;
  };
}

interface EmployeesResponse {
  success: boolean;
  data: {
    items: Employee[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

async function fetchEmployees(page: number, search: string): Promise<EmployeesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: "10",
    ...(search && { search }),
  });
  const res = await fetch(`/api/employees?${params}`);
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}

export default function AdminEmployeesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["employees", page, debouncedSearch],
    queryFn: () => fetchEmployees(page, debouncedSearch),
  });

  const statusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE": return "success";
      case "INACTIVE": return "default";
      case "SUSPENDED": return "warning";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">직원 관리</h1>
          <p className="text-gray-400 mt-1">전체 직원 정보를 조회하고 관리합니다.</p>
        </div>
        <Link href="/admin/employees/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            직원 등록
          </Button>
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="이름, 사번, 이메일로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <Button variant="outline" className="border-gray-600 text-gray-300">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 직원 목록 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            직원 목록
            {data?.data && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                (총 {data.data.total}명)
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
          ) : data?.data.items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              등록된 직원이 없습니다.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">직원</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">소속</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">직급</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">입사일</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">고용형태</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data.items.map((employee) => (
                      <tr
                        key={employee.id}
                        className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-4">
                          <Link href={`/admin/employees/${employee.id}`} className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarImage src={employee.user.profileImage || undefined} />
                              <AvatarFallback className="bg-blue-600 text-white text-xs">
                                {employee.user.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium">{employee.user.name}</p>
                              <p className="text-xs text-gray-500">{employee.user.employeeId}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {employee.organization.name}
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {employee.position.name}
                        </td>
                        <td className="py-4 px-4 text-gray-400">
                          {formatKoreanDate(new Date(employee.hireDate))}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300">
                            {EMPLOYMENT_TYPE_LABELS[employee.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS] || employee.employmentType}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={statusVariant(employee.user.status) as "success" | "default" | "warning"}>
                            {USER_STATUS_LABELS[employee.user.status as keyof typeof USER_STATUS_LABELS] || employee.user.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {data && data.data && data.data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-400">
                    {data.data.total}개 중 {(page - 1) * 10 + 1}-{Math.min(page * 10, data.data.total)}개 표시
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="border-gray-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-400">
                      {page} / {data.data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.data.totalPages}
                      className="border-gray-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
