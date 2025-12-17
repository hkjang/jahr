"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// 경로 → 한글 레이블 매핑
const pathLabels: Record<string, string> = {
  portal: "포탈",
  admin: "관리자",
  dashboard: "대시보드",
  profile: "내 정보",
  attendance: "근태 관리",
  leave: "휴가",
  salary: "급여",
  evaluation: "평가",
  training: "교육",
  approval: "결재함",
  notifications: "알림",
  settings: "설정",
  employees: "직원 관리",
  organization: "조직 관리",
  recruitment: "채용",
  reports: "리포트",
  certificates: "증명서",
  expense: "경비",
  overtime: "초과근무",
  skills: "스킬",
  marketplace: "마켓플레이스",
  onboarding: "온보딩",
  "ai-insights": "AI 인사이트",
  "api-management": "API 관리",
  codes: "코드 관리",
  compliance: "컴플라이언스",
  "data-governance": "데이터 거버넌스",
  "hr-analytics": "HR 분석",
  "hr-strategy": "HR 전략",
  lifecycle: "라이프사이클",
  operations: "운영",
  permissions: "권한 관리",
  policies: "정책",
};

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  autoGenerate?: boolean;
  showHome?: boolean;
  className?: string;
}

export function Breadcrumb({
  items,
  autoGenerate = true,
  showHome = true,
  className,
}: BreadcrumbProps) {
  const pathname = usePathname();

  // 자동 생성 모드
  const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items && items.length > 0) {
      return items;
    }

    if (!autoGenerate) {
      return [];
    }

    const segments = pathname.split("/").filter(Boolean);
    const generatedItems: BreadcrumbItem[] = [];

    segments.forEach((segment, index) => {
      // ID 같은 동적 세그먼트 스킵 (예: UUID나 숫자)
      if (/^[0-9a-f-]{36}$/i.test(segment) || /^\d+$/.test(segment)) {
        return;
      }

      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = pathLabels[segment] || segment;

      generatedItems.push({ label, href });
    });

    return generatedItems;
  }, [pathname, items, autoGenerate]);

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="브레드크럼"
      className={cn("flex items-center text-sm", className)}
    >
      <ol className="flex items-center gap-1.5">
        {showHome && (
          <>
            <li>
              <Link
                href="/"
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="홈으로"
              >
                <Home className="w-4 h-4" />
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
          </>
        )}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <React.Fragment key={item.href || item.label}>
              <li>
                {isLast || !item.href ? (
                  <span
                    className="font-medium text-gray-900"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
