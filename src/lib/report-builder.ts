// 리포트 빌더 및 Export 유틸리티
// Phase 5: 데이터 및 리포팅 고도화

import { format } from "date-fns";
import { ko } from "date-fns/locale";

// ========================================
// 타입 정의
// ========================================

export type ExportFormat = "csv" | "xlsx" | "json" | "pdf";

export interface ReportColumn {
  key: string;
  header: string;
  width?: number;
  format?: "text" | "number" | "date" | "currency" | "percentage";
  align?: "left" | "center" | "right";
}

export interface ReportFilter {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "in" | "between";
  value: unknown;
}

export interface ReportConfig {
  name: string;
  description?: string;
  columns: ReportColumn[];
  filters?: ReportFilter[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  groupBy?: string;
}

export interface ReportData {
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  summary?: Record<string, unknown>;
  generatedAt: Date;
  totalCount: number;
}

// ========================================
// 리포트 템플릿
// ========================================

export const REPORT_TEMPLATES: Record<string, ReportConfig> = {
  // 직원 현황 리포트
  EMPLOYEE_STATUS: {
    name: "직원 현황 리포트",
    description: "전체 직원 현황 및 통계",
    columns: [
      { key: "employeeId", header: "사번", width: 100 },
      { key: "name", header: "이름", width: 100 },
      { key: "organization", header: "부서", width: 150 },
      { key: "position", header: "직급", width: 100 },
      { key: "hireDate", header: "입사일", width: 120, format: "date" },
      { key: "employmentType", header: "고용형태", width: 100 },
      { key: "status", header: "상태", width: 80 },
    ],
    sortBy: "organization",
    sortOrder: "asc",
  },

  // 근태 현황 리포트
  ATTENDANCE_STATUS: {
    name: "근태 현황 리포트",
    description: "출퇴근 및 근무시간 현황",
    columns: [
      { key: "date", header: "일자", width: 120, format: "date" },
      { key: "employeeId", header: "사번", width: 100 },
      { key: "name", header: "이름", width: 100 },
      { key: "organization", header: "부서", width: 150 },
      { key: "checkIn", header: "출근시간", width: 100 },
      { key: "checkOut", header: "퇴근시간", width: 100 },
      { key: "workMinutes", header: "근무시간(분)", width: 100, format: "number" },
      { key: "status", header: "상태", width: 80 },
    ],
    sortBy: "date",
    sortOrder: "desc",
  },

  // 휴가 사용 리포트
  LEAVE_USAGE: {
    name: "휴가 사용 리포트",
    description: "연차/휴가 사용 현황",
    columns: [
      { key: "employeeId", header: "사번", width: 100 },
      { key: "name", header: "이름", width: 100 },
      { key: "organization", header: "부서", width: 150 },
      { key: "totalDays", header: "총 연차", width: 100, format: "number" },
      { key: "usedDays", header: "사용 일수", width: 100, format: "number" },
      { key: "remainingDays", header: "잔여 일수", width: 100, format: "number" },
      { key: "usageRate", header: "사용률", width: 100, format: "percentage" },
    ],
    sortBy: "usageRate",
    sortOrder: "desc",
  },

  // 급여 리포트
  SALARY_SUMMARY: {
    name: "급여 요약 리포트",
    description: "월별 급여 현황",
    columns: [
      { key: "yearMonth", header: "급여월", width: 100 },
      { key: "employeeId", header: "사번", width: 100 },
      { key: "name", header: "이름", width: 100 },
      { key: "organization", header: "부서", width: 150 },
      { key: "baseSalary", header: "기본급", width: 120, format: "currency" },
      { key: "totalEarnings", header: "총 지급액", width: 120, format: "currency" },
      { key: "totalDeductions", header: "총 공제액", width: 120, format: "currency" },
      { key: "netSalary", header: "실수령액", width: 120, format: "currency" },
    ],
    sortBy: "yearMonth",
    sortOrder: "desc",
  },

  // 평가 현황 리포트
  EVALUATION_STATUS: {
    name: "평가 현황 리포트",
    description: "인사평가 현황 및 결과",
    columns: [
      { key: "periodName", header: "평가기간", width: 150 },
      { key: "employeeId", header: "사번", width: 100 },
      { key: "name", header: "이름", width: 100 },
      { key: "organization", header: "부서", width: 150 },
      { key: "selfScore", header: "자기평가", width: 100, format: "number" },
      { key: "managerScore", header: "상위평가", width: 100, format: "number" },
      { key: "finalScore", header: "최종점수", width: 100, format: "number" },
      { key: "grade", header: "등급", width: 80 },
      { key: "status", header: "상태", width: 100 },
    ],
    sortBy: "finalScore",
    sortOrder: "desc",
  },

  // 교육 현황 리포트
  TRAINING_STATUS: {
    name: "교육 현황 리포트",
    description: "교육 수강 현황",
    columns: [
      { key: "courseName", header: "과정명", width: 200 },
      { key: "employeeId", header: "사번", width: 100 },
      { key: "name", header: "이름", width: 100 },
      { key: "organization", header: "부서", width: 150 },
      { key: "startDate", header: "시작일", width: 120, format: "date" },
      { key: "endDate", header: "종료일", width: 120, format: "date" },
      { key: "status", header: "상태", width: 100 },
      { key: "score", header: "점수", width: 80, format: "number" },
    ],
    sortBy: "startDate",
    sortOrder: "desc",
  },
};

// ========================================
// 리포트 빌더
// ========================================

export class ReportBuilder {
  private config: ReportConfig;
  private data: Record<string, unknown>[] = [];

  constructor(config: ReportConfig) {
    this.config = config;
  }

  static fromTemplate(templateKey: keyof typeof REPORT_TEMPLATES): ReportBuilder {
    return new ReportBuilder(REPORT_TEMPLATES[templateKey]);
  }

  setData(data: Record<string, unknown>[]): this {
    this.data = data;
    return this;
  }

  addFilter(filter: ReportFilter): this {
    if (!this.config.filters) {
      this.config.filters = [];
    }
    this.config.filters.push(filter);
    return this;
  }

  setSorting(sortBy: string, sortOrder: "asc" | "desc" = "asc"): this {
    this.config.sortBy = sortBy;
    this.config.sortOrder = sortOrder;
    return this;
  }

  setGroupBy(groupBy: string): this {
    this.config.groupBy = groupBy;
    return this;
  }

  build(): ReportData {
    let processedData = [...this.data];

    // 필터 적용
    if (this.config.filters) {
      processedData = this.applyFilters(processedData, this.config.filters);
    }

    // 정렬 적용
    if (this.config.sortBy) {
      processedData = this.applySort(processedData);
    }

    // 그룹화 적용
    if (this.config.groupBy) {
      processedData = this.applyGrouping(processedData);
    }

    return {
      columns: this.config.columns,
      rows: processedData,
      generatedAt: new Date(),
      totalCount: processedData.length,
    };
  }

  private applyFilters(
    data: Record<string, unknown>[],
    filters: ReportFilter[]
  ): Record<string, unknown>[] {
    return data.filter((row) => {
      return filters.every((filter) => {
        const value = row[filter.field];
        const filterValue = filter.value;

        switch (filter.operator) {
          case "eq":
            return value === filterValue;
          case "ne":
            return value !== filterValue;
          case "gt":
            return (value as number) > (filterValue as number);
          case "gte":
            return (value as number) >= (filterValue as number);
          case "lt":
            return (value as number) < (filterValue as number);
          case "lte":
            return (value as number) <= (filterValue as number);
          case "contains":
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case "in":
            return (filterValue as unknown[]).includes(value);
          case "between":
            const [min, max] = filterValue as [number, number];
            return (value as number) >= min && (value as number) <= max;
          default:
            return true;
        }
      });
    });
  }

  private applySort(data: Record<string, unknown>[]): Record<string, unknown>[] {
    const { sortBy, sortOrder } = this.config;
    if (!sortBy) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortOrder === "desc" ? -comparison : comparison;
    });
  }

  private applyGrouping(data: Record<string, unknown>[]): Record<string, unknown>[] {
    const { groupBy } = this.config;
    if (!groupBy) return data;

    const groups = new Map<unknown, Record<string, unknown>[]>();
    
    for (const row of data) {
      const key = row[groupBy];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    }

    // 그룹별로 정렬된 결과 반환
    const result: Record<string, unknown>[] = [];
    for (const [, groupRows] of groups) {
      result.push(...groupRows);
    }
    
    return result;
  }
}

// ========================================
// Export 유틸리티
// ========================================

export class ExportService {
  /**
   * CSV 형식으로 내보내기
   */
  static toCSV(report: ReportData): string {
    const { columns, rows } = report;
    
    // 헤더 행
    const header = columns.map((col) => `"${col.header}"`).join(",");
    
    // 데이터 행
    const dataRows = rows.map((row) => {
      return columns.map((col) => {
        const value = row[col.key];
        const formatted = this.formatValue(value, col.format);
        
        // 쉼표나 따옴표가 포함된 경우 따옴표로 감싸기
        if (typeof formatted === "string" && (formatted.includes(",") || formatted.includes('"'))) {
          return `"${formatted.replace(/"/g, '""')}"`;
        }
        return String(formatted);
      }).join(",");
    });

    return [header, ...dataRows].join("\n");
  }

  /**
   * JSON 형식으로 내보내기
   */
  static toJSON(report: ReportData): string {
    return JSON.stringify({
      metadata: {
        generatedAt: report.generatedAt.toISOString(),
        totalCount: report.totalCount,
        columns: report.columns.map((c) => ({ key: c.key, header: c.header })),
      },
      data: report.rows,
    }, null, 2);
  }

  /**
   * 값 포맷팅
   */
  static formatValue(
    value: unknown,
    formatType?: ReportColumn["format"]
  ): string | number {
    if (value === null || value === undefined) return "";

    switch (formatType) {
      case "date":
        if (value instanceof Date) {
          return format(value, "yyyy-MM-dd", { locale: ko });
        }
        if (typeof value === "string") {
          return format(new Date(value), "yyyy-MM-dd", { locale: ko });
        }
        return String(value);

      case "number":
        const num = typeof value === "number" ? value : parseFloat(String(value));
        return isNaN(num) ? String(value) : num.toLocaleString("ko-KR");

      case "currency":
        const amount = typeof value === "number" ? value : parseFloat(String(value));
        return isNaN(amount) ? String(value) : `₩${amount.toLocaleString("ko-KR")}`;

      case "percentage":
        const pct = typeof value === "number" ? value : parseFloat(String(value));
        return isNaN(pct) ? String(value) : `${(pct * 100).toFixed(1)}%`;

      default:
        return String(value);
    }
  }

  /**
   * 브라우저에서 파일 다운로드
   */
  static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob(["\uFEFF" + content], { type: mimeType }); // BOM 추가 (엑셀 한글 인코딩)
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * CSV 다운로드
   */
  static downloadCSV(report: ReportData, filename?: string) {
    const csv = this.toCSV(report);
    const name = filename || `report_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
    this.downloadFile(csv, name, "text/csv;charset=utf-8");
  }

  /**
   * JSON 다운로드
   */
  static downloadJSON(report: ReportData, filename?: string) {
    const json = this.toJSON(report);
    const name = filename || `report_${format(new Date(), "yyyyMMdd_HHmmss")}.json`;
    this.downloadFile(json, name, "application/json;charset=utf-8");
  }
}
