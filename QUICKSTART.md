# HR 시스템 확장 기능 - 빠른 시작 가이드

## 🚀 시스템 접속

**개발 서버**: http://localhost:3000

### 테스트 계정
- **관리자**: admin@jahr.com / Admin123!
- **일반 사용자**: test@jahr.com / Test123!

---

## 📋 구현된 기능 페이지

### Admin 페이지 (관리자용)

1. **R&R 관리** - http://localhost:3000/admin/rnr
   - 4개 샘플 R&R 확인 가능
   - 카테고리별 필터링
   - 배정 인원 현황

2. **출장 관리** - http://localhost:3000/admin/business-trips
   - 통계 카드 (총 출장, 대기중, 승인, 총 경비)
   - "서울 본사 미팅" 샘플 데이터
   - 경비 항목: 교통비, 숙박비, 식비

3. **승격 관리** - http://localhost:3000/admin/promotions
   - 승격 현황 통계
   - 승인 워크플로우

4. **연차촉진 캠페인** - http://localhost:3000/admin/leave-promotion
   - 2024년 캠페인 확인
   - 대상 인원, 촉진 기간

5. **근무제도 관리** - http://localhost:3000/admin/work-schedules
   - 3개 템플릿: 표준, 유연, 탄력
   - 코어타임, 근무시간 설정

### Portal 페이지 (직원용)

6. **내 IDP** - http://localhost:3000/portal/idp
   - 2024년 개발 계획
   - 3개 목표: React 학습, AWS 자격증, 마이크로서비스
   - 목표별 진행률 바

---

## 🧪 API 테스트

### R&R API
```bash
# 전체 조회
curl http://localhost:3000/api/rnr

# 카테고리 필터
curl "http://localhost:3000/api/rnr?category=TECHNICAL"
```

### IDP API
```bash
# 2024년 IDP 조회
curl "http://localhost:3000/api/idp?year=2024"
```

### 출장 API
```bash
# 승인된 출장만
curl "http://localhost:3000/api/business-trips?status=APPROVED"
```

---

## 📊 Prisma Studio로 데이터 확인

현재 실행 중! 브라우저에서 데이터베이스 구조 확인 가능

**확인 가능한 테이블**:
- RnR, RnRAssignment
- IDP, IDPGoal, IDPProgress
- BusinessTrip, TripExpense, TripBudget
- Promotion, RewardPunishment
- WorkScheduleTemplate, EmployeeWorkSchedule
- LeavePromotionCampaign
- AbsenceOfLeave
- LaborCostActual
- KCBLog, ExternalApprovalLink
- TrainingRefund, TrainingCredits

---

## 🔧 추가 설정 (선택사항)

### KCB 출입 시스템 연동
`.env` 파일에 추가:
```bash
KCB_WEBHOOK_SECRET=your-secret-key
```

Webhook URL: `POST /api/integrations/kcb/webhook`

### 그룹웨어 전자결재 연동
`.env` 파일에 추가:
```bash
GROUPWARE_WEBHOOK_SECRET=your-groupware-secret
```

Webhook URL: `POST /api/integrations/groupware/webhook`

---

## 📁 프로젝트 구조

```
jahr/
├── prisma/
│   ├── schema.prisma (3,939 lines - 22개 모델 추가)
│   ├── migrations/20251226035857_add_hr_features/
│   ├── seed.ts (기본 데이터)
│   └── seed-extension.ts (HR 확장 데이터)
├── src/app/
│   ├── api/
│   │   ├── rnr/route.ts
│   │   ├── idp/route.ts
│   │   ├── business-trips/route.ts
│   │   ├── promotions/route.ts
│   │   ├── rewards/route.ts
│   │   ├── work-schedules/route.ts
│   │   ├── absence/route.ts
│   │   ├── leave-promotion/route.ts
│   │   ├── labor-cost/actuals/route.ts
│   │   └── integrations/
│   │       ├── kcb/webhook/route.ts
│   │       └── groupware/webhook/route.ts
│   ├── admin/
│   │   ├── rnr/page.tsx
│   │   ├── business-trips/page.tsx
│   │   ├── promotions/page.tsx
│   │   ├── leave-promotion/page.tsx
│   │   └── work-schedules/page.tsx
│   └── portal/
│       └── idp/page.tsx
└── TESTING.md (상세 테스트 가이드)
```

---

## ✅ 체크리스트

- [x] 데이터베이스 마이그레이션
- [x] Prisma Client 생성
- [x] 시드 데이터 로드
- [x] 개발 서버 실행
- [x] API 엔드포인트 준비
- [x] UI 페이지 생성
- [ ] 프론트엔드 페이지 테스트 (브라우저에서 확인)
- [ ] API 응답 테스트 (curl 명령어)
- [ ] 통합 시스템 연동 (선택사항)

---

## 🎉 완료!

모든 HR 확장 기능이 준비되었습니다!  
개발 서버가 실행 중이므로 바로 테스트 가능합니다.

**다음 단계**: 위의 페이지 URL들을 브라우저에서 열어 확인해보세요!
