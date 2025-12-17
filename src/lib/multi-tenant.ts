// 멀티 테넌트 및 글로벌 지원 서비스
// Phase 6: 멀티 법인, 다국어, 다통화, 국가별 법규, 타임존

// ========================================
// 타입 정의
// ========================================

export interface TenantConfig {
  id: string;
  name: string;
  code: string;
  country: string;
  currency: string;
  timezone: string;
  locale: string;
  policies: TenantPolicies;
}

export interface TenantPolicies {
  annualLeaveBase: number;
  maxCarryoverDays: number;
  probationMonths: number;
  workHoursPerDay: number;
  workDaysPerWeek: number;
  overtimeMultiplier: number;
}

export interface LocaleStrings {
  [key: string]: string | LocaleStrings;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  decimalPlaces: number;
  thousandSeparator: string;
  decimalSeparator: string;
}

// ========================================
// 기본 설정
// ========================================

// 지원 국가별 기본 정책
export const COUNTRY_DEFAULTS: Record<string, Partial<TenantPolicies>> = {
  KR: {
    annualLeaveBase: 15,
    maxCarryoverDays: 0, // 한국: 이월 제한
    probationMonths: 3,
    workHoursPerDay: 8,
    workDaysPerWeek: 5,
    overtimeMultiplier: 1.5,
  },
  US: {
    annualLeaveBase: 10,
    maxCarryoverDays: 5,
    probationMonths: 3,
    workHoursPerDay: 8,
    workDaysPerWeek: 5,
    overtimeMultiplier: 1.5,
  },
  JP: {
    annualLeaveBase: 10,
    maxCarryoverDays: 40, // 일본: 2년 이월
    probationMonths: 6,
    workHoursPerDay: 8,
    workDaysPerWeek: 5,
    overtimeMultiplier: 1.25,
  },
  DE: {
    annualLeaveBase: 20, // 독일: 법정 20일
    maxCarryoverDays: 0,
    probationMonths: 6,
    workHoursPerDay: 8,
    workDaysPerWeek: 5,
    overtimeMultiplier: 1.25,
  },
};

// 지원 통화
export const CURRENCIES: Record<string, CurrencyConfig> = {
  KRW: { code: "KRW", symbol: "₩", decimalPlaces: 0, thousandSeparator: ",", decimalSeparator: "." },
  USD: { code: "USD", symbol: "$", decimalPlaces: 2, thousandSeparator: ",", decimalSeparator: "." },
  EUR: { code: "EUR", symbol: "€", decimalPlaces: 2, thousandSeparator: ".", decimalSeparator: "," },
  JPY: { code: "JPY", symbol: "¥", decimalPlaces: 0, thousandSeparator: ",", decimalSeparator: "." },
  CNY: { code: "CNY", symbol: "¥", decimalPlaces: 2, thousandSeparator: ",", decimalSeparator: "." },
};

// 지원 타임존
export const TIMEZONES = [
  "Asia/Seoul",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
];

// 다국어 문자열 (기본 한국어/영어)
export const LOCALE_STRINGS: Record<string, LocaleStrings> = {
  ko: {
    common: {
      save: "저장",
      cancel: "취소",
      confirm: "확인",
      delete: "삭제",
      edit: "수정",
      search: "검색",
      loading: "로딩 중...",
      noData: "데이터가 없습니다",
    },
    menu: {
      dashboard: "대시보드",
      employees: "직원 관리",
      attendance: "근태 관리",
      leave: "휴가 관리",
      salary: "급여 관리",
      evaluation: "인사 평가",
      reports: "리포트",
      settings: "설정",
    },
    employee: {
      name: "이름",
      email: "이메일",
      department: "부서",
      position: "직급",
      hireDate: "입사일",
      status: "상태",
    },
    leave: {
      annual: "연차",
      sick: "병가",
      personal: "개인휴가",
      maternity: "출산휴가",
      paternity: "배우자출산휴가",
      bereavement: "경조휴가",
    },
  },
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      loading: "Loading...",
      noData: "No data available",
    },
    menu: {
      dashboard: "Dashboard",
      employees: "Employees",
      attendance: "Attendance",
      leave: "Leave",
      salary: "Payroll",
      evaluation: "Evaluation",
      reports: "Reports",
      settings: "Settings",
    },
    employee: {
      name: "Name",
      email: "Email",
      department: "Department",
      position: "Position",
      hireDate: "Hire Date",
      status: "Status",
    },
    leave: {
      annual: "Annual Leave",
      sick: "Sick Leave",
      personal: "Personal Leave",
      maternity: "Maternity Leave",
      paternity: "Paternity Leave",
      bereavement: "Bereavement Leave",
    },
  },
  ja: {
    common: {
      save: "保存",
      cancel: "キャンセル",
      confirm: "確認",
      delete: "削除",
      edit: "編集",
      search: "検索",
      loading: "読み込み中...",
      noData: "データがありません",
    },
    menu: {
      dashboard: "ダッシュボード",
      employees: "社員管理",
      attendance: "勤怠管理",
      leave: "休暇管理",
      salary: "給与管理",
      evaluation: "人事評価",
      reports: "レポート",
      settings: "設定",
    },
  },
};

// ========================================
// 멀티 테넌트 서비스
// ========================================

export class MultiTenantService {
  // 인메모리 테넌트 저장소
  private static tenants = new Map<string, TenantConfig>();
  private static currentTenantId: string | null = null;

  /**
   * 테넌트 생성
   */
  static createTenant(
    code: string,
    name: string,
    country: string,
    options?: Partial<TenantConfig>
  ): TenantConfig {
    const countryDefaults = COUNTRY_DEFAULTS[country] || COUNTRY_DEFAULTS.KR;
    
    const tenant: TenantConfig = {
      id: `tenant_${Date.now()}`,
      code,
      name,
      country,
      currency: options?.currency || this.getDefaultCurrency(country),
      timezone: options?.timezone || this.getDefaultTimezone(country),
      locale: options?.locale || this.getDefaultLocale(country),
      policies: {
        annualLeaveBase: countryDefaults.annualLeaveBase || 15,
        maxCarryoverDays: countryDefaults.maxCarryoverDays || 0,
        probationMonths: countryDefaults.probationMonths || 3,
        workHoursPerDay: countryDefaults.workHoursPerDay || 8,
        workDaysPerWeek: countryDefaults.workDaysPerWeek || 5,
        overtimeMultiplier: countryDefaults.overtimeMultiplier || 1.5,
        ...options?.policies,
      },
    };

    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  /**
   * 현재 테넌트 설정
   */
  static setCurrentTenant(tenantId: string): void {
    if (!this.tenants.has(tenantId)) {
      throw new Error("Tenant not found");
    }
    this.currentTenantId = tenantId;
  }

  /**
   * 현재 테넌트 조회
   */
  static getCurrentTenant(): TenantConfig | null {
    if (!this.currentTenantId) return null;
    return this.tenants.get(this.currentTenantId) || null;
  }

  /**
   * 테넌트 목록 조회
   */
  static getTenants(): TenantConfig[] {
    return Array.from(this.tenants.values());
  }

  private static getDefaultCurrency(country: string): string {
    const map: Record<string, string> = {
      KR: "KRW", US: "USD", JP: "JPY", DE: "EUR", CN: "CNY",
    };
    return map[country] || "USD";
  }

  private static getDefaultTimezone(country: string): string {
    const map: Record<string, string> = {
      KR: "Asia/Seoul", US: "America/New_York", JP: "Asia/Tokyo",
      DE: "Europe/Berlin", CN: "Asia/Shanghai",
    };
    return map[country] || "UTC";
  }

  private static getDefaultLocale(country: string): string {
    const map: Record<string, string> = {
      KR: "ko", US: "en", JP: "ja", DE: "de", CN: "zh",
    };
    return map[country] || "en";
  }
}

// ========================================
// 국제화 서비스
// ========================================

export class I18nService {
  private static currentLocale = "ko";

  /**
   * 현재 로케일 설정
   */
  static setLocale(locale: string): void {
    if (LOCALE_STRINGS[locale]) {
      this.currentLocale = locale;
    }
  }

  /**
   * 현재 로케일 조회
   */
  static getLocale(): string {
    return this.currentLocale;
  }

  /**
   * 번역 문자열 조회
   */
  static t(key: string, fallback?: string): string {
    const keys = key.split(".");
    let current: LocaleStrings | string = LOCALE_STRINGS[this.currentLocale];

    for (const k of keys) {
      if (typeof current === "object" && current[k]) {
        current = current[k];
      } else {
        // 폴백: 영어 시도
        let enCurrent: LocaleStrings | string = LOCALE_STRINGS.en;
        for (const ek of keys) {
          if (typeof enCurrent === "object" && enCurrent[ek]) {
            enCurrent = enCurrent[ek];
          } else {
            return fallback || key;
          }
        }
        return typeof enCurrent === "string" ? enCurrent : fallback || key;
      }
    }

    return typeof current === "string" ? current : fallback || key;
  }

  /**
   * 지원 로케일 목록
   */
  static getSupportedLocales(): string[] {
    return Object.keys(LOCALE_STRINGS);
  }
}

// ========================================
// 통화 서비스
// ========================================

export class CurrencyService {
  /**
   * 금액 포맷
   */
  static format(amount: number, currencyCode: string = "KRW"): string {
    const config = CURRENCIES[currencyCode] || CURRENCIES.KRW;
    
    const parts = amount.toFixed(config.decimalPlaces).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandSeparator);
    
    const formattedAmount = config.decimalPlaces > 0
      ? parts.join(config.decimalSeparator)
      : parts[0];

    return `${config.symbol}${formattedAmount}`;
  }

  /**
   * 통화 변환 (단순 고정 환율 - 실제로는 API 연동 필요)
   */
  static convert(amount: number, from: string, to: string): number {
    // 간이 환율 테이블 (USD 기준)
    const rates: Record<string, number> = {
      USD: 1,
      KRW: 1300,
      EUR: 0.92,
      JPY: 149,
      CNY: 7.2,
    };

    const usdAmount = amount / (rates[from] || 1);
    return usdAmount * (rates[to] || 1);
  }

  /**
   * 지원 통화 목록
   */
  static getSupportedCurrencies(): CurrencyConfig[] {
    return Object.values(CURRENCIES);
  }
}

// ========================================
// 타임존 서비스
// ========================================

export class TimezoneService {
  private static currentTimezone = "Asia/Seoul";

  /**
   * 현재 타임존 설정
   */
  static setTimezone(timezone: string): void {
    if (TIMEZONES.includes(timezone)) {
      this.currentTimezone = timezone;
    }
  }

  /**
   * 현재 타임존 조회
   */
  static getTimezone(): string {
    return this.currentTimezone;
  }

  /**
   * UTC를 로컬 시간으로 변환
   */
  static toLocalTime(utcDate: Date): Date {
    // 실제로는 timezone 라이브러리 사용 권장
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: this.currentTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return new Date(formatter.format(utcDate));
  }

  /**
   * 로컬 시간을 UTC로 변환
   */
  static toUTC(localDate: Date): Date {
    return new Date(localDate.toISOString());
  }

  /**
   * 지원 타임존 목록
   */
  static getSupportedTimezones(): string[] {
    return TIMEZONES;
  }

  /**
   * 타임존 오프셋 조회
   */
  static getOffset(timezone: string = this.currentTimezone): string {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });

    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    return offsetPart?.value || "UTC";
  }
}

// 편의 함수
export const t = I18nService.t.bind(I18nService);
export const formatCurrency = CurrencyService.format.bind(CurrencyService);
