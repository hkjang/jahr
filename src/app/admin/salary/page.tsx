"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { DollarSign, Calendar, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { formatCurrency, formatKoreanDate } from "@/lib/utils";

interface SalaryItem {
  id: string;
  type: string;
  category: string;
  name: string;
  amount: number;
}

interface Salary {
  id: string;
  yearMonth: string;
  baseSalary: number;
  totalPayment: number;
  totalDeduction: number;
  netSalary: number;
  paidAt: string | null;
  employee: {
    user: { name: string; employeeId: string };
    organization: { name: string };
    position: { name: string };
  };
  items: SalaryItem[];
}

async function fetchSalaries(yearMonth: string) {
  const res = await fetch(`/api/salary?yearMonth=${yearMonth}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function AdminSalaryPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [search, setSearch] = useState("");

  const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  const { data, isLoading } = useQuery({
    queryKey: ["salaries", yearMonth],
    queryFn: () => fetchSalaries(yearMonth),
  });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 통계 계산
  const stats = {
    totalEmployees: data?.data?.items?.length || 0,
    totalPayment: data?.data?.items?.reduce((sum: number, s: Salary) => sum + (s.totalPayment || s.baseSalary), 0) || 0,
    totalDeduction: data?.data?.items?.reduce((sum: number, s: Salary) => sum + (s.totalDeduction || 0), 0) || 0,
    totalNet: data?.data?.items?.reduce((sum: number, s: Salary) => sum + (s.netSalary || s.baseSalary), 0) || 0,
  };

  const filteredSalaries = data?.data?.items?.filter((salary: Salary) =>
    salary.employee.user.name.includes(search) ||
    salary.employee.user.employeeId.includes(search)
  ) || [];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">급여 관리</h1>
          <p className="text-gray-400 mt-1">월별 급여 현황을 관리합니다.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          급여명세서 다운로드
        </Button>
      </div>

      {/* 월 선택 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-lg font-medium text-white">
                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">대상 인원</p>
                <p className="text-xl font-bold text-white">{stats.totalEmployees}명</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">총 지급액</p>
                <p className="text-xl font-bold text-white">{formatCurrency(stats.totalPayment)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">총 공제액</p>
                <p className="text-xl font-bold text-white">{formatCurrency(stats.totalDeduction)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">실지급액 합계</p>
                <p className="text-xl font-bold text-white">{formatCurrency(stats.totalNet)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <Input
            placeholder="이름 또는 사번으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-gray-900 border-gray-700 text-white max-w-md"
          />
        </CardContent>
      </Card>

      {/* 급여 목록 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            급여 명세
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredSalaries.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              해당 월의 급여 데이터가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">직원</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">소속</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">기본급</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">지급액</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">공제액</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">실지급액</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaries.map((salary: Salary) => (
                    <tr
                      key={salary.id}
                      className="border-b border-gray-700/50 hover:bg-gray-700/30"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{salary.employee.user.name}</p>
                          <p className="text-xs text-gray-500">{salary.employee.user.employeeId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {salary.employee.organization.name}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-300">
                        {formatCurrency(salary.baseSalary)}
                      </td>
                      <td className="py-4 px-4 text-right text-green-400">
                        {formatCurrency(salary.totalPayment || salary.baseSalary)}
                      </td>
                      <td className="py-4 px-4 text-right text-red-400">
                        -{formatCurrency(salary.totalDeduction || 0)}
                      </td>
                      <td className="py-4 px-4 text-right text-white font-bold">
                        {formatCurrency(salary.netSalary || salary.baseSalary)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {salary.paidAt ? (
                          <Badge variant="success">지급완료</Badge>
                        ) : (
                          <Badge variant="warning">대기</Badge>
                        )}
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
