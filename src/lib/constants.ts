// 앱 정보
export const APP_NAME = "JaHR";
export const APP_DESCRIPTION = "HR 인사관리 시스템";

// 역할 코드
export const ROLES = {
  EMPLOYEE: "EMPLOYEE",
  TEAM_LEADER: "TEAM_LEADER",
  HR_ADMIN: "HR_ADMIN",
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
} as const;

// 역할 라벨
export const ROLE_LABELS: Record<string, string> = {
  EMPLOYEE: "일반 직원",
  TEAM_LEADER: "팀장",
  HR_ADMIN: "HR 관리자",
  SYSTEM_ADMIN: "시스템 관리자",
};

// 조직 레벨
export const ORG_LEVEL_LABELS: Record<string, string> = {
  COMPANY: "회사",
  DIVISION: "본부",
  DEPARTMENT: "부서",
  TEAM: "팀",
};

// 고용 형태
export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  REGULAR: "정규직",
  CONTRACT: "계약직",
  INTERN: "인턴",
  PART_TIME: "파트타임",
};

// 근무 형태
export const WORK_TYPE_LABELS: Record<string, string> = {
  OFFICE: "사무실 근무",
  REMOTE: "재택 근무",
  HYBRID: "하이브리드",
  FLEXIBLE: "유연 근무",
};

// 학력
export const DEGREE_LABELS: Record<string, string> = {
  HIGH_SCHOOL: "고등학교",
  ASSOCIATE: "전문학사",
  BACHELOR: "학사",
  MASTER: "석사",
  DOCTORATE: "박사",
};

// 가족 관계
export const FAMILY_RELATION_LABELS: Record<string, string> = {
  SPOUSE: "배우자",
  CHILD: "자녀",
  PARENT: "부모",
  SIBLING: "형제자매",
  OTHER: "기타",
};

// 가족 관계 (alias)
export const RELATION_LABELS = FAMILY_RELATION_LABELS;

// 사용자 상태
export const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "재직",
  INACTIVE: "퇴사",
  SUSPENDED: "정지",
  PENDING: "대기",
};

// 문서 유형
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CONTRACT: "계약서",
  CERTIFICATE: "자격증",
  ID_CARD: "신분증",
  RESUME: "이력서",
  OTHER: "기타",
};

// 발령 유형
export const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  HIRE: "입사",
  PROMOTION: "승진",
  TRANSFER: "전보",
  DEMOTION: "강등",
  RESIGNATION: "퇴사",
  RETIREMENT: "정년퇴직",
  LEAVE_OF_ABSENCE: "휴직",
  RETURN_FROM_LEAVE: "복직",
};

// 근태 상태
export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  NORMAL: "정상",
  LATE: "지각",
  EARLY_LEAVE: "조퇴",
  ABSENT: "결근",
  HOLIDAY: "휴일",
  LEAVE: "휴가",
};

// 휴가 유형
export const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: "연차",
  SICK: "병가",
  OFFICIAL: "공가",
  MATERNITY: "출산휴가",
  PATERNITY: "육아휴직",
  BEREAVEMENT: "경조사",
  UNPAID: "무급휴가",
  OTHER: "기타",
};

// 결재 상태
export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELLED: "취소",
};

// 결재 상태 색상
export const APPROVAL_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

// 결재 문서 유형
export const APPROVAL_DOC_TYPE_LABELS: Record<string, string> = {
  LEAVE_REQUEST: "휴가 신청",
  APPOINTMENT: "인사 발령",
  EXPENSE: "경비 청구",
  OVERTIME: "초과 근무",
  BUSINESS_TRIP: "출장",
  OTHER: "기타",
};

// 평가 유형
export const EVALUATION_TYPE_LABELS: Record<string, string> = {
  HALF_YEARLY: "반기",
  YEARLY: "연간",
};

// 평가 상태
export const EVALUATION_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "미시작",
  SELF_EVALUATION: "자기평가",
  MANAGER_EVALUATION: "상위평가",
  COMPLETED: "완료",
};

// 평가 등급
export const EVALUATION_GRADE_LABELS: Record<string, string> = {
  S: "S (탁월)",
  A: "A (우수)",
  B: "B (양호)",
  C: "C (보통)",
  D: "D (미흡)",
};

// 교육 유형
export const COURSE_TYPE_LABELS: Record<string, string> = {
  INTERNAL: "사내 교육",
  EXTERNAL: "외부 교육",
  ONLINE: "온라인",
  OFFLINE: "오프라인",
};

// 교육 상태
export const TRAINING_STATUS_LABELS: Record<string, string> = {
  ENROLLED: "수강 신청",
  IN_PROGRESS: "수강 중",
  COMPLETED: "수료",
  CANCELLED: "취소",
};

// 페이지 크기 옵션
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// 기본 페이지 크기
export const DEFAULT_PAGE_SIZE = 20;

// 기본 근무 시간 (분)
export const DEFAULT_WORK_HOURS = 8 * 60; // 480분

// 기본 연차 일수
export const DEFAULT_ANNUAL_LEAVE_DAYS = 15;
