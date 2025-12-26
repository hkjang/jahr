# HR 시스템 테스트 가이드

## 1. 데이터베이스 마이그레이션

```bash
# 마이그레이션 실행
npx prisma migrate dev --name add_hr_extension_features

# Prisma Client 재생성
npx prisma generate
```

## 2. 시드 데이터 실행 (선택사항)

```bash
# 추가 시드 데이터 실행
npx tsx prisma/seed-extension.ts
```

## 3. API 테스트

### R&R API
```bash
# 모든 R&R 조회
curl http://localhost:3000/api/rnr

# 카테고리별 필터
curl "http://localhost:3000/api/rnr?category=TECHNICAL"
```

### IDP API
```bash
# IDP 목록 조회
curl http://localhost:3000/api/idp

# 특정 연도
curl "http://localhost:3000/api/idp?year=2024"
```

### 출장 API
```bash
# 출장 목록
curl http://localhost:3000/api/business-trips

# 상태별 필터
curl "http://localhost:3000/api/business-trips?status=APPROVED"
```

### 승격 API
```bash
curl http://localhost:3000/api/promotions
```

### 근무제도 API
```bash
curl http://localhost:3000/api/work-schedules
```

### 연차촉진 API
```bash
curl http://localhost:3000/api/leave-promotion
```

## 4. 프론트엔드 페이지 테스트

브라우저에서 다음 URL 접속:

### Admin 페이지
- http://localhost:3000/admin/rnr - R&R 관리
- http://localhost:3000/admin/business-trips - 출장 관리
- http://localhost:3000/admin/promotions - 승격 관리
- http://localhost:3000/admin/leave-promotion - 연차촉진 캠페인
- http://localhost:3000/admin/work-schedules - 근무제도 관리

### Portal 페이지
- http://localhost:3000/portal/idp - 내 IDP

## 5. Prisma Studio로 데이터 확인

```bash
npx prisma studio
```

확인할 테이블:
- RnR, RnRAssignment
- IDP, IDPGoal, IDPProgress
- BusinessTrip, TripExpense, TripBudget
- Promotion, RewardPunishment
- WorkScheduleTemplate, EmployeeWorkSchedule
- LeavePromotionCampaign, LeaveUsageTarget
- AbsenceOfLeave
- LaborCostActual
- KCBLog, ExternalApprovalLink
- TrainingRefund, TrainingCredits

## 6. 통합 테스트 (선택사항)

### KCB Webhook 테스트
```bash
curl -X POST http://localhost:3000/api/integrations/kcb/webhook \
  -H "Content-Type: application/json" \
  -H "X-KCB-Secret: your-secret" \
  -d '{
    "employeeId": "EMP24002",
    "eventType": "ENTRY",
    "eventTime": "2024-12-26T09:00:00Z",
    "location": "Main Gate"
  }'
```

### Groupware Webhook 테스트
```bash
curl -X POST http://localhost:3000/api/integrations/groupware/webhook \
  -H "Content-Type: application/json" \
  -H "X-Groupware-Secret: your-secret" \
  -d '{
    "externalApprovalId": "GW-2024-001",
    "status": "APPROVED",
    "updatedAt": "2024-12-26T10:00:00Z"
  }'
```

## 7. 체크리스트

- [ ] 마이그레이션 성공
- [ ] Prisma Studio에서 모든 새 테이블 확인
- [ ] API 엔드포인트 응답 확인
- [ ] Admin 페이지 로드 확인
- [ ] Portal IDP 페이지 확인
- [ ] 샘플 데이터 생성 확인 (seed 실행한 경우)
- [ ] 로그인 후 권한별 접근 확인

## 문제 해결

### 마이그레이션 실패 시
```bash
# 마이그레이션 리셋 (주의: 데이터 삭제됨)
npx prisma migrate reset

# 다시 마이그레이션
npx prisma migrate dev
```

### API 401 에러
- 로그인 확인
- 세션 토큰 확인

### API 403 에러
- 사용자 권한 확인
- Role과 Permission 확인

### 페이지 404 에러
- 개발 서버 재시작
- 파일 경로 확인
