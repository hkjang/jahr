"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Label } from "@/components/ui";
import { Receipt, Plus, Calendar, DollarSign, Clock, CheckCircle, XCircle, Send } from "lucide-react";
import { formatCurrency, formatKoreanDate } from "@/lib/utils";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  TRANSPORT: "교통비",
  MEAL: "식비",
  SUPPLIES: "소모품",
  COMMUNICATION: "통신비",
  OTHER: "기타",
};

const statusLabels: Record<string, string> = {
  PENDING: "승인대기",
  APPROVED: "승인",
  REJECTED: "반려",
  PAID: "지급완료",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-700",
  PAID: "bg-green-100 text-green-700",
};

export default function PortalExpensePage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  
  // 모의 데이터
  const expenses: Expense[] = [
    {
      id: "1",
      category: "TRANSPORT",
      amount: 35000,
      description: "고객사 미팅 택시비",
      date: "2024-12-16",
      status: "PENDING",
      createdAt: "2024-12-17T10:00:00",
    },
    {
      id: "2",
      category: "MEAL",
      amount: 120000,
      description: "팀 회식비",
      date: "2024-12-13",
      status: "APPROVED",
      createdAt: "2024-12-14T09:00:00",
    },
    {
      id: "3",
      category: "SUPPLIES",
      amount: 45000,
      description: "사무용품 구매",
      date: "2024-12-10",
      status: "PAID",
      createdAt: "2024-12-11T14:00:00",
    },
  ];

  const totalPending = expenses
    .filter((e) => e.status === "PENDING" || e.status === "APPROVED")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">경비 청구</h1>
          <p className="text-gray-500 mt-1">업무 경비를 청구하고 현황을 확인합니다.</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          경비 청구
        </Button>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">이번 달 청구</p>
            <p className="text-xl font-bold text-blue-600 mt-1">
              {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">승인 대기</p>
            <p className="text-xl font-bold text-yellow-600 mt-1">
              {formatCurrency(totalPending)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">건수</p>
            <p className="text-xl font-bold mt-1">{expenses.length}건</p>
          </CardContent>
        </Card>
      </div>

      {/* 청구 폼 */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-700">새 경비 청구</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>카테고리</Label>
                  <select className="w-full p-3 border rounded-lg">
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>금액</Label>
                  <Input type="number" placeholder="금액 입력" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>사용일</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>상세 내용</Label>
                <textarea
                  rows={3}
                  placeholder="경비 사용 내역을 입력하세요..."
                  className="w-full p-3 border rounded-lg resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  취소
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  청구하기
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 청구 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-500" />
            청구 내역
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">청구 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      expense.status === "PAID" ? "bg-green-100" :
                      expense.status === "REJECTED" ? "bg-red-100" : "bg-blue-100"
                    }`}>
                      {expense.status === "PAID" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : expense.status === "REJECTED" ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{expense.description}</h4>
                        <Badge variant="outline">{categoryLabels[expense.category]}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatKoreanDate(new Date(expense.date))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(expense.amount)}</p>
                    </div>
                    <Badge className={statusColors[expense.status]}>
                      {statusLabels[expense.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
