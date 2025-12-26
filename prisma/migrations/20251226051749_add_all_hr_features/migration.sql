-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'LEVEL1_APPROVED', 'LEVEL2_APPROVED', 'FINAL_APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RaterRelationship" AS ENUM ('SUPERVISOR', 'PEER', 'SUBORDINATE', 'SELF', 'HR');

-- CreateEnum
CREATE TYPE "FinalGrade" AS ENUM ('S', 'A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "EvaluationCycle" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "cycleName" TEXT NOT NULL,
    "cycleOrder" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationGroup" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetPositions" TEXT[],
    "weightRatio" JSONB NOT NULL,
    "gradeDistribution" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIIndicator" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "indicator" TEXT NOT NULL,
    "description" TEXT,
    "target" DECIMAL(15,2) NOT NULL,
    "actual" DECIMAL(15,2),
    "unit" TEXT,
    "weight" INTEGER NOT NULL,
    "targetType" TEXT NOT NULL DEFAULT 'HIGHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPIIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalSetting" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "goalTitle" TEXT NOT NULL,
    "goalDescription" TEXT NOT NULL,
    "measurableTarget" TEXT NOT NULL,
    "targetValue" TEXT,
    "weight" INTEGER NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalApproval" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterimReview" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL,
    "achievements" TEXT NOT NULL,
    "challenges" TEXT,
    "planActions" TEXT,
    "reviewerComments" TEXT,
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterimReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceRating" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "goalId" TEXT,
    "selfScore" DECIMAL(5,2),
    "managerScore" DECIMAL(5,2),
    "adjustedScore" DECIMAL(5,2),
    "selfComments" TEXT,
    "managerComments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyEvaluation" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "selfScore" DECIMAL(5,2),
    "evaluatorScore" DECIMAL(5,2),
    "adjustedScore" DECIMAL(5,2),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencyEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyIndicator" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencyIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultiRaterFeedback" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "relationship" "RaterRelationship" NOT NULL,
    "feedback" JSONB NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MultiRaterFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalEvaluation" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "performanceScore" DECIMAL(5,2) NOT NULL,
    "competencyScore" DECIMAL(5,2) NOT NULL,
    "multiRaterScore" DECIMAL(5,2),
    "totalScore" DECIMAL(5,2) NOT NULL,
    "calculatedGrade" "FinalGrade" NOT NULL,
    "finalGrade" "FinalGrade" NOT NULL,
    "hrCommitteeComments" TEXT,
    "departmentComments" TEXT,
    "isAppealed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinalEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationAppeal" (
    "id" TEXT NOT NULL,
    "finalEvalId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidences" JSONB,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewerComments" TEXT,
    "decision" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationAppeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemCode" (
    "id" TEXT NOT NULL,
    "groupCode" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionGroup" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuPermission" (
    "id" TEXT NOT NULL,
    "menuPath" TEXT NOT NULL,
    "menuName" TEXT NOT NULL,
    "parentPath" TEXT,
    "icon" TEXT,
    "requiredPermissions" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvaluationCycle_periodId_idx" ON "EvaluationCycle"("periodId");

-- CreateIndex
CREATE INDEX "EvaluationCycle_isActive_idx" ON "EvaluationCycle"("isActive");

-- CreateIndex
CREATE INDEX "EvaluationGroup_periodId_idx" ON "EvaluationGroup"("periodId");

-- CreateIndex
CREATE INDEX "EvaluationGroup_isActive_idx" ON "EvaluationGroup"("isActive");

-- CreateIndex
CREATE INDEX "KPIIndicator_organizationId_idx" ON "KPIIndicator"("organizationId");

-- CreateIndex
CREATE INDEX "KPIIndicator_year_idx" ON "KPIIndicator"("year");

-- CreateIndex
CREATE INDEX "GoalSetting_employeeId_idx" ON "GoalSetting"("employeeId");

-- CreateIndex
CREATE INDEX "GoalSetting_periodId_idx" ON "GoalSetting"("periodId");

-- CreateIndex
CREATE INDEX "GoalSetting_status_idx" ON "GoalSetting"("status");

-- CreateIndex
CREATE INDEX "GoalApproval_goalId_idx" ON "GoalApproval"("goalId");

-- CreateIndex
CREATE INDEX "GoalApproval_approverId_idx" ON "GoalApproval"("approverId");

-- CreateIndex
CREATE INDEX "InterimReview_goalId_idx" ON "InterimReview"("goalId");

-- CreateIndex
CREATE INDEX "InterimReview_reviewDate_idx" ON "InterimReview"("reviewDate");

-- CreateIndex
CREATE INDEX "PerformanceRating_evaluationId_idx" ON "PerformanceRating"("evaluationId");

-- CreateIndex
CREATE INDEX "PerformanceRating_goalId_idx" ON "PerformanceRating"("goalId");

-- CreateIndex
CREATE INDEX "CompetencyEvaluation_evaluationId_idx" ON "CompetencyEvaluation"("evaluationId");

-- CreateIndex
CREATE INDEX "CompetencyEvaluation_competencyId_idx" ON "CompetencyEvaluation"("competencyId");

-- CreateIndex
CREATE INDEX "CompetencyIndicator_groupId_idx" ON "CompetencyIndicator"("groupId");

-- CreateIndex
CREATE INDEX "CompetencyIndicator_category_idx" ON "CompetencyIndicator"("category");

-- CreateIndex
CREATE INDEX "MultiRaterFeedback_evaluationId_idx" ON "MultiRaterFeedback"("evaluationId");

-- CreateIndex
CREATE INDEX "MultiRaterFeedback_raterId_idx" ON "MultiRaterFeedback"("raterId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalEvaluation_evaluationId_key" ON "FinalEvaluation"("evaluationId");

-- CreateIndex
CREATE INDEX "FinalEvaluation_finalGrade_idx" ON "FinalEvaluation"("finalGrade");

-- CreateIndex
CREATE INDEX "EvaluationAppeal_finalEvalId_idx" ON "EvaluationAppeal"("finalEvalId");

-- CreateIndex
CREATE INDEX "EvaluationAppeal_status_idx" ON "EvaluationAppeal"("status");

-- CreateIndex
CREATE INDEX "SystemCode_groupCode_idx" ON "SystemCode"("groupCode");

-- CreateIndex
CREATE INDEX "SystemCode_isActive_idx" ON "SystemCode"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SystemCode_groupCode_code_key" ON "SystemCode"("groupCode", "code");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionGroup_code_key" ON "PermissionGroup"("code");

-- CreateIndex
CREATE INDEX "PermissionGroup_code_idx" ON "PermissionGroup"("code");

-- CreateIndex
CREATE INDEX "PermissionGroup_isActive_idx" ON "PermissionGroup"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MenuPermission_menuPath_key" ON "MenuPermission"("menuPath");

-- CreateIndex
CREATE INDEX "MenuPermission_parentPath_idx" ON "MenuPermission"("parentPath");

-- CreateIndex
CREATE INDEX "MenuPermission_isActive_idx" ON "MenuPermission"("isActive");

-- AddForeignKey
ALTER TABLE "EvaluationCycle" ADD CONSTRAINT "EvaluationCycle_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "EvaluationPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationGroup" ADD CONSTRAINT "EvaluationGroup_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "EvaluationPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIIndicator" ADD CONSTRAINT "KPIIndicator_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalSetting" ADD CONSTRAINT "GoalSetting_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalSetting" ADD CONSTRAINT "GoalSetting_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "EvaluationPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalApproval" ADD CONSTRAINT "GoalApproval_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "GoalSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterimReview" ADD CONSTRAINT "InterimReview_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "GoalSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceRating" ADD CONSTRAINT "PerformanceRating_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceRating" ADD CONSTRAINT "PerformanceRating_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "GoalSetting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyEvaluation" ADD CONSTRAINT "CompetencyEvaluation_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyEvaluation" ADD CONSTRAINT "CompetencyEvaluation_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "CompetencyIndicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyIndicator" ADD CONSTRAINT "CompetencyIndicator_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "EvaluationGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiRaterFeedback" ADD CONSTRAINT "MultiRaterFeedback_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalEvaluation" ADD CONSTRAINT "FinalEvaluation_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationAppeal" ADD CONSTRAINT "EvaluationAppeal_finalEvalId_fkey" FOREIGN KEY ("finalEvalId") REFERENCES "FinalEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
