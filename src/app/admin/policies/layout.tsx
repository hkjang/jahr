'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  FolderTree, 
  History,
  Users,
  LayoutDashboard
} from 'lucide-react';

const navItems = [
  {
    title: '개요',
    href: '/admin/policies',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: '규정 관리',
    href: '/admin/policies/list',
    icon: FileText,
  },
  {
    title: '카테고리',
    href: '/admin/policies/categories',
    icon: FolderTree,
  },
  {
    title: '개정 이력',
    href: '/admin/policies/history',
    icon: History,
  },
  {
    title: '확인 현황',
    href: '/admin/policies/acknowledgments',
    icon: Users,
  },
];

export default function PoliciesLayout({
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
            const isActive = item.exact 
              ? pathname === item.href
              : pathname?.startsWith(item.href);
            
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
