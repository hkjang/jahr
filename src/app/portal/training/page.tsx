"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { GraduationCap, Clock, Calendar, Users, ChevronRight, BookOpen } from "lucide-react";
import { formatKoreanDate } from "@/lib/utils";
import { COURSE_TYPE_LABELS } from "@/lib/constants";

interface Training {
  id: string;
  course: {
    id: string;
    name: string;
    type: string;
    description: string | null;
    instructor: string | null;
    duration: number;
  };
  startDate: string;
  endDate: string | null;
  status: string;
  score: number | null;
}

async function fetchMyTrainings() {
  const res = await fetch("/api/training/me");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const statusLabels: Record<string, string> = {
  ENROLLED: "수강 예정",
  IN_PROGRESS: "수강 중",
  COMPLETED: "완료",
  CANCELLED: "취소됨",
};

const statusColors: Record<string, string> = {
  ENROLLED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export default function PortalTrainingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["myTrainings"],
    queryFn: fetchMyTrainings,
  });

  // 모의 데이터
  const mockTrainings: Training[] = [
    {
      id: "1",
      course: {
        id: "c1",
        name: "리더십 역량 강화",
        type: "INTERNAL",
        description: "팀장급 대상 리더십 교육",
        instructor: "김교수",
        duration: 16,
      },
      startDate: "2024-12-20",
      endDate: "2024-12-21",
      status: "ENROLLED",
      score: null,
    },
    {
      id: "2",
      course: {
        id: "c2",
        name: "Next.js 실무 과정",
        type: "ONLINE",
        description: "프론트엔드 개발 실무",
        instructor: null,
        duration: 40,
      },
      startDate: "2024-11-01",
      endDate: null,
      status: "IN_PROGRESS",
      score: null,
    },
    {
      id: "3",
      course: {
        id: "c3",
        name: "보안 인식 교육",
        type: "ONLINE",
        description: "연간 필수 보안 교육",
        instructor: null,
        duration: 2,
      },
      startDate: "2024-10-15",
      endDate: "2024-10-15",
      status: "COMPLETED",
      score: 95,
    },
  ];

  const trainings = data?.data || mockTrainings;
  const inProgress = trainings.filter((t: Training) => t.status === "IN_PROGRESS" || t.status === "ENROLLED");
  const completed = trainings.filter((t: Training) => t.status === "COMPLETED");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">내 교육</h1>
          <p className="text-gray-500 mt-1">교육 수강 현황을 확인합니다.</p>
        </div>
        <Button variant="outline">
          <BookOpen className="w-4 h-4 mr-2" />
          교육 신청
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* 진행 중인 교육 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                진행 중인 교육
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inProgress.length === 0 ? (
                <p className="text-center text-gray-500 py-8">진행 중인 교육이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {inProgress.map((training: Training) => (
                    <div
                      key={training.id}
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{training.course.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {training.course.duration}시간
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatKoreanDate(new Date(training.startDate))}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[training.status]}>
                          {statusLabels[training.status]}
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 완료한 교육 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-500" />
                수료한 교육
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completed.length === 0 ? (
                <p className="text-center text-gray-500 py-8">수료한 교육이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {completed.map((training: Training) => (
                    <div
                      key={training.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{training.course.name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatKoreanDate(new Date(training.startDate))} 수료
                          </p>
                        </div>
                      </div>
                      {training.score && (
                        <div className="text-right">
                          <div className="text-sm text-gray-500">점수</div>
                          <div className="text-lg font-bold text-green-600">{training.score}점</div>
                        </div>
                      )}
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
