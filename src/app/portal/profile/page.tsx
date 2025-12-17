"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { 
  User, Mail, Phone, Building2, Briefcase, Calendar, 
  MapPin, Clock, Edit, Camera 
} from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";
import { EMPLOYMENT_TYPE_LABELS, WORK_TYPE_LABELS } from "@/lib/constants";

interface EmployeeProfile {
  id: string;
  user: {
    name: string;
    email: string;
    phoneNumber: string | null;
    birthDate: string | null;
    profileImage: string | null;
    employeeId: string;
  };
  organization: { name: string };
  position: { name: string };
  jobTitle: { name: string } | null;
  hireDate: string;
  employmentType: string;
  workType: string;
}

async function fetchProfile() {
  const res = await fetch("/api/employees/me");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: fetchProfile,
  });

  const profile: EmployeeProfile | null = data?.data || null;

  // 임시 프로필 데이터 (API가 없을 때)
  const displayProfile = profile || {
    id: "1",
    user: {
      name: session?.user?.name || "사용자",
      email: session?.user?.email || "user@example.com",
      phoneNumber: "010-1234-5678",
      birthDate: "1990-01-01",
      profileImage: null,
      employeeId: "EMP001",
    },
    organization: { name: "개발팀" },
    position: { name: "선임" },
    jobTitle: { name: "팀원" },
    hireDate: "2022-03-15",
    employmentType: "REGULAR",
    workType: "HYBRID",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 프로필 헤더 */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                {displayProfile.user.profileImage ? (
                  <img 
                    src={displayProfile.user.profileImage} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{displayProfile.user.name}</h1>
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  {displayProfile.user.employeeId}
                </Badge>
              </div>
              <p className="text-white/80">
                {displayProfile.organization.name} · {displayProfile.position.name}
                {displayProfile.jobTitle && ` · ${displayProfile.jobTitle.name}`}
              </p>
              <div className="flex items-center gap-4 mt-3 text-white/70 text-sm">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {displayProfile.user.email}
                </span>
                {displayProfile.user.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {displayProfile.user.phoneNumber}
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
              <Edit className="w-4 h-4 mr-2" />
              수정
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 기본 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">이름</span>
              <span className="font-medium">{displayProfile.user.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">사번</span>
              <span className="font-medium">{displayProfile.user.employeeId}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">이메일</span>
              <span className="font-medium">{displayProfile.user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">전화번호</span>
              <span className="font-medium">{displayProfile.user.phoneNumber || "-"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">생년월일</span>
              <span className="font-medium">
                {displayProfile.user.birthDate 
                  ? formatKoreanDate(new Date(displayProfile.user.birthDate))
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              직무 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">소속</span>
              <span className="font-medium">{displayProfile.organization.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">직급</span>
              <span className="font-medium">{displayProfile.position.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">직책</span>
              <span className="font-medium">{displayProfile.jobTitle?.name || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">입사일</span>
              <span className="font-medium">
                {formatKoreanDate(new Date(displayProfile.hireDate))}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">고용형태</span>
              <span className="font-medium">
                {EMPLOYMENT_TYPE_LABELS[displayProfile.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS]}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">근무형태</span>
              <span className="font-medium">
                {WORK_TYPE_LABELS[displayProfile.workType as keyof typeof WORK_TYPE_LABELS]}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
