"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { FileCheck, Search, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";
import { APPROVAL_DOC_TYPE_LABELS, APPROVAL_STATUS_LABELS } from "@/lib/constants";

interface ApprovalLine {
  id: string;
  sequence: number;
  status: string;
  comment: string | null;
  actedAt: string | null;
  approver: { name: string };
}

interface Approval {
  id: string;
  docNumber: string;
  type: string;
  title: string;
  status: string;
  currentStep: number;
  createdAt: string;
  completedAt: string | null;
  requester: { name: string; employeeId: string };
  lines: ApprovalLine[];
}

async function fetchApprovals(page: number, status?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: "20",
    ...(status && { status }),
  });
  const res = await fetch(`/api/approvals?${params}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function AdminApprovalPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["approvals", page, statusFilter],
    queryFn: () => fetchApprovals(page, statusFilter),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="success">승인</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">반려</Badge>;
      case "CANCELLED":
        return <Badge variant="default">취소</Badge>;
      default:
        return <Badge variant="warning">진행중</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  // 통계
  const stats = {
    total: data?.data?.total || 0,
    pending: data?.data?.items?.filter((a: Approval) => a.status === "PENDING").length || 0,
    approved: data?.data?.items?.filter((a: Approval) => a.status === "APPROVED").length || 0,
    rejected: data?.data?.items?.filter((a: Approval) => a.status === "REJECTED").length || 0,
  };

  const filteredApprovals = data?.data?.items?.filter((approval: Approval) =>
    approval.title.includes(search) ||
    approval.docNumber.includes(search) ||
    approval.requester.name.includes(search)
  ) || [];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">결재 관리</h1>
          <p className="text-gray-400 mt-1">전자결재 문서를 관리합니다.</p>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
            statusFilter === "" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setStatusFilter("")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">전체</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
            statusFilter === "PENDING" ? "ring-2 ring-yellow-500" : ""
          }`}
          onClick={() => setStatusFilter("PENDING")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">진행중</p>
                <p className="text-xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
            statusFilter === "APPROVED" ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => setStatusFilter("APPROVED")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">승인</p>
                <p className="text-xl font-bold text-white">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
            statusFilter === "REJECTED" ? "ring-2 ring-red-500" : ""
          }`}
          onClick={() => setStatusFilter("REJECTED")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">반려</p>
                <p className="text-xl font-bold text-white">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <Input
            placeholder="문서번호, 제목, 신청자로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-gray-900 border-gray-700 text-white max-w-md"
          />
        </CardContent>
      </Card>

      {/* 결재 목록 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-400" />
            결재 문서
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              결재 문서가 없습니다.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">문서번호</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">유형</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">제목</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">신청자</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">신청일</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">결재선</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApprovals.map((approval: Approval) => (
                      <tr
                        key={approval.id}
                        className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer"
                      >
                        <td className="py-4 px-4">
                          <span className="text-blue-400 font-mono text-sm">{approval.docNumber}</span>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {APPROVAL_DOC_TYPE_LABELS[approval.type as keyof typeof APPROVAL_DOC_TYPE_LABELS] || approval.type}
                        </td>
                        <td className="py-4 px-4 text-white">{approval.title}</td>
                        <td className="py-4 px-4 text-gray-300">{approval.requester.name}</td>
                        <td className="py-4 px-4 text-gray-400">
                          {formatKoreanDate(new Date(approval.createdAt))}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {approval.lines.map((line, idx) => (
                              <div
                                key={line.id}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                  line.status === "APPROVED"
                                    ? "bg-green-500 text-white"
                                    : line.status === "REJECTED"
                                    ? "bg-red-500 text-white"
                                    : idx + 1 === approval.currentStep
                                    ? "bg-yellow-500 text-white"
                                    : "bg-gray-600 text-gray-300"
                                }`}
                                title={line.approver.name}
                              >
                                {idx + 1}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">{getStatusBadge(approval.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {data?.data?.totalPages > 1 && (
                <div className="flex items-center justify-center mt-6 gap-2">
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
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
