"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Label } from "@/components/ui";
import { Receipt, Plus, Clock, CheckCircle, XCircle, Send } from "lucide-react";
import { formatCurrency, formatKoreanDate } from "@/lib/utils";

interface Expense {
  id: string;
  docNumber: string;
  title: string;
  content: {
    category: string;
    amount: number;
    date: string;
    description: string;
  };
  status: string;
  createdAt: string;
}

async function fetchExpenses() {
  const res = await fetch("/api/expense");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
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
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: "TRANSPORT",
    amount: "",
    date: "",
    description: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["myExpenses"],
    queryFn: fetchExpenses,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amount: Number(data.amount) }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myExpenses"] });
      setShowForm(false);
      setFormData({ category: "TRANSPORT", amount: "", date: "", description: "" });
    },
  });

  // 모의 데이터
  const mockExpenses: Expense[] = [
    {
      id: "1",
      docNumber: "20241216-EXP-0001",
      title: "경비 청구 - 고객사 미팅 택시비",
      content: { category: "TRANSPORT", amount: 35000, date: "2024-12-16", description: "고객사 미팅 택시비" },
      status: "PENDING",
      createdAt: "2024-12-17T10:00:00",
    },
    {
      id: "2",
      docNumber: "20241213-EXP-0001",
      title: "경비 청구 - 팀 회식비",
      content: { category: "MEAL", amount: 120000, date: "2024-12-13", description: "팀 회식비" },
      status: "APPROVED",
      createdAt: "2024-12-14T09:00:00",
    },
    {
      id: "3",
      docNumber: "20241210-EXP-0001",
      title: "경비 청구 - 사무용품 구매",
      content: { category: "SUPPLIES", amount: 45000, date: "2024-12-10", description: "사무용품 구매" },
      status: "PAID",
      createdAt: "2024-12-11T14:00:00",
    },
  ];

  const expenses = data?.data || mockExpenses;
  const totalAmount = expenses.reduce((sum: number, e: Expense) => sum + (e.content?.amount || 0), 0);
  const pendingAmount = expenses
    .filter((e: Expense) => e.status === "PENDING" || e.status === "APPROVED")
    .reduce((sum: number, e: Expense) => sum + (e.content?.amount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.date || !formData.description) {
      alert("모든 필드를 입력하세요.");
      return;
    }
    createMutation.mutate(formData);
  };

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
              {formatCurrency(totalAmount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">승인 대기</p>
            <p className="text-xl font-bold text-yellow-600 mt-1">
              {formatCurrency(pendingAmount)}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>카테고리 *</Label>
                  <select 
                    className="w-full p-3 border rounded-lg"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>금액 *</Label>
                  <Input 
                    type="number" 
                    placeholder="금액 입력"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>사용일 *</Label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>상세 내용 *</Label>
                <textarea
                  rows={3}
                  placeholder="경비 사용 내역을 입력하세요..."
                  className="w-full p-3 border rounded-lg resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  취소
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? "청구 중..." : "청구하기"}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : expenses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">청구 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense: Expense) => (
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
                        <h4 className="font-medium">{expense.content?.description || expense.title}</h4>
                        <Badge variant="outline">{categoryLabels[expense.content?.category] || ""}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {expense.content?.date ? formatKoreanDate(new Date(expense.content.date)) : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(expense.content?.amount || 0)}</p>
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
