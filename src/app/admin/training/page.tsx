"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { GraduationCap, Plus, Search, Clock, Users } from "lucide-react";
import { COURSE_TYPE_LABELS } from "@/lib/constants";

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
  _count: { trainings: number };
}

async function fetchCourses() {
  const res = await fetch("/api/training");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function AdminTrainingPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["trainingCourses"],
    queryFn: fetchCourses,
  });

  const filteredCourses = data?.data?.items?.filter((course: Course) =>
    course.name.includes(search) ||
    (course.instructor && course.instructor.includes(search)) ||
    course.code.includes(search)
  ) || [];

  // 통계
  const stats = {
    total: data?.data?.items?.length || 0,
    active: data?.data?.items?.filter((c: Course) => c.isActive).length || 0,
    totalEnrollments: data?.data?.items?.reduce((sum: number, c: Course) => sum + c._count.trainings, 0) || 0,
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">교육 관리</h1>
          <p className="text-gray-400 mt-1">교육 과정을 관리하고 수강 현황을 확인합니다.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          교육 등록
        </Button>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">전체 과정</p>
                <p className="text-xl font-bold text-white">{stats.total}개</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">활성 과정</p>
                <p className="text-xl font-bold text-white">{stats.active}개</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">총 수강인원</p>
                <p className="text-xl font-bold text-white">{stats.totalEnrollments}명</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <Input
            placeholder="교육명, 코드, 강사명으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-gray-900 border-gray-700 text-white max-w-md"
          />
        </CardContent>
      </Card>

      {/* 교육 목록 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            교육 과정
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              등록된 교육 과정이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course: Course) => (
                <div
                  key={course.id}
                  className="bg-gray-900 rounded-xl p-4 hover:bg-gray-800/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {COURSE_TYPE_LABELS[course.type as keyof typeof COURSE_TYPE_LABELS] || course.type}
                    </Badge>
                    {course.isActive ? (
                      <Badge variant="success">활성</Badge>
                    ) : (
                      <Badge variant="default">비활성</Badge>
                    )}
                  </div>
                  <h3 className="text-white font-medium mb-1">{course.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{course.code}</p>
                  {course.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{course.description}</p>
                  )}
                  <div className="space-y-2 text-sm text-gray-400">
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
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      수강: {course._count.trainings}명
                      {course.maxCapacity && ` / ${course.maxCapacity}명`}
                    </span>
                    <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                      상세보기
                    </Button>
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
