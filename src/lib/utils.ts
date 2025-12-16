import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 날짜 포맷
export function formatDate(date: Date | string, formatStr: string = "yyyy-MM-dd"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, { locale: ko });
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, "yyyy-MM-dd HH:mm");
}

export function formatKoreanDate(date: Date | string): string {
  return formatDate(date, "yyyy년 M월 d일");
}

// 사번 생성
export function generateEmployeeId(prefix: string = "EMP"): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${year}${random}`;
}

// 금액 포맷
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(num);
}

export function formatNumber(num: number | string): string {
  const n = typeof num === "string" ? parseFloat(num) : num;
  return new Intl.NumberFormat("ko-KR").format(n);
}

// 문자열 유틸
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 휴대폰 번호 포맷
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return phone;
}

// 근무 시간 계산 (분 -> 시:분)
export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}시간 ${mins}분`;
}

// 페이지네이션
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  delta: number = 2
): (number | "...")[] {
  const range: (number | "...")[] = [];
  const left = currentPage - delta;
  const right = currentPage + delta + 1;
  let l: number | undefined;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i < right)) {
      if (l !== undefined) {
        if (i - l === 2) {
          range.push(l + 1);
        } else if (i - l !== 1) {
          range.push("...");
        }
      }
      range.push(i);
      l = i;
    }
  }

  return range;
}

// 에러 메시지 추출
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "알 수 없는 오류가 발생했습니다.";
}

// 빈 값 체크
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

// 딥 클론
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 디바운스
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 슬러그 생성
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
