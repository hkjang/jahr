"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Label } from "@/components/ui";
import { FileText, Download, Plus, Clock, CheckCircle, XCircle, Send } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";

interface Certificate {
  id: string;
  template: { name: string; type: string };
  purpose: string;
  status: string;
  createdAt: string;
  issuedAt: string | null;
  verificationCode: string;
}

interface Template {
  id: string;
  name: string;
  type: string;
}

async function fetchMyCertificates() {
  const res = await fetch("/api/certificates/me");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function fetchTemplates() {
  const res = await fetch("/api/certificate-templates");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const typeLabels: Record<string, string> = {
  EMPLOYMENT: "재직증명서",
  CAREER: "경력증명서",
  SALARY: "급여증명서",
  POSITION: "직위증명서",
  OTHER: "기타",
};

const statusLabels: Record<string, string> = {
  REQUESTED: "신청중",
  APPROVED: "승인됨",
  ISSUED: "발급완료",
  REJECTED: "반려",
};

const statusColors: Record<string, string> = {
  REQUESTED: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700",
  ISSUED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function PortalCertificatesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    templateId: "",
    purpose: "",
  });

  const { data: certData, isLoading: certLoading } = useQuery({
    queryKey: ["myCertificates"],
    queryFn: fetchMyCertificates,
  });

  const { data: templateData } = useQuery({
    queryKey: ["certificateTemplates"],
    queryFn: fetchTemplates,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/certificates/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCertificates"] });
      setShowForm(false);
      setFormData({ templateId: "", purpose: "" });
      alert("증명서 발급 신청이 완료되었습니다.");
    },
  });

  // 모의 데이터
  const mockCertificates: Certificate[] = [
    {
      id: "1",
      template: { name: "재직증명서", type: "EMPLOYMENT" },
      purpose: "은행 제출용",
      status: "ISSUED",
      createdAt: "2024-12-15T10:00:00",
      issuedAt: "2024-12-15T14:00:00",
      verificationCode: "CERT-2024-0001",
    },
    {
      id: "2",
      template: { name: "급여증명서", type: "SALARY" },
      purpose: "대출 신청용",
      status: "REQUESTED",
      createdAt: "2024-12-17T09:00:00",
      issuedAt: null,
      verificationCode: "CERT-2024-0002",
    },
  ];

  const mockTemplates: Template[] = [
    { id: "1", name: "재직증명서", type: "EMPLOYMENT" },
    { id: "2", name: "경력증명서", type: "CAREER" },
    { id: "3", name: "급여증명서", type: "SALARY" },
    { id: "4", name: "직위증명서", type: "POSITION" },
  ];

  const certificates = certData?.data || mockCertificates;
  const templates = templateData?.data || mockTemplates;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.templateId || !formData.purpose) {
      alert("증명서 종류와 용도를 입력하세요.");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">증명서 발급</h1>
          <p className="text-gray-500 mt-1">각종 증명서를 신청하고 발급받습니다.</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          증명서 신청
        </Button>
      </div>

      {/* 신청 폼 */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-700">증명서 신청</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>증명서 종류 *</Label>
                <select
                  className="w-full p-3 border rounded-lg"
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                >
                  <option value="">선택하세요</option>
                  {templates.map((t: Template) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>발급 용도 *</Label>
                <Input
                  placeholder="예: 은행 대출 신청용"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
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
                  {createMutation.isPending ? "신청 중..." : "신청하기"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 증명서 유형 안내 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(typeLabels).slice(0, 4).map(([type, label]) => (
          <Card 
            key={type} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              const template = templates.find((t: Template) => t.type === type);
              if (template) {
                setFormData({ ...formData, templateId: template.id });
                setShowForm(true);
              }
            }}
          >
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="font-medium">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 신청 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            신청 내역
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : certificates.length === 0 ? (
            <p className="text-center text-gray-500 py-8">신청 내역이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert: Certificate) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      cert.status === "ISSUED" ? "bg-green-100" : "bg-blue-100"
                    }`}>
                      {cert.status === "ISSUED" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : cert.status === "REJECTED" ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{cert.template?.name || typeLabels[cert.template?.type]}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{cert.purpose}</span>
                        <span>·</span>
                        <span>{formatKoreanDate(new Date(cert.createdAt))}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[cert.status]}>
                      {statusLabels[cert.status]}
                    </Badge>
                    {cert.status === "ISSUED" && (
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        다운로드
                      </Button>
                    )}
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
