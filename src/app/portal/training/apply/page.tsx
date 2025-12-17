"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { GraduationCap, Clock, Users, ArrowLeft } from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  type: string;
  description: string | null;
  instructor: string | null;
  duration: number;
  maxCapacity: number | null;
  isActive: boolean;
  _count?: { trainings: number };
}

async function fetchCourses() {
  const res = await fetch("/api/training");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const typeLabels: Record<string, string> = {
  INTERNAL: "사내교육",
  EXTERNAL: "외부교육",
  ONLINE: "온라인",
  SEMINAR: "세미나",
  OFFLINE: "오프라인",
};

export default function TrainingApplyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  const applyMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch("/api/training/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, startDate: new Date().toISOString() }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to apply");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTrainings"] });
      alert("교육 신청이 완료되었습니다.");
      router.push("/portal/training");
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  // 모의 데이터
  const mockCourses: Course[] = [
    {
      id: "1",
      code: "LEAD001",
      name: "리더십 역량 강화",
      type: "INTERNAL",
      description: "팀장급 대상 리더십 교육 과정입니다.",
      instructor: "김교수",
      duration: 16,
      maxCapacity: 20,
      isActive: true,
      _count: { trainings: 15 },
    },
    {
      id: "2",
      code: "NEXT001",
      name: "Next.js 실무 과정",
      type: "ONLINE",
      description: "프론트엔드 개발자를 위한 Next.js 심화 과정",
      instructor: null,
      duration: 40,
      maxCapacity: null,
      isActive: true,
      _count: { trainings: 32 },
    },
    {
      id: "3",
      code: "SEC001",
      name: "정보보안 인식 교육",
      type: "ONLINE",
      description: "전 직원 대상 필수 보안 교육",
      instructor: null,
      duration: 2,
      maxCapacity: null,
      isActive: true,
      _count: { trainings: 145 },
    },
    {
      id: "4",
      code: "COMM001",
      name: "커뮤니케이션 스킬",
      type: "EXTERNAL",
      description: "효과적인 업무 커뮤니케이션 기법",
      instructor: "박강사",
      duration: 8,
      maxCapacity: 15,
      isActive: true,
      _count: { trainings: 8 },
    },
  ];

  const courses = data?.data?.items || mockCourses;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">교육 신청</h1>
          <p className="text-gray-500 mt-1">수강 가능한 교육 과정을 확인하고 신청합니다.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course: Course) => {
            const isFull = course.maxCapacity !== null && 
              (course._count?.trainings || 0) >= course.maxCapacity;
            
            return (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {typeLabels[course.type] || course.type}
                      </Badge>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {course.description && (
                    <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                  )}
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}시간</span>
                    </div>
                    {course.instructor && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{course.instructor}</span>
                      </div>
                    )}
                    {course.maxCapacity && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>정원: {course._count?.trainings || 0}/{course.maxCapacity}명</span>
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => applyMutation.mutate(course.id)}
                    disabled={isFull || applyMutation.isPending}
                  >
                    {applyMutation.isPending ? "신청 중..." : isFull ? "마감" : "신청하기"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
