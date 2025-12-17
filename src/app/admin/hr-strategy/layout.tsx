'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Building2, 
  Calculator, 
  DollarSign, 
  GitBranch,
  LayoutDashboard
} from 'lucide-react';

const navItems = [
  {
    title: '개요',
    href: '/admin/hr-strategy',
    icon: LayoutDashboard,
  },
  {
    title: '인력 계획',
    href: '/admin/hr-strategy/workforce',
    icon: Users,
  },
  {
    title: '정원 관리',
    href: '/admin/hr-strategy/headcount',
    icon: Building2,
  },
  {
    title: '시나리오 분석',
    href: '/admin/hr-strategy/simulation',
    icon: Calculator,
  },
  {
    title: '인건비 예측',
    href: '/admin/hr-strategy/labor-cost',
    icon: DollarSign,
  },
  {
    title: '조직 개편',
    href: '/admin/hr-strategy/restructure',
    icon: GitBranch,
  },
];

export default function HRStrategyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="border-b">
        <nav className="flex space-x-4 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin/hr-strategy' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
