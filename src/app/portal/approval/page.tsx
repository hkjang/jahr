"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { FileCheck, Clock, CheckCircle, XCircle, Send, ChevronRight } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";
import { APPROVAL_DOC_TYPE_LABELS } from "@/lib/constants";

interface Approval {
  id: string;
  docNumber: string;
  type: string;
  title: string;
  status: string;
  currentStep: number;
  createdAt: string;
}

async function fetchMyApprovals() {
  const res = await fetch("/api/approvals/me");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const statusLabels: Record<string, string> = {
  PENDING: "진행중",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELLED: "취소",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export default function PortalApprovalPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["myApprovals"],
    queryFn: fetchMyApprovals,
  });

  // 모의 데이터
  const mockData = {
    requested: [
      {
        id: "1",
        docNumber: "20241217-LEA-0001",
        type: "LEAVE_REQUEST",
        title: "연차 휴가 신청 (12/25~12/27)",
        status: "PENDING",
        currentStep: 1,
        createdAt: "2024-12-17T10:00:00",
      },
      {
        id: "2",
        docNumber: "20241215-OVT-0003",
        type: "OVERTIME",
        title: "12월 초과근무 신청",
        status: "APPROVED",
        currentStep: 2,
        createdAt: "2024-12-15T14:00:00",
      },
    ],
    toApprove: [
      {
        id: "3",
        docNumber: "20241216-LEA-0005",
        type: "LEAVE_REQUEST",
        title: "연차 휴가 신청 - 박팀원",
        status: "PENDING",
        currentStep: 1,
        createdAt: "2024-12-16T09:00:00",
      },
    ],
  };

  const approvalData = data?.data || mockData;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">결재함</h1>
          <p className="text-gray-500 mt-1">결재 요청 및 승인 현황을 확인합니다.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Send className="w-4 h-4 mr-2" />
          새 결재 요청
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* 결재 대기 (내가 결재할 문서) */}
          {approvalData.toApprove?.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Clock className="w-5 h-5" />
                  결재 대기
                  <Badge className="ml-2 bg-orange-500 text-white">
                    {approvalData.toApprove.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {approvalData.toApprove.map((approval: Approval) => (
                    <div
                      key={approval.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FileCheck className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{approval.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{APPROVAL_DOC_TYPE_LABELS[approval.type as keyof typeof APPROVAL_DOC_TYPE_LABELS]}</span>
                            <span>·</span>
                            <span>{formatKoreanDate(new Date(approval.createdAt))}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                          반려
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          승인
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 내가 요청한 결재 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" />
                내가 요청한 결재
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvalData.requested?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">요청한 결재가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {approvalData.requested?.map((approval: Approval) => (
                    <div
                      key={approval.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          approval.status === "APPROVED" ? "bg-green-100" :
                          approval.status === "REJECTED" ? "bg-red-100" : "bg-blue-100"
                        }`}>
                          {approval.status === "APPROVED" ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : approval.status === "REJECTED" ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{approval.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-mono">{approval.docNumber}</span>
                            <span>·</span>
                            <span>{formatKoreanDate(new Date(approval.createdAt))}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[approval.status]}>
                          {statusLabels[approval.status]}
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
