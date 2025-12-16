import { z } from "zod";

// 공통 검증 규칙
export const emailSchema = z.string().email("올바른 이메일 형식이 아닙니다.");

export const passwordSchema = z
  .string()
  .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
  .regex(
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다."
  );

export const phoneSchema = z
  .string()
  .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, "올바른 휴대폰 번호 형식이 아닙니다.");

export const employeeIdSchema = z
  .string()
  .regex(/^[A-Z]{2,4}\d{6,10}$/, "올바른 사번 형식이 아닙니다.");

// 로그인
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

// 사용자 생성
export const createUserSchema = z.object({
  employeeId: z.string().min(1, "사번을 입력해주세요."),
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다."),
  phoneNumber: phoneSchema.optional(),
  birthDate: z.string().optional(),
});

// 조직 관리
export const organizationSchema = z.object({
  code: z.string().min(1, "조직 코드를 입력해주세요."),
  name: z.string().min(1, "조직명을 입력해주세요."),
  level: z.enum(["COMPANY", "DIVISION", "DEPARTMENT", "TEAM"]),
  parentId: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

// 직급 관리
export const positionSchema = z.object({
  code: z.string().min(1, "직급 코드를 입력해주세요."),
  name: z.string().min(1, "직급명을 입력해주세요."),
  level: z.number().int().min(1, "레벨을 입력해주세요."),
  description: z.string().optional(),
});

// 직원 정보
export const employeeSchema = z.object({
  userId: z.string(),
  organizationId: z.string().min(1, "소속 조직을 선택해주세요."),
  positionId: z.string().min(1, "직급을 선택해주세요."),
  jobTitleId: z.string().optional(),
  jobId: z.string().optional(),
  hireDate: z.string().min(1, "입사일을 입력해주세요."),
  employmentType: z.enum(["REGULAR", "CONTRACT", "INTERN", "PART_TIME"]),
  workType: z.enum(["OFFICE", "REMOTE", "HYBRID", "FLEXIBLE"]),
});

// 학력 정보
export const educationSchema = z.object({
  schoolName: z.string().min(1, "학교명을 입력해주세요."),
  major: z.string().optional(),
  degree: z.enum(["HIGH_SCHOOL", "ASSOCIATE", "BACHELOR", "MASTER", "DOCTORATE"]),
  startDate: z.string().min(1, "입학일을 입력해주세요."),
  endDate: z.string().optional(),
  graduated: z.boolean().default(false),
});

// 경력 정보
export const careerSchema = z.object({
  companyName: z.string().min(1, "회사명을 입력해주세요."),
  position: z.string().min(1, "직위를 입력해주세요."),
  startDate: z.string().min(1, "시작일을 입력해주세요."),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

// 가족 정보
export const familySchema = z.object({
  relation: z.enum(["SPOUSE", "CHILD", "PARENT", "SIBLING", "OTHER"]),
  name: z.string().min(1, "이름을 입력해주세요."),
  birthDate: z.string().optional(),
  contact: z.string().optional(),
});

// 근태 기록
export const attendanceSchema = z.object({
  date: z.string().min(1, "날짜를 입력해주세요."),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  workType: z.enum(["OFFICE", "REMOTE", "HYBRID", "FLEXIBLE"]),
  note: z.string().optional(),
});

// 휴가 신청
export const leaveRequestSchema = z.object({
  type: z.enum(["ANNUAL", "SICK", "OFFICIAL", "MATERNITY", "PATERNITY", "BEREAVEMENT", "UNPAID", "OTHER"]),
  startDate: z.string().min(1, "시작일을 입력해주세요."),
  endDate: z.string().min(1, "종료일을 입력해주세요."),
  days: z.number().positive("휴가 일수를 입력해주세요."),
  reason: z.string().optional(),
});

// 급여 정보
export const salarySchema = z.object({
  yearMonth: z.string().regex(/^\d{6}$/, "YYYYMM 형식으로 입력해주세요."),
  baseSalary: z.number().positive("기본급을 입력해주세요."),
  bonus: z.number().min(0).default(0),
  allowances: z.record(z.number()).optional(),
  deductions: z.record(z.number()).optional(),
});

// 평가
export const evaluationSchema = z.object({
  periodId: z.string().min(1, "평가 기간을 선택해주세요."),
  items: z.array(z.object({
    category: z.string(),
    name: z.string(),
    weight: z.number(),
    selfScore: z.number().min(0).max(5).optional(),
    managerScore: z.number().min(0).max(5).optional(),
    selfComment: z.string().optional(),
    managerComment: z.string().optional(),
  })),
  selfComment: z.string().optional(),
});

// 교육 신청
export const trainingSchema = z.object({
  courseId: z.string().min(1, "교육 과정을 선택해주세요."),
  startDate: z.string().min(1, "시작일을 입력해주세요."),
});

// 결재 문서
export const approvalSchema = z.object({
  type: z.enum(["LEAVE_REQUEST", "APPOINTMENT", "EXPENSE", "OVERTIME", "BUSINESS_TRIP", "OTHER"]),
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.record(z.unknown()),
  approverIds: z.array(z.string()).min(1, "결재자를 선택해주세요."),
});

// 타입 추출
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type OrganizationInput = z.infer<typeof organizationSchema>;
export type PositionInput = z.infer<typeof positionSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type CareerInput = z.infer<typeof careerSchema>;
export type FamilyInput = z.infer<typeof familySchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type SalaryInput = z.infer<typeof salarySchema>;
export type EvaluationInput = z.infer<typeof evaluationSchema>;
export type TrainingInput = z.infer<typeof trainingSchema>;
export type ApprovalInput = z.infer<typeof approvalSchema>;
