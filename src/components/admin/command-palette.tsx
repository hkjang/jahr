"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Building2,
    Clock,
    Calendar,
    CreditCard,
    TrendingUp,
    GraduationCap,
    FileCheck,
    BarChart3,
    Settings,
    Shield,
    Database,
    Briefcase,
    Sparkles,
    Target,
    Home,
    FolderKanban,
    Plane,
    Heart,
    Award,
    Gift,
    RefreshCw,
    Store,
    DollarSign,
    FileOutput,
    Activity,
    UserCheck,
    Wallet,
    CalendarCheck,
    Search,
    Command,
    ArrowRight,
    FileText,
    Plus,
    Download,
    Upload,
    Mail,
    type LucideIcon,
} from "lucide-react";

interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    action: () => void;
    category: "navigation" | "action" | "recent";
    keywords?: string[];
}

// All navigation items
const navigationItems: Omit<CommandItem, "action" | "category">[] = [
    { id: "dashboard", title: "대시보드", icon: LayoutDashboard, keywords: ["home", "홈", "메인"] },
    { id: "employees", title: "직원 관리", icon: Users, subtitle: "인사 관리", keywords: ["사원", "인원"] },
    { id: "organization", title: "조직 관리", icon: Building2, subtitle: "인사 관리", keywords: ["부서", "팀"] },
    { id: "okr", title: "OKR 관리", icon: Target, subtitle: "OKR/성과", keywords: ["목표", "objective"] },
    { id: "evaluation", title: "평가 관리", icon: TrendingUp, subtitle: "OKR/성과", keywords: ["성과", "리뷰"] },
    { id: "peer-review", title: "다면 평가", icon: Users, subtitle: "OKR/성과", keywords: ["360", "동료"] },
    { id: "attendance", title: "근태 관리", icon: Clock, subtitle: "근태/급여", keywords: ["출퇴근"] },
    { id: "leave", title: "휴가 관리", icon: Calendar, subtitle: "근태/급여", keywords: ["연차", "vacation"] },
    { id: "flex-work", title: "유연 근무", icon: Home, subtitle: "근태/급여", keywords: ["재택", "remote"] },
    { id: "salary", title: "급여 관리", icon: CreditCard, subtitle: "근태/급여", keywords: ["월급", "pay"] },
    { id: "payroll/calculate", title: "급여 계산", icon: DollarSign, subtitle: "근태/급여", keywords: ["payroll"] },
    { id: "training", title: "교육 관리", icon: GraduationCap, subtitle: "인재 개발", keywords: ["연수"] },
    { id: "projects", title: "프로젝트", icon: FolderKanban, subtitle: "인재 개발", keywords: ["project"] },
    { id: "skills", title: "스킬 관리", icon: Briefcase, subtitle: "인재 개발", keywords: ["skill", "역량"] },
    { id: "talent", title: "인재 관리", icon: UserCheck, subtitle: "인재 개발", keywords: ["talent"] },
    { id: "promotions", title: "승진 관리", icon: Award, subtitle: "인재 개발", keywords: ["진급"] },
    { id: "approval", title: "결재 관리", icon: FileCheck, subtitle: "업무", keywords: ["승인"] },
    { id: "reports", title: "통계/리포트", icon: BarChart3, subtitle: "업무", keywords: ["report"] },
    { id: "business-trips", title: "출장 관리", icon: Plane, subtitle: "업무", keywords: ["trip", "여행"] },
    { id: "recruitment/postings", title: "채용 공고", icon: Briefcase, subtitle: "채용 관리", keywords: ["job"] },
    { id: "recruitment/pipeline", title: "파이프라인", icon: TrendingUp, subtitle: "채용 관리", keywords: ["pipeline"] },
    { id: "recruitment/talent-pool", title: "인재풀", icon: Users, subtitle: "채용 관리", keywords: ["pool"] },
    { id: "hr-strategy/workforce", title: "인력 계획", icon: Users, subtitle: "전략 HR", keywords: ["workforce"] },
    { id: "hr-strategy/headcount", title: "정원 관리", icon: Building2, subtitle: "전략 HR", keywords: ["TO"] },
    { id: "hr-strategy/simulation", title: "시뮬레이션", icon: TrendingUp, subtitle: "전략 HR" },
    { id: "hr-strategy/restructure", title: "조직 개편", icon: RefreshCw, subtitle: "전략 HR" },
    { id: "hr-strategy/labor-cost", title: "인건비 예측", icon: DollarSign, subtitle: "전략 HR" },
    { id: "hr-analytics", title: "HR 분석", icon: TrendingUp, subtitle: "전략 HR", keywords: ["analytics"] },
    { id: "policies", title: "인사 규정", icon: FileCheck, subtitle: "규정 관리", keywords: ["policy"] },
    { id: "certificates", title: "증명서", icon: FileCheck, subtitle: "규정 관리", keywords: ["발급"] },
    { id: "compliance", title: "컴플라이언스", icon: Shield, subtitle: "규정 관리" },
    { id: "data-governance", title: "데이터 거버넌스", icon: Database, subtitle: "규정 관리" },
    { id: "ai-settings", title: "AI 설정", icon: Sparkles, subtitle: "시스템", keywords: ["ai"] },
    { id: "ai-insights", title: "AI 인사이트", icon: Activity, subtitle: "시스템", keywords: ["ai"] },
    { id: "permissions", title: "권한 관리", icon: Shield, subtitle: "시스템", keywords: ["권한"] },
    { id: "codes", title: "코드 관리", icon: Database, subtitle: "시스템", keywords: ["공통코드"] },
    { id: "api-management", title: "API 관리", icon: Settings, subtitle: "시스템", keywords: ["api"] },
    { id: "operations", title: "운영 현황", icon: Settings, subtitle: "시스템", keywords: ["운영"] },
    { id: "settings", title: "시스템 설정", icon: Settings, subtitle: "시스템", keywords: ["설정"] },
    { id: "welfare", title: "복리후생", icon: Heart, subtitle: "복리후생", keywords: ["복지"] },
    { id: "insurance/national", title: "국민보험", icon: Shield, subtitle: "복리후생", keywords: ["보험"] },
    { id: "insurance/private", title: "보험 상품", icon: Wallet, subtitle: "복리후생", keywords: ["보험"] },
    { id: "severance", title: "퇴직금", icon: DollarSign, subtitle: "복리후생", keywords: ["퇴직"] },
    { id: "marketplace", title: "마켓플레이스", icon: Store, subtitle: "복리후생", keywords: ["쇼핑"] },
];

// Quick actions
const quickActions: Omit<CommandItem, "action">[] = [
    { id: "action-new-employee", title: "신규 직원 등록", icon: Plus, category: "action", subtitle: "인사 관리" },
    { id: "action-leave-request", title: "휴가 신청 처리", icon: Calendar, category: "action", subtitle: "근태 관리" },
    { id: "action-payroll", title: "급여 계산 실행", icon: DollarSign, category: "action", subtitle: "급여 관리" },
    { id: "action-export", title: "데이터 내보내기", icon: Download, category: "action", subtitle: "데이터" },
    { id: "action-import", title: "데이터 가져오기", icon: Upload, category: "action", subtitle: "데이터" },
    { id: "action-send-notice", title: "공지 발송", icon: Mail, category: "action", subtitle: "알림" },
];

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Build command list
    const commands = useMemo(() => {
        const items: CommandItem[] = [];

        // Navigation items
        navigationItems.forEach((item) => {
            items.push({
                ...item,
                category: "navigation",
                action: () => {
                    router.push(`/admin/${item.id}`);
                    onClose();
                },
            });
        });

        // Quick actions
        quickActions.forEach((item) => {
            items.push({
                ...item,
                action: () => {
                    // Handle action
                    if (item.id === "action-new-employee") router.push("/admin/employees?action=new");
                    else if (item.id === "action-export") router.push("/admin/export");
                    else router.push("/admin/dashboard");
                    onClose();
                },
            });
        });

        return items;
    }, [router, onClose]);

    // Filter commands based on query
    const filteredCommands = useMemo(() => {
        if (!query.trim()) {
            // Show recent + popular items when no query
            return commands.slice(0, 10);
        }

        const q = query.toLowerCase();
        return commands.filter((cmd) => {
            return (
                cmd.title.toLowerCase().includes(q) ||
                cmd.subtitle?.toLowerCase().includes(q) ||
                cmd.keywords?.some((k) => k.toLowerCase().includes(q))
            );
        }).slice(0, 12);
    }, [commands, query]);

    // Reset selection when filtered results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredCommands.length]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < filteredCommands.length - 1 ? prev + 1 : prev
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        filteredCommands[selectedIndex].action();
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, filteredCommands, selectedIndex, onClose]);

    // Reset when closed
    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setSelectedIndex(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        const category = cmd.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(cmd);
        return acc;
    }, {} as Record<string, CommandItem[]>);

    const categoryLabels: Record<string, string> = {
        navigation: "페이지 이동",
        action: "빠른 작업",
        recent: "최근 항목",
    };

    let flatIndex = 0;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[12vh]"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="페이지 이동, 작업 실행..."
                        className="flex-1 bg-transparent text-white text-lg placeholder:text-gray-500 outline-none"
                        autoFocus
                    />
                    <div className="flex items-center gap-1">
                        <kbd className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">ESC</kbd>
                    </div>
                </div>

                {/* Command List */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {Object.entries(groupedCommands).map(([category, items]) => (
                        <div key={category} className="mb-2">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {categoryLabels[category]}
                            </div>
                            {items.map((item) => {
                                const currentIndex = flatIndex++;
                                const isSelected = currentIndex === selectedIndex;
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={item.action}
                                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                                        className={cn(
                                            "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-colors",
                                            isSelected
                                                ? "bg-blue-600/20 text-white"
                                                : "text-gray-300 hover:bg-gray-800/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            isSelected ? "bg-blue-600" : "bg-gray-800"
                                        )}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{item.title}</div>
                                            {item.subtitle && (
                                                <div className="text-sm text-gray-500 truncate">{item.subtitle}</div>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <span>열기</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}

                    {filteredCommands.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>"{query}"에 대한 결과가 없습니다</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <kbd className="bg-gray-800 px-1.5 py-0.5 rounded">↑</kbd>
                            <kbd className="bg-gray-800 px-1.5 py-0.5 rounded">↓</kbd>
                            <span className="ml-1">이동</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-gray-800 px-1.5 py-0.5 rounded">↵</kbd>
                            <span className="ml-1">실행</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Command className="w-3 h-3" />
                        <span>K 로 호출</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hook to use command palette
export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((prev) => !prev),
    };
}
