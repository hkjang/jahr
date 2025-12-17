"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { 
  DollarSign, Calendar, Download, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, Minus
} from "lucide-react";
import { formatCurrency, formatKoreanDate } from "@/lib/utils";

interface SalaryDetail {
  id: string;
  yearMonth: string;
  baseSalary: number;
  bonus: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  paidAt: string | null;
}

async function fetchMySalary(yearMonth: string) {
  const res = await fetch(`/api/salary/me?yearMonth=${yearMonth}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function SalaryStatementPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const yearMonth = `${year}${String(month).padStart(2, "0")}`;

  const { data, isLoading } = useQuery({
    queryKey: ["mySalary", yearMonth],
    queryFn: () => fetchMySalary(yearMonth),
  });

  // 모의 데이터
  const mockSalary: SalaryDetail = {
    id: "1",
    yearMonth,
    baseSalary: 5000000,
    bonus: 500000,
    allowances: {
      "식대": 200000,
      "교통비": 100000,
      "통신비": 50000,
    },
    deductions: {
      "소득세": 250000,
      "주민세": 25000,
      "국민연금": 225000,
      "건강보험": 175000,
      "고용보험": 45000,
    },
    totalEarnings: 5850000,
    totalDeductions: 720000,
    netSalary: 5130000,
    paidAt: `${year}-${String(month).padStart(2, "0")}-25`,
  };

  const salary = data?.data || mockSalary;

  const goToPrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  const allowanceItems = Object.entries((salary.allowances || {}) as Record<string, number>);
  const deductionItems = Object.entries((salary.deductions || {}) as Record<string, number>);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">급여 명세서</h1>
          <p className="text-gray-500 mt-1">월별 급여 내역을 확인합니다.</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          PDF 다운로드
        </Button>
      </div>

      {/* 월 선택 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="sm" onClick={goToPrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="w-5 h-5 text-blue-500" />
              {year}년 {month}월
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToNextMonth}
              disabled={year === today.getFullYear() && month === today.getMonth() + 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* 급여 요약 */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">총 지급액</span>
                </div>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(salary.totalEarnings)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm">총 공제액</span>
                </div>
                <p className="text-xl font-bold text-red-700">
                  {formatCurrency(salary.totalDeductions)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">실수령액</span>
                </div>
                <p className="text-xl font-bold text-blue-700">
                  {formatCurrency(salary.netSalary)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 상세 내역 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 지급 내역 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-5 h-5" />
                  지급 내역
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">기본급</span>
                    <span className="font-medium">{formatCurrency(salary.baseSalary)}</span>
                  </div>
                  {salary.bonus > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">상여금</span>
                      <span className="font-medium">{formatCurrency(salary.bonus)}</span>
                    </div>
                  )}
                  {allowanceItems.map(([name, amount]) => (
                    <div key={name} className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">{name}</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 font-semibold text-green-700">
                    <span>합계</span>
                    <span>{formatCurrency(salary.totalEarnings)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 공제 내역 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <TrendingDown className="w-5 h-5" />
                  공제 내역
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deductionItems.map(([name, amount]) => (
                    <div key={name} className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">{name}</span>
                      <span className="font-medium text-red-600">-{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 font-semibold text-red-700">
                    <span>합계</span>
                    <span>-{formatCurrency(salary.totalDeductions)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 지급일 정보 */}
          {salary.paidAt && (
            <Card className="bg-gray-50">
              <CardContent className="p-4 text-center">
                <p className="text-gray-600">
                  <span className="font-medium">지급일:</span>{" "}
                  {formatKoreanDate(new Date(salary.paidAt))}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
