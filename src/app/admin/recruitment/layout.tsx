'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Briefcase, 
  Users, 
  GitBranch,
  Star,
  FileText,
  LayoutDashboard
} from 'lucide-react';

const navItems = [
  {
    title: '개요',
    href: '/admin/recruitment',
    icon: LayoutDashboard,
  },
  {
    title: '채용 공고',
    href: '/admin/recruitment/postings',
    icon: Briefcase,
  },
  {
    title: '파이프라인',
    href: '/admin/recruitment/pipeline',
    icon: GitBranch,
  },
  {
    title: '인재풀',
    href: '/admin/recruitment/talent-pool',
    icon: Star,
  },
  {
    title: '평가 템플릿',
    href: '/admin/recruitment/templates',
    icon: FileText,
  },
];

export default function RecruitmentLayout({
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
              (item.href !== '/admin/recruitment' && pathname?.startsWith(item.href));
            
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
