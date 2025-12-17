// 데이터 마스킹 유틸리티
// Phase 3.1: 주민번호, 연봉 등 민감 정보 마스킹

// ========================================
// 타입 정의
// ========================================

export type MaskType = 
  | "ssn"           // 주민등록번호
  | "phone"         // 전화번호
  | "email"         // 이메일
  | "name"          // 이름
  | "bankAccount"   // 계좌번호
  | "salary"        // 급여
  | "address"       // 주소
  | "creditCard";   // 신용카드

export interface MaskOptions {
  showFirst?: number;
  showLast?: number;
  maskChar?: string;
  preserveFormat?: boolean;
}

// ========================================
// 마스킹 함수
// ========================================

/**
 * 주민등록번호 마스킹
 * 123456-1234567 → 123456-1******
 */
export function maskSSN(ssn: string): string {
  if (!ssn) return "";
  
  // 하이픈 제거 후 처리
  const cleaned = ssn.replace(/-/g, "");
  if (cleaned.length !== 13) return ssn;
  
  return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 7)}******`;
}

/**
 * 전화번호 마스킹
 * 010-1234-5678 → 010-****-5678
 */
export function maskPhone(phone: string): string {
  if (!phone) return "";
  
  // 숫자만 추출
  const digits = phone.replace(/\D/g, "");
  
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
  } else if (digits.length === 10) {
    return `${digits.slice(0, 3)}-***-${digits.slice(-4)}`;
  }
  
  return phone.replace(/\d(?=\d{4})/g, "*");
}

/**
 * 이메일 마스킹
 * user@example.com → u***@example.com
 */
export function maskEmail(email: string): string {
  if (!email) return "";
  
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  
  const maskedLocal = local.length <= 2 
    ? local[0] + "*" 
    : local[0] + "*".repeat(local.length - 2) + local.slice(-1);
  
  return `${maskedLocal}@${domain}`;
}

/**
 * 이름 마스킹
 * 홍길동 → 홍*동
 * John Doe → J*** D**
 */
export function maskName(name: string): string {
  if (!name) return "";
  
  const parts = name.trim().split(" ");
  
  if (parts.length === 1) {
    // 한글 이름 (단일 단어)
    const chars = [...name];
    if (chars.length <= 2) {
      return chars[0] + "*".repeat(chars.length - 1);
    }
    return chars[0] + "*".repeat(chars.length - 2) + chars[chars.length - 1];
  }
  
  // 영문 이름 또는 공백 구분된 이름
  return parts.map((part) => {
    if (part.length <= 1) return part;
    return part[0] + "*".repeat(part.length - 1);
  }).join(" ");
}

/**
 * 계좌번호 마스킹
 * 123-456-789012 → ***-***-**9012
 */
export function maskBankAccount(account: string): string {
  if (!account) return "";
  
  // 숫자만 추출
  const digits = account.replace(/\D/g, "");
  
  if (digits.length < 4) return "*".repeat(digits.length);
  
  return "*".repeat(digits.length - 4) + digits.slice(-4);
}

/**
 * 급여 마스킹
 * 5000000 → *******
 * 권한에 따라 전체 또는 대략적인 금액 표시
 */
export function maskSalary(
  salary: number | string,
  options?: { showRange?: boolean }
): string {
  if (!salary) return "";
  
  const amount = typeof salary === "string" ? parseFloat(salary) : salary;
  
  if (options?.showRange) {
    // 백만 단위 범위로 표시
    const millions = Math.floor(amount / 1000000);
    return `${millions}00만원대`;
  }
  
  return "*".repeat(String(amount).length);
}

/**
 * 주소 마스킹
 * 서울시 강남구 테헤란로 123 → 서울시 강남구 ****
 */
export function maskAddress(address: string): string {
  if (!address) return "";
  
  const parts = address.split(" ");
  if (parts.length <= 2) {
    return parts[0] + " ****";
  }
  
  return parts.slice(0, 2).join(" ") + " ****";
}

/**
 * 신용카드 마스킹
 * 1234-5678-9012-3456 → ****-****-****-3456
 */
export function maskCreditCard(cardNumber: string): string {
  if (!cardNumber) return "";
  
  const digits = cardNumber.replace(/\D/g, "");
  
  if (digits.length < 4) return "*".repeat(digits.length);
  
  const last4 = digits.slice(-4);
  const masked = "*".repeat(digits.length - 4);
  
  // 4자리씩 분리
  const formatted = (masked + last4).match(/.{1,4}/g);
  return formatted ? formatted.join("-") : cardNumber;
}

// ========================================
// 범용 마스킹 함수
// ========================================

/**
 * 범용 마스킹 함수
 */
export function mask(
  value: string | number | null | undefined,
  type: MaskType,
  options?: MaskOptions
): string {
  if (value === null || value === undefined) return "";
  
  const strValue = String(value);
  
  switch (type) {
    case "ssn":
      return maskSSN(strValue);
    case "phone":
      return maskPhone(strValue);
    case "email":
      return maskEmail(strValue);
    case "name":
      return maskName(strValue);
    case "bankAccount":
      return maskBankAccount(strValue);
    case "salary":
      return maskSalary(strValue);
    case "address":
      return maskAddress(strValue);
    case "creditCard":
      return maskCreditCard(strValue);
    default:
      return maskGeneric(strValue, options);
  }
}

/**
 * 일반 문자열 마스킹
 */
export function maskGeneric(value: string, options?: MaskOptions): string {
  if (!value) return "";
  
  const {
    showFirst = 0,
    showLast = 0,
    maskChar = "*",
  } = options || {};
  
  if (value.length <= showFirst + showLast) {
    return maskChar.repeat(value.length);
  }
  
  const first = value.slice(0, showFirst);
  const last = value.slice(-showLast);
  const middle = maskChar.repeat(value.length - showFirst - showLast);
  
  return first + middle + last;
}

// ========================================
// 객체 마스킹
// ========================================

export interface MaskingRule {
  field: string;
  type: MaskType;
  options?: MaskOptions;
}

/**
 * 객체의 특정 필드들을 마스킹
 */
export function maskObject<T extends Record<string, unknown>>(
  obj: T,
  rules: MaskingRule[]
): T {
  const result = { ...obj };
  
  for (const rule of rules) {
    const value = result[rule.field];
    if (value !== undefined && value !== null) {
      (result as Record<string, unknown>)[rule.field] = mask(
        value as string | number,
        rule.type,
        rule.options
      );
    }
  }
  
  return result;
}

/**
 * 배열의 각 객체를 마스킹
 */
export function maskArray<T extends Record<string, unknown>>(
  arr: T[],
  rules: MaskingRule[]
): T[] {
  return arr.map((obj) => maskObject(obj, rules));
}

// ========================================
// 민감 정보 필드 정의
// ========================================

export const SENSITIVE_FIELDS: Record<string, MaskingRule[]> = {
  Employee: [
    { field: "birthDate", type: "ssn" },
    { field: "phoneNumber", type: "phone" },
  ],
  User: [
    { field: "email", type: "email" },
    { field: "phoneNumber", type: "phone" },
  ],
  Salary: [
    { field: "baseSalary", type: "salary" },
    { field: "netSalary", type: "salary" },
    { field: "totalEarnings", type: "salary" },
  ],
  Family: [
    { field: "name", type: "name" },
    { field: "contact", type: "phone" },
  ],
};
