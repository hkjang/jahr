// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// 검색 필터
export interface SearchFilter {
  query?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  organizationId?: string;
  positionId?: string;
}

// 선택 옵션
export interface SelectOption {
  value: string;
  label: string;
}

// 조직도 트리
export interface OrganizationTreeNode {
  id: string;
  code: string;
  name: string;
  level: string;
  children: OrganizationTreeNode[];
  employeeCount?: number;
}

// 대시보드 통계
export interface DashboardStats {
  totalEmployees: number;
  newHires: number;
  resignations: number;
  attendanceRate: number;
  leaveRequests: number;
  pendingApprovals: number;
}

// 차트 데이터
export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// 테이블 컬럼
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

// 폼 필드
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "date" | "select" | "textarea" | "checkbox";
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  validation?: Record<string, unknown>;
}

// 알림
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// 결재 라인
export interface ApprovalLineItem {
  sequence: number;
  approverId: string;
  approverName: string;
  approverPosition: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SKIPPED";
  comment?: string;
  actedAt?: Date;
}

// 메뉴 아이템
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: MenuItem[];
  permission?: string;
}
