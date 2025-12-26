"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui";
import {
  Users,
  Building2,
  Calendar,
  CreditCard,
  TrendingUp,
  GraduationCap,
  FileCheck,
  BarChart3,
  Shield,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "인사 정보 관리",
    description: "직원 정보, 학력, 경력, 가족 사항 등 통합 관리",
  },
  {
    icon: Building2,
    title: "조직 관리",
    description: "조직도, 직급, 직무 체계 유연한 구성",
  },
  {
    icon: Calendar,
    title: "근태 관리",
    description: "출퇴근, 연차, 휴가 신청 및 승인",
  },
  {
    icon: CreditCard,
    title: "급여 관리",
    description: "급여 계산, 명세서 발급, 세금 처리",
  },
  {
    icon: TrendingUp,
    title: "평가 관리",
    description: "KPI, OKR, 다면 평가 지원",
  },
  {
    icon: GraduationCap,
    title: "교육 관리",
    description: "교육 과정 운영 및 역량 개발 추적",
  },
  {
    icon: FileCheck,
    title: "전자결재",
    description: "휴가, 발령 등 결재 워크플로우",
  },
  {
    icon: BarChart3,
    title: "통계 분석",
    description: "HR 지표 대시보드 및 리포트",
  },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const roles = session?.user?.roles || [];
  const isAdmin = roles.includes("SYSTEM_ADMIN") || roles.includes("HR_ADMIN");
  const isLoggedIn = status === "authenticated";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 네비게이션 */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">JaHR</span>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                      <Shield className="w-4 h-4 mr-2" />
                      어드민 콘솔
                    </Button>
                  </Link>
                )}
                <Link href="/portal/dashboard">
                  <Button className="bg-white text-blue-900 hover:bg-gray-100">
                    포털 바로가기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    로그인
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-white text-blue-900 hover:bg-gray-100">
                    시작하기
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white/80">보안 및 컴플라이언스 준수</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            스마트한{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              HR 인사관리
            </span>
            <br />
            시스템
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            인사 데이터 통합 관리, 업무 자동화, 의사결정 지원을 위한
            차세대 HR 솔루션을 경험하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 h-14 text-lg">
                무료로 시작하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-14 text-lg">
              데모 요청
            </Button>
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="container mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            HR 업무의 모든 것을 한곳에서
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            인사관리에 필요한 모든 기능을 통합하여 효율적인 HR 운영을 지원합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="container mx-auto px-6 pb-32">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            30일 무료 체험으로 JaHR의 모든 기능을 경험해보세요.
            신용카드 없이 시작할 수 있습니다.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 h-14 text-lg">
              무료 체험 시작
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white">JaHR</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 JaHR. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
