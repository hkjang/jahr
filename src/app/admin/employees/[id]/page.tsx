"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import {
  User,
  Building2,
  Calendar,
  Mail,
  Phone,
  ArrowLeft,
  Edit,
  GraduationCap,
  Briefcase,
  Users as UsersIcon,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatKoreanDate } from "@/lib/utils";
import { EMPLOYMENT_TYPE_LABELS, WORK_TYPE_LABELS, USER_STATUS_LABELS, DEGREE_LABELS, RELATION_LABELS } from "@/lib/constants";

async function fetchEmployee(id: string) {
  const res = await fetch(`/api/employees/${id}`);
  if (!res.ok) throw new Error("Failed to fetch employee");
  return res.json();
}

export default function AdminEmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployee(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">직원 정보를 불러올 수 없습니다.</p>
        <Link href="/admin/employees">
          <Button variant="outline" className="mt-4">
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  const employee = data.data;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/employees">
            <Button variant="ghost" size="icon" className="text-gray-400">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">직원 상세</h1>
        </div>
        <Link href={`/admin/employees/${id}/edit`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Edit className="w-4 h-4 mr-2" />
            수정
          </Button>
        </Link>
      </div>

      {/* 프로필 카드 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar size="xl" className="w-24 h-24">
              <AvatarImage src={employee.user.profileImage || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                {employee.user.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{employee.user.name}</h2>
                <Badge variant={employee.user.status === "ACTIVE" ? "success" : "default"}>
                  {USER_STATUS_LABELS[employee.user.status as keyof typeof USER_STATUS_LABELS]}
                </Badge>
              </div>
              <p className="text-gray-400 mb-4">{employee.user.employeeId}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  {employee.organization.name}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-4 h-4 text-gray-500" />
                  {employee.position.name}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {employee.user.email}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {employee.user.phoneNumber || "-"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상세 정보 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-gray-400">입사일</dt>
                <dd className="text-white">{formatKoreanDate(new Date(employee.hireDate))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">고용형태</dt>
                <dd className="text-white">
                  {EMPLOYMENT_TYPE_LABELS[employee.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS]}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">근무형태</dt>
                <dd className="text-white">
                  {WORK_TYPE_LABELS[employee.workType as keyof typeof WORK_TYPE_LABELS]}
                </dd>
              </div>
              {employee.user.birthDate && (
                <div className="flex justify-between">
                  <dt className="text-gray-400">생년월일</dt>
                  <dd className="text-white">{formatKoreanDate(new Date(employee.user.birthDate))}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* 연차 현황 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              연차 현황 ({new Date().getFullYear()}년)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employee.leaveBalances && employee.leaveBalances.length > 0 ? (
              <div className="space-y-4">
                {employee.leaveBalances.map((balance: { id: string; leaveType: string; totalDays: number; usedDays: number }) => (
                  <div key={balance.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">{balance.leaveType === "ANNUAL" ? "연차" : balance.leaveType}</span>
                      <span className="text-white">
                        {balance.usedDays}/{balance.totalDays}일 사용
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                        style={{ width: `${(balance.usedDays / balance.totalDays) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">등록된 연차 정보가 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 학력 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              학력
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employee.educations && employee.educations.length > 0 ? (
              <div className="space-y-4">
                {employee.educations.map((edu: { id: string; schoolName: string; degree: string; major?: string; startDate: string; endDate?: string; graduated: boolean }) => (
                  <div key={edu.id} className="border-b border-gray-700 pb-4 last:border-0">
                    <p className="text-white font-medium">{edu.schoolName}</p>
                    <p className="text-sm text-gray-400">
                      {DEGREE_LABELS[edu.degree as keyof typeof DEGREE_LABELS]} · {edu.major}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatKoreanDate(new Date(edu.startDate))} ~{" "}
                      {edu.endDate ? formatKoreanDate(new Date(edu.endDate)) : "재학중"}
                      {edu.graduated && " (졸업)"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">등록된 학력 정보가 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 경력 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-orange-400" />
              경력
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employee.careers && employee.careers.length > 0 ? (
              <div className="space-y-4">
                {employee.careers.map((career: { id: string; companyName: string; position: string; startDate: string; endDate?: string }) => (
                  <div key={career.id} className="border-b border-gray-700 pb-4 last:border-0">
                    <p className="text-white font-medium">{career.companyName}</p>
                    <p className="text-sm text-gray-400">{career.position}</p>
                    <p className="text-xs text-gray-500">
                      {formatKoreanDate(new Date(career.startDate))} ~{" "}
                      {career.endDate ? formatKoreanDate(new Date(career.endDate)) : "현재"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">등록된 경력 정보가 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 가족 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-pink-400" />
              가족
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employee.families && employee.families.length > 0 ? (
              <div className="space-y-3">
                {employee.families.map((family: { id: string; name: string; relation: string; birthDate?: string }) => (
                  <div key={family.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-white">{family.name}</p>
                      <p className="text-sm text-gray-400">
                        {RELATION_LABELS[family.relation as keyof typeof RELATION_LABELS]}
                      </p>
                    </div>
                    {family.birthDate && (
                      <span className="text-sm text-gray-500">
                        {formatKoreanDate(new Date(family.birthDate))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">등록된 가족 정보가 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 문서 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              문서
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employee.documents && employee.documents.length > 0 ? (
              <div className="space-y-3">
                {employee.documents.map((doc: { id: string; name: string; type: string; uploadedAt: string }) => (
                  <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-white">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatKoreanDate(new Date(doc.uploadedAt))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">등록된 문서가 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
