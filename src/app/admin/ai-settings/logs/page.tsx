// AI Call Logs Admin Page
// AI 호출 로그 조회 (감사용)

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Search, Loader2, RefreshCw } from "lucide-react";
import { AI_FEATURE_LABELS } from "@/types/ai-provider";
import type { AIFeatureType } from "@/types/ai-provider";

interface CallLog {
  id: string;
  providerId?: string;
  providerName?: string;
  providerType?: string;
  userId: string;
  featureType: AIFeatureType;
  modelId: string;
  requestSummary?: string;
  responseLength?: number;
  latencyMs?: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  status: string;
  errorMessage?: string;
  ipAddress?: string;
  createdAt: string;
}

interface Stats {
  total: number;
  byStatus: Record<string, number>;
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SUCCESS: "default",
  ERROR: "destructive",
  TIMEOUT: "secondary",
  RATE_LIMITED: "outline",
};

export default function AICallLogsPage() {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });

  // 필터
  const [filters, setFilters] = useState({
    status: "",
    featureType: "",
    startDate: "",
    endDate: "",
  });

  // 로그 로드
  const loadLogs = async (resetOffset = false) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("limit", pagination.limit.toString());
      params.set("offset", resetOffset ? "0" : pagination.offset.toString());

      if (filters.status) params.set("status", filters.status);
      if (filters.featureType) params.set("featureType", filters.featureType);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      const res = await fetch(`/api/admin/ai-call-logs?${params}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(true);
  }, [filters]);

  const handlePageChange = (direction: "next" | "prev") => {
    if (direction === "next" && pagination.hasMore) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    } else if (direction === "prev" && pagination.offset > 0) {
      setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
    }
  };

  useEffect(() => {
    if (pagination.offset > 0) {
      loadLogs(false);
    }
  }, [pagination.offset]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => window.location.href = "/admin/ai-settings"}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">AI 호출 로그</h1>
          <p className="text-gray-400 mt-1">
            AI 사용 이력 및 감사 로그
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">전체</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-400">성공</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-400">{stats.byStatus.SUCCESS || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-400">오류</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-400">{stats.byStatus.ERROR || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-400">타임아웃</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-400">{stats.byStatus.TIMEOUT || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-400">제한 초과</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-400">{stats.byStatus.RATE_LIMITED || 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>상태</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="SUCCESS">성공</SelectItem>
                  <SelectItem value="ERROR">오류</SelectItem>
                  <SelectItem value="TIMEOUT">타임아웃</SelectItem>
                  <SelectItem value="RATE_LIMITED">제한 초과</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>기능</Label>
              <Select
                value={filters.featureType}
                onValueChange={(v) => setFilters({ ...filters, featureType: v === "all" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {Object.entries(AI_FEATURE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>시작일</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>종료일</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={() => loadLogs(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>조회된 로그가 없습니다</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>시간</TableHead>
                    <TableHead>기능</TableHead>
                    <TableHead>모델</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>응답시간</TableHead>
                    <TableHead>토큰</TableHead>
                    <TableHead>사용자</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {AI_FEATURE_LABELS[log.featureType] || log.featureType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{log.modelId}</div>
                        {log.providerName && (
                          <div className="text-xs text-muted-foreground">{log.providerName}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[log.status] || "secondary"}>
                          {log.status}
                        </Badge>
                        {log.errorMessage && (
                          <div className="text-xs text-red-500 mt-1 max-w-[200px] truncate">
                            {log.errorMessage}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.latencyMs ? `${log.latencyMs}ms` : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.tokenUsage ? (
                          <div className="text-xs">
                            <div>In: {log.tokenUsage.promptTokens}</div>
                            <div>Out: {log.tokenUsage.completionTokens}</div>
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="truncate max-w-[100px]">{log.userId}</div>
                        {log.ipAddress && (
                          <div className="text-xs text-muted-foreground">{log.ipAddress}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} / {pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.offset === 0}
                    onClick={() => handlePageChange("prev")}
                  >
                    이전
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasMore}
                    onClick={() => handlePageChange("next")}
                  >
                    다음
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
