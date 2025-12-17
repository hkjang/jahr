"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { FileText, Download, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";

interface Certificate {
  id: string;
  type: string;
  purpose: string;
  status: string;
  requestedAt: string;
  issuedAt: string | null;
  expiryDate: string | null;
  verificationCode: string;
}

const typeLabels: Record<string, string> = {
  EMPLOYMENT: "재직증명서",
  CAREER: "경력증명서",
  SALARY: "급여증명서",
  POSITION: "직위증명서",
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
  const [showRequestModal, setShowRequestModal] = useState(false);

  // 모의 데이터
  const certificates: Certificate[] = [
    {
      id: "1",
      type: "EMPLOYMENT",
      purpose: "은행 제출용",
      status: "ISSUED",
      requestedAt: "2024-12-15T10:00:00",
      issuedAt: "2024-12-15T14:00:00",
      expiryDate: "2025-01-15",
      verificationCode: "CERT-2024-0001",
    },
    {
      id: "2",
      type: "SALARY",
      purpose: "대출 신청용",
      status: "REQUESTED",
      requestedAt: "2024-12-17T09:00:00",
      issuedAt: null,
      expiryDate: null,
      verificationCode: "CERT-2024-0002",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">증명서 발급</h1>
          <p className="text-gray-500 mt-1">각종 증명서를 신청하고 발급받습니다.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          증명서 신청
        </Button>
      </div>

      {/* 증명서 유형 안내 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(typeLabels).map(([type, label]) => (
          <Card key={type} className="cursor-pointer hover:shadow-md transition-shadow">
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
          {certificates.length === 0 ? (
            <p className="text-center text-gray-500 py-8">신청 내역이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert) => (
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
                      <h4 className="font-medium">{typeLabels[cert.type]}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{cert.purpose}</span>
                        <span>·</span>
                        <span>{formatKoreanDate(new Date(cert.requestedAt))}</span>
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
