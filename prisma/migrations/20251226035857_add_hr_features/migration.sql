-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('EQUIPMENT', 'SECURITY', 'ACCOUNT', 'TRAINING', 'DOCUMENTATION', 'INTRODUCTION');

-- CreateEnum
CREATE TYPE "OffboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('TECHNICAL', 'BUSINESS', 'SOFT_SKILL', 'LEADERSHIP', 'DOMAIN', 'CERTIFICATION');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('NOVICE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('SELF', 'MANAGER', 'PEER', 'CERTIFICATION', 'PROJECT', 'TRAINING');

-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('FULL_TIME', 'PROJECT', 'TASK_FORCE', 'PILOT', 'SECONDMENT', 'ROTATION');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'FILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InternalAppStatus" AS ENUM ('APPLIED', 'UNDER_REVIEW', 'INTERVIEW', 'SELECTED', 'NOT_SELECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('PROMOTION', 'SALARY_ADJUSTMENT', 'PERFORMANCE_INTERVENTION', 'DEVELOPMENT_PLAN', 'TEAM_RESTRUCTURE', 'RETENTION_ACTION');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SignalType" AS ENUM ('ENGAGEMENT_DROP', 'PERFORMANCE_DECLINE', 'ABSENCE_PATTERN', 'OVERTIME_EXCESS', 'TRAINING_SKIP', 'PEER_CONFLICT', 'COMPENSATION_GAP', 'CAREER_STALL');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('REPORTED', 'INVESTIGATING', 'MEDIATION', 'RESOLUTION', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('DOCUMENT', 'EMAIL_THREAD', 'SYSTEM_LOG', 'SCREENSHOT', 'TESTIMONY', 'POLICY_REFERENCE', 'TIMELINE');

-- CreateEnum
CREATE TYPE "BatchJobStatus" AS ENUM ('PENDING', 'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BatchJobType" AS ENUM ('SALARY_CALCULATION', 'LEAVE_GRANT', 'EVALUATION_INIT', 'DATA_SYNC', 'REPORT_GENERATION', 'INDEX_UPDATE', 'NOTIFICATION_SEND');

-- CreateEnum
CREATE TYPE "DataZoneType" AS ENUM ('GENERAL', 'CONFIDENTIAL', 'SENSITIVE', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('BASIC', 'MFA', 'BIOMETRIC', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "EventClassification" AS ENUM ('EMPLOYMENT', 'COMPENSATION', 'PERFORMANCE', 'ATTENDANCE', 'TRAINING', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "AIProviderType" AS ENUM ('VLLM', 'OLLAMA', 'OPENAI_COMPATIBLE');

-- CreateEnum
CREATE TYPE "AIProviderStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR');

-- CreateEnum
CREATE TYPE "AIFeatureType" AS ENUM ('HR_SUMMARY', 'AI_RECOMMENDATION', 'REGULATION_QA', 'DOCUMENT_GENERATION', 'SENTIMENT_ANALYSIS', 'CHATBOT');

-- CreateEnum
CREATE TYPE "OKRStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OKRLevel" AS ENUM ('COMPANY', 'DEPARTMENT', 'TEAM', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "PeerReviewType" AS ENUM ('UPWARD', 'DOWNWARD', 'LATERAL', 'SELF');

-- CreateEnum
CREATE TYPE "PeerReviewStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "FlexWorkType" AS ENUM ('CORE_HOURS', 'FLEXIBLE_HOURS', 'COMPRESSED', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('LEAD', 'MEMBER', 'CONSULTANT', 'REVIEWER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EvaluationDisputeType" AS ENUM ('EVALUATION_GRADE', 'PERFORMANCE_RATING', 'COMPENSATION', 'PROMOTION');

-- CreateEnum
CREATE TYPE "EvaluationDisputeDecision" AS ENUM ('UPHELD', 'MODIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CertificationCategory" AS ENUM ('IT', 'LANGUAGE', 'PROFESSIONAL', 'SAFETY', 'MANAGEMENT', 'OTHER');

-- CreateTable
CREATE TABLE "OnboardingTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetJobId" TEXT,
    "targetOrgId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingTemplateTask" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "category" "TaskCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "daysFromStart" INTEGER NOT NULL,
    "assigneeRole" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OnboardingTemplateTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingChecklist" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "templateId" TEXT,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startDate" TIMESTAMP(3) NOT NULL,
    "targetEndDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingTask" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "category" "TaskCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "assigneeId" TEXT,
    "assigneeName" TEXT,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "notes" TEXT,
    "attachments" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OnboardingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorAssignment" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION,
    "matchReason" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorFeedback" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "fromType" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OffboardingChecklist" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" "OffboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "lastWorkingDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OffboardingChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OffboardingTask" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "assigneeId" TEXT,
    "status" "OffboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OffboardingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeTransfer" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "attachments" JSONB,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExitInterview" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "conductedDate" TIMESTAMP(3),
    "responses" JSONB,
    "overallSatisfaction" INTEGER,
    "wouldRecommend" BOOLEAN,
    "improvementSuggestions" TEXT,
    "confidentialNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExitInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillTaxonomy" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "category" "SkillCategory" NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "keywords" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillTaxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSkill" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "currentLevel" "SkillLevel" NOT NULL,
    "targetLevel" "SkillLevel",
    "yearsExperience" DOUBLE PRECISION,
    "lastAssessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillAssessment" (
    "id" TEXT NOT NULL,
    "employeeSkillId" TEXT NOT NULL,
    "assessmentType" "AssessmentType" NOT NULL,
    "previousLevel" "SkillLevel",
    "assessedLevel" "SkillLevel" NOT NULL,
    "assessorId" TEXT,
    "evidence" TEXT,
    "notes" TEXT,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillEndorsement" (
    "id" TEXT NOT NULL,
    "employeeSkillId" TEXT NOT NULL,
    "endorserId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "comment" TEXT,
    "endorsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillEndorsement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRequiredSkill" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "requiredLevel" "SkillLevel" NOT NULL,
    "importance" TEXT NOT NULL DEFAULT 'REQUIRED',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "JobRequiredSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillGapAnalysis" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallGapScore" DOUBLE PRECISION NOT NULL,
    "skillGaps" JSONB NOT NULL,
    "recommendations" JSONB,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',

    CONSTRAINT "SkillGapAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRequiredSkill" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "requiredLevel" "SkillLevel" NOT NULL,
    "headcount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ProjectRequiredSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSkill" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "targetLevel" "SkillLevel" NOT NULL,

    CONSTRAINT "CourseSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffingRecommendation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "matchDetails" JSONB NOT NULL,
    "availability" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECOMMENDED',
    "recommendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffingRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalOpportunity" (
    "id" TEXT NOT NULL,
    "type" "OpportunityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "positionId" TEXT,
    "jobId" TEXT,
    "requiredSkills" JSONB NOT NULL,
    "preferredSkills" JSONB,
    "requirements" JSONB,
    "duration" TEXT,
    "hoursPerWeek" INTEGER,
    "location" TEXT,
    "benefits" TEXT,
    "openings" INTEGER NOT NULL DEFAULT 1,
    "filledCount" INTEGER NOT NULL DEFAULT 0,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "closingDate" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalApplication" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "status" "InternalAppStatus" NOT NULL DEFAULT 'APPLIED',
    "coverLetter" TEXT,
    "skillMatch" JSONB,
    "matchScore" DOUBLE PRECISION,
    "managerApproval" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "decisionBy" TEXT,
    "decisionReason" TEXT,

    CONSTRAINT "InternalApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalInterview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "rating" INTEGER,
    "feedback" TEXT,
    "recommendation" TEXT,

    CONSTRAINT "InternalInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityMatch" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "matchBreakdown" JSONB NOT NULL,
    "isNotified" BOOLEAN NOT NULL DEFAULT false,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerMovement" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "fromOrgId" TEXT NOT NULL,
    "toOrgId" TEXT NOT NULL,
    "fromJobId" TEXT,
    "toJobId" TEXT,
    "opportunityId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isPermanent" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionRecommendation" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "currentPositionId" TEXT NOT NULL,
    "recommendedPositionId" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "factorAnalysis" JSONB NOT NULL,
    "performanceScore" DOUBLE PRECISION,
    "tenureMonths" INTEGER,
    "skillReadiness" DOUBLE PRECISION,
    "leadershipScore" DOUBLE PRECISION,
    "comparativePlacement" JSONB,
    "recommendation" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompensationSimulation" (
    "id" TEXT NOT NULL,
    "simulationType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "currentCompensation" JSONB NOT NULL,
    "proposedCompensation" JSONB NOT NULL,
    "marketComparison" JSONB NOT NULL,
    "equityAnalysis" JSONB NOT NULL,
    "budgetImpact" JSONB NOT NULL,
    "riskAssessment" JSONB,
    "alternativeScenarios" JSONB,
    "fairnessScore" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompensationSimulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttritionSignal" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "signalType" "SignalType" NOT NULL,
    "signalStrength" DOUBLE PRECISION NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPoints" JSONB NOT NULL,
    "trend" TEXT,
    "isAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "actionTaken" TEXT,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "AttritionSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamRiskIndicator" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "riskType" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "affectedEmployees" JSONB NOT NULL,
    "indicators" JSONB NOT NULL,
    "suggestedActions" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,

    CONSTRAINT "TeamRiskIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIDecisionExplanation" (
    "id" TEXT NOT NULL,
    "decisionType" "RecommendationType" NOT NULL,
    "relatedEntityId" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "inputFeatures" JSONB NOT NULL,
    "featureImportance" JSONB NOT NULL,
    "decisionPath" JSONB NOT NULL,
    "counterfactuals" JSONB,
    "confidenceBreakdown" JSONB NOT NULL,
    "biasCheck" JSONB,
    "humanReadable" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIDecisionExplanation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIModelRegistry" (
    "id" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "trainingData" JSONB NOT NULL,
    "performanceMetrics" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deployedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "AIModelRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HRDecisionLog" (
    "id" TEXT NOT NULL,
    "decisionType" TEXT NOT NULL,
    "relatedEntityType" TEXT NOT NULL,
    "relatedEntityId" TEXT NOT NULL,
    "decisionMaker" TEXT NOT NULL,
    "decisionMakerRole" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reasoning" TEXT,
    "supportingData" JSONB NOT NULL,
    "policyReference" TEXT,
    "approvalChain" JSONB,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "systemContext" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HRDecisionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisputeCase" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reporterId" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "involvedParties" JSONB NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'REPORTED',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "resolution" TEXT,
    "resolutionDate" TIMESTAMP(3),
    "legalReviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisputeCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisputeTimelineEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "actorId" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisputeTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "fileUrl" TEXT,
    "sourceSystem" TEXT,
    "originalTimestamp" TIMESTAMP(3),
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "addedBy" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidencePackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "relatedCaseId" TEXT,
    "requestedBy" TEXT NOT NULL,
    "requestedFor" TEXT,
    "dateRange" JSONB,
    "includesEntities" JSONB NOT NULL,
    "generatedFiles" JSONB NOT NULL,
    "checksum" TEXT,
    "expiresAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastDownloadAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidencePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessStateSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "roles" JSONB NOT NULL,
    "permissions" JSONB NOT NULL,
    "organizationAccess" JSONB NOT NULL,
    "dataAccessLevels" JSONB NOT NULL,
    "activeSession" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessStateSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalTeamAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL,
    "accessibleCases" TEXT[],
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LegalTeamAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchJob" (
    "id" TEXT NOT NULL,
    "type" "BatchJobType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parameters" JSONB NOT NULL,
    "targetCount" INTEGER,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "status" "BatchJobStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "result" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchJobLog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recordId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchJobLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIndex" (
    "id" TEXT NOT NULL,
    "indexName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "documentCount" INTEGER NOT NULL,
    "indexStatus" TEXT NOT NULL,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQueryLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "resultCount" INTEGER NOT NULL,
    "responseTimeMs" INTEGER NOT NULL,
    "clickedResults" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchQueryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DataZoneType" NOT NULL,
    "description" TEXT,
    "encryptionRequired" BOOLEAN NOT NULL DEFAULT false,
    "accessPolicies" JSONB NOT NULL,
    "retentionDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacyZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "anonymizationRules" JSONB NOT NULL,
    "allowedAnalytics" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacyZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacyZoneAccessLog" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "queryDetails" JSONB,
    "resultCount" INTEGER,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivacyZoneAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZeroTrustVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "requiredLevel" "VerificationLevel" NOT NULL,
    "actualLevel" "VerificationLevel" NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "factors" JSONB NOT NULL,
    "riskScore" DOUBLE PRECISION,
    "deviceFingerprint" TEXT,
    "ipAddress" TEXT NOT NULL,
    "geoLocation" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZeroTrustVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnomalyDetection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "anomalyType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detectedPattern" JSONB NOT NULL,
    "baselinePattern" JSONB NOT NULL,
    "deviation" DOUBLE PRECISION NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewResult" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnomalyDetection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "enforcement" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HREvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "classification" "EventClassification" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventPayload" JSONB NOT NULL,
    "metadata" JSONB,
    "sourceSystem" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HREvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataLakeRecord" (
    "id" TEXT NOT NULL,
    "sourceTable" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "partition" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataLakeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSeriesAnalysis" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "organizationId" TEXT,
    "timePeriod" TEXT NOT NULL,
    "periodValue" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "previousValue" DOUBLE PRECISION,
    "changePercent" DOUBLE PRECISION,
    "trend" TEXT,
    "seasonality" JSONB,
    "forecast" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeSeriesAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalDataLink" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "connectionConfig" JSONB NOT NULL,
    "syncFrequency" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL,
    "mappingRules" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalDataLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LongTermTrendReport" (
    "id" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "description" TEXT,
    "timeSpan" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "metrics" JSONB NOT NULL,
    "findings" JSONB NOT NULL,
    "visualizations" JSONB,
    "recommendations" TEXT[],
    "generatedBy" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LongTermTrendReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohortAnalysis" (
    "id" TEXT NOT NULL,
    "cohortType" TEXT NOT NULL,
    "cohortValue" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "timeUnit" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "comparisons" JSONB,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CohortAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProviderConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AIProviderType" NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "apiKeyEncrypted" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" "AIProviderStatus" NOT NULL DEFAULT 'INACTIVE',
    "defaultModel" TEXT,
    "timeout" INTEGER NOT NULL DEFAULT 30000,
    "maxTokens" INTEGER NOT NULL DEFAULT 2048,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "streamingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 60,
    "rateLimitPerHour" INTEGER NOT NULL DEFAULT 1000,
    "lastHealthCheck" TIMESTAMP(3),
    "lastError" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProviderModel" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "contextLength" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "capabilities" TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProviderModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIFeatureModelMapping" (
    "id" TEXT NOT NULL,
    "featureType" "AIFeatureType" NOT NULL,
    "modelId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "maxTokensOverride" INTEGER,
    "temperatureOverride" DOUBLE PRECISION,
    "systemPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIFeatureModelMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIPromptTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "featureType" "AIFeatureType" NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "userPromptTemplate" TEXT NOT NULL,
    "variables" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIPromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAccessPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "roleIds" TEXT[],
    "featureTypes" "AIFeatureType"[],
    "dailyLimit" INTEGER,
    "monthlyLimit" INTEGER,
    "maxTokensPerCall" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIAccessPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AICallLog" (
    "id" TEXT NOT NULL,
    "providerId" TEXT,
    "userId" TEXT NOT NULL,
    "featureType" "AIFeatureType" NOT NULL,
    "modelId" TEXT NOT NULL,
    "requestSummary" TEXT,
    "responseLength" INTEGER,
    "latencyMs" INTEGER,
    "tokenUsage" JSONB,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AICallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objective" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" "OKRLevel" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "organizationId" TEXT,
    "parentId" TEXT,
    "period" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "OKRStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Objective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResult" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "startValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "dueDate" TIMESTAMP(3),
    "status" "OKRStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResultCheckIn" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "checkedBy" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeyResultCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeerReviewCycle" (
    "id" TEXT NOT NULL,
    "evaluationPeriodId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PeriodStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeerReviewCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeerReviewCycleQuestion" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PeerReviewCycleQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeerReview" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "reviewType" "PeerReviewType" NOT NULL,
    "status" "PeerReviewStatus" NOT NULL DEFAULT 'PENDING',
    "overallRating" INTEGER,
    "strengths" TEXT,
    "improvements" TEXT,
    "comments" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PeerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeerReviewResponse" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "rating" INTEGER,
    "textResponse" TEXT,

    CONSTRAINT "PeerReviewResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeerReviewQuestion" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeerReviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlexibleWorkPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workType" "FlexWorkType" NOT NULL,
    "description" TEXT,
    "coreStartTime" TEXT,
    "coreEndTime" TEXT,
    "minDailyHours" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "maxDailyHours" DOUBLE PRECISION NOT NULL DEFAULT 12,
    "maxRemoteDays" INTEGER,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicableOrgs" TEXT[],
    "applicablePositions" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlexibleWorkPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlexWorkRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "requestType" "FlexWorkType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "reason" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlexWorkRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "budget" DECIMAL(15,2),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAssignment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "role" "ProjectRole" NOT NULL,
    "allocation" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "responsibilities" TEXT,
    "achievements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectOutcome" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "impactType" TEXT NOT NULL,
    "quantifiedValue" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationDispute" (
    "id" TEXT NOT NULL,
    "disputeType" "EvaluationDisputeType" NOT NULL,
    "relatedEntityType" TEXT NOT NULL,
    "relatedEntityId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "originalValue" JSONB NOT NULL,
    "disputedPoints" TEXT NOT NULL,
    "desiredOutcome" TEXT,
    "supportingDocs" TEXT[],
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewDate" TIMESTAMP(3),
    "decision" "EvaluationDisputeDecision",
    "decisionReason" TEXT,
    "modifiedValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationDispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeCertification" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingOrg" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "documentUrl" TEXT,
    "category" "CertificationCategory" NOT NULL DEFAULT 'OTHER',
    "level" TEXT,
    "isExpiringSoon" BOOLEAN NOT NULL DEFAULT false,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "menuPath" TEXT NOT NULL,
    "menuLabel" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminDelegation" (
    "id" TEXT NOT NULL,
    "delegatorId" TEXT NOT NULL,
    "delegateeId" TEXT NOT NULL,
    "delegationType" TEXT NOT NULL,
    "scopeModules" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminDelegation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLimit" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "budgetType" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "limitAmount" DECIMAL(15,2) NOT NULL,
    "usedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(15,2) NOT NULL,
    "alertThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "isAlerted" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSchedule" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "interviewerName" TEXT,
    "stage" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "location" TEXT,
    "meetingType" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "feedbackId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RnR" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RnR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RnRAssignment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "rnrId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "RnRAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaborCostActual" (
    "id" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "organizationId" TEXT,
    "baseSalaryActual" DECIMAL(15,2) NOT NULL,
    "bonusActual" DECIMAL(15,2) NOT NULL,
    "benefitsActual" DECIMAL(15,2) NOT NULL,
    "totalActual" DECIMAL(15,2) NOT NULL,
    "variance" DECIMAL(15,2) NOT NULL,
    "variancePercent" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaborCostActual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentRule" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "appointmentType" "AppointmentType" NOT NULL,
    "conditions" JSONB NOT NULL,
    "validations" JSONB NOT NULL,
    "autoApprovalRules" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IDP" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "overallGoal" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IDP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IDPGoal" (
    "id" TEXT NOT NULL,
    "idpId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IDPGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IDPProgress" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "evidenceUrl" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,

    CONSTRAINT "IDPProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkScheduleTemplate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scheduleType" TEXT NOT NULL,
    "coreHoursStart" TEXT,
    "coreHoursEnd" TEXT,
    "dailyWorkHours" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "weeklyWorkHours" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "flexibilityRules" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkScheduleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeWorkSchedule" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "customRules" JSONB,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeWorkSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeavePromotionCampaign" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetOrganizations" TEXT[],
    "minUnusedDays" DOUBLE PRECISION NOT NULL,
    "promotionPeriodStart" TIMESTAMP(3) NOT NULL,
    "promotionPeriodEnd" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeavePromotionCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveUsageTarget" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "targetDays" DOUBLE PRECISION NOT NULL,
    "currentUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "lastNotifiedAt" TIMESTAMP(3),

    CONSTRAINT "LeaveUsageTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbsenceOfLeave" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "absenceType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "expectedReturnDate" TIMESTAMP(3) NOT NULL,
    "actualReturnDate" TIMESTAMP(3),
    "reason" TEXT,
    "relatedDocuments" JSONB,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "approvalId" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbsenceOfLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessTrip" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvalId" TEXT,
    "budgetId" TEXT,
    "totalExpense" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripExpense" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "description" TEXT,
    "receiptUrl" TEXT,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripBudget" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "totalBudget" DECIMAL(15,2) NOT NULL,
    "usedBudget" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "fromPositionId" TEXT NOT NULL,
    "toPositionId" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "performanceScore" DOUBLE PRECISION,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvalId" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardPunishment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "severity" TEXT,
    "expiryDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "issuedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardPunishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KCBLog" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "device" TEXT,
    "rawData" JSONB,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "attendanceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KCBLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalApprovalLink" (
    "id" TEXT NOT NULL,
    "localApprovalId" TEXT NOT NULL,
    "externalSystem" TEXT NOT NULL,
    "externalApprovalId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalApprovalLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRefund" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "trainingId" TEXT,
    "externalCourse" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "requestedAmount" DECIMAL(15,2) NOT NULL,
    "approvedAmount" DECIMAL(15,2),
    "completionCertUrl" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvalId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingCredits" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requiredCredits" DOUBLE PRECISION NOT NULL,
    "earnedCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "excessCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingCredits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalTrainingCertificate" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "completionDate" TIMESTAMP(3) NOT NULL,
    "certificateUrl" TEXT NOT NULL,
    "credits" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalTrainingCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OnboardingTemplate_targetJobId_idx" ON "OnboardingTemplate"("targetJobId");

-- CreateIndex
CREATE INDEX "OnboardingTemplate_targetOrgId_idx" ON "OnboardingTemplate"("targetOrgId");

-- CreateIndex
CREATE INDEX "OnboardingTemplateTask_templateId_idx" ON "OnboardingTemplateTask"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingChecklist_employeeId_key" ON "OnboardingChecklist"("employeeId");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_status_idx" ON "OnboardingChecklist"("status");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_startDate_idx" ON "OnboardingChecklist"("startDate");

-- CreateIndex
CREATE INDEX "OnboardingTask_checklistId_idx" ON "OnboardingTask"("checklistId");

-- CreateIndex
CREATE INDEX "OnboardingTask_status_idx" ON "OnboardingTask"("status");

-- CreateIndex
CREATE INDEX "OnboardingTask_assigneeId_idx" ON "OnboardingTask"("assigneeId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorAssignment_checklistId_key" ON "MentorAssignment"("checklistId");

-- CreateIndex
CREATE INDEX "MentorAssignment_menteeId_idx" ON "MentorAssignment"("menteeId");

-- CreateIndex
CREATE INDEX "MentorAssignment_mentorId_idx" ON "MentorAssignment"("mentorId");

-- CreateIndex
CREATE INDEX "MentorFeedback_assignmentId_idx" ON "MentorFeedback"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "OffboardingChecklist_employeeId_key" ON "OffboardingChecklist"("employeeId");

-- CreateIndex
CREATE INDEX "OffboardingChecklist_status_idx" ON "OffboardingChecklist"("status");

-- CreateIndex
CREATE INDEX "OffboardingChecklist_lastWorkingDate_idx" ON "OffboardingChecklist"("lastWorkingDate");

-- CreateIndex
CREATE INDEX "OffboardingTask_checklistId_idx" ON "OffboardingTask"("checklistId");

-- CreateIndex
CREATE INDEX "OffboardingTask_status_idx" ON "OffboardingTask"("status");

-- CreateIndex
CREATE INDEX "KnowledgeTransfer_checklistId_idx" ON "KnowledgeTransfer"("checklistId");

-- CreateIndex
CREATE INDEX "KnowledgeTransfer_recipientId_idx" ON "KnowledgeTransfer"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "ExitInterview_checklistId_key" ON "ExitInterview"("checklistId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillTaxonomy_code_key" ON "SkillTaxonomy"("code");

-- CreateIndex
CREATE INDEX "SkillTaxonomy_category_idx" ON "SkillTaxonomy"("category");

-- CreateIndex
CREATE INDEX "SkillTaxonomy_parentId_idx" ON "SkillTaxonomy"("parentId");

-- CreateIndex
CREATE INDEX "EmployeeSkill_employeeId_idx" ON "EmployeeSkill"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeSkill_skillId_idx" ON "EmployeeSkill"("skillId");

-- CreateIndex
CREATE INDEX "EmployeeSkill_currentLevel_idx" ON "EmployeeSkill"("currentLevel");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSkill_employeeId_skillId_key" ON "EmployeeSkill"("employeeId", "skillId");

-- CreateIndex
CREATE INDEX "SkillAssessment_employeeSkillId_idx" ON "SkillAssessment"("employeeSkillId");

-- CreateIndex
CREATE INDEX "SkillAssessment_assessedAt_idx" ON "SkillAssessment"("assessedAt");

-- CreateIndex
CREATE INDEX "SkillEndorsement_employeeSkillId_idx" ON "SkillEndorsement"("employeeSkillId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillEndorsement_employeeSkillId_endorserId_key" ON "SkillEndorsement"("employeeSkillId", "endorserId");

-- CreateIndex
CREATE INDEX "JobRequiredSkill_jobId_idx" ON "JobRequiredSkill"("jobId");

-- CreateIndex
CREATE INDEX "JobRequiredSkill_skillId_idx" ON "JobRequiredSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "JobRequiredSkill_jobId_skillId_key" ON "JobRequiredSkill"("jobId", "skillId");

-- CreateIndex
CREATE INDEX "SkillGapAnalysis_employeeId_idx" ON "SkillGapAnalysis"("employeeId");

-- CreateIndex
CREATE INDEX "SkillGapAnalysis_jobId_idx" ON "SkillGapAnalysis"("jobId");

-- CreateIndex
CREATE INDEX "SkillGapAnalysis_analysisDate_idx" ON "SkillGapAnalysis"("analysisDate");

-- CreateIndex
CREATE INDEX "ProjectRequiredSkill_projectId_idx" ON "ProjectRequiredSkill"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRequiredSkill_projectId_skillId_key" ON "ProjectRequiredSkill"("projectId", "skillId");

-- CreateIndex
CREATE INDEX "CourseSkill_courseId_idx" ON "CourseSkill"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSkill_courseId_skillId_key" ON "CourseSkill"("courseId", "skillId");

-- CreateIndex
CREATE INDEX "StaffingRecommendation_projectId_idx" ON "StaffingRecommendation"("projectId");

-- CreateIndex
CREATE INDEX "StaffingRecommendation_employeeId_idx" ON "StaffingRecommendation"("employeeId");

-- CreateIndex
CREATE INDEX "StaffingRecommendation_matchScore_idx" ON "StaffingRecommendation"("matchScore");

-- CreateIndex
CREATE INDEX "InternalOpportunity_type_idx" ON "InternalOpportunity"("type");

-- CreateIndex
CREATE INDEX "InternalOpportunity_status_idx" ON "InternalOpportunity"("status");

-- CreateIndex
CREATE INDEX "InternalOpportunity_organizationId_idx" ON "InternalOpportunity"("organizationId");

-- CreateIndex
CREATE INDEX "InternalOpportunity_closingDate_idx" ON "InternalOpportunity"("closingDate");

-- CreateIndex
CREATE INDEX "InternalApplication_opportunityId_idx" ON "InternalApplication"("opportunityId");

-- CreateIndex
CREATE INDEX "InternalApplication_applicantId_idx" ON "InternalApplication"("applicantId");

-- CreateIndex
CREATE INDEX "InternalApplication_status_idx" ON "InternalApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InternalApplication_opportunityId_applicantId_key" ON "InternalApplication"("opportunityId", "applicantId");

-- CreateIndex
CREATE INDEX "InternalInterview_applicationId_idx" ON "InternalInterview"("applicationId");

-- CreateIndex
CREATE INDEX "InternalInterview_interviewerId_idx" ON "InternalInterview"("interviewerId");

-- CreateIndex
CREATE INDEX "OpportunityMatch_opportunityId_idx" ON "OpportunityMatch"("opportunityId");

-- CreateIndex
CREATE INDEX "OpportunityMatch_employeeId_idx" ON "OpportunityMatch"("employeeId");

-- CreateIndex
CREATE INDEX "OpportunityMatch_matchScore_idx" ON "OpportunityMatch"("matchScore");

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityMatch_opportunityId_employeeId_key" ON "OpportunityMatch"("opportunityId", "employeeId");

-- CreateIndex
CREATE INDEX "CareerMovement_employeeId_idx" ON "CareerMovement"("employeeId");

-- CreateIndex
CREATE INDEX "CareerMovement_fromOrgId_idx" ON "CareerMovement"("fromOrgId");

-- CreateIndex
CREATE INDEX "CareerMovement_toOrgId_idx" ON "CareerMovement"("toOrgId");

-- CreateIndex
CREATE INDEX "CareerMovement_startDate_idx" ON "CareerMovement"("startDate");

-- CreateIndex
CREATE INDEX "PromotionRecommendation_employeeId_idx" ON "PromotionRecommendation"("employeeId");

-- CreateIndex
CREATE INDEX "PromotionRecommendation_recommendation_idx" ON "PromotionRecommendation"("recommendation");

-- CreateIndex
CREATE INDEX "PromotionRecommendation_generatedAt_idx" ON "PromotionRecommendation"("generatedAt");

-- CreateIndex
CREATE INDEX "CompensationSimulation_simulationType_idx" ON "CompensationSimulation"("simulationType");

-- CreateIndex
CREATE INDEX "CompensationSimulation_targetId_idx" ON "CompensationSimulation"("targetId");

-- CreateIndex
CREATE INDEX "AttritionSignal_employeeId_idx" ON "AttritionSignal"("employeeId");

-- CreateIndex
CREATE INDEX "AttritionSignal_signalType_idx" ON "AttritionSignal"("signalType");

-- CreateIndex
CREATE INDEX "AttritionSignal_detectedAt_idx" ON "AttritionSignal"("detectedAt");

-- CreateIndex
CREATE INDEX "AttritionSignal_signalStrength_idx" ON "AttritionSignal"("signalStrength");

-- CreateIndex
CREATE INDEX "TeamRiskIndicator_organizationId_idx" ON "TeamRiskIndicator"("organizationId");

-- CreateIndex
CREATE INDEX "TeamRiskIndicator_riskType_idx" ON "TeamRiskIndicator"("riskType");

-- CreateIndex
CREATE INDEX "TeamRiskIndicator_riskLevel_idx" ON "TeamRiskIndicator"("riskLevel");

-- CreateIndex
CREATE INDEX "TeamRiskIndicator_detectedAt_idx" ON "TeamRiskIndicator"("detectedAt");

-- CreateIndex
CREATE INDEX "AIDecisionExplanation_decisionType_idx" ON "AIDecisionExplanation"("decisionType");

-- CreateIndex
CREATE INDEX "AIDecisionExplanation_relatedEntityId_idx" ON "AIDecisionExplanation"("relatedEntityId");

-- CreateIndex
CREATE INDEX "AIDecisionExplanation_createdAt_idx" ON "AIDecisionExplanation"("createdAt");

-- CreateIndex
CREATE INDEX "AIModelRegistry_modelName_idx" ON "AIModelRegistry"("modelName");

-- CreateIndex
CREATE INDEX "AIModelRegistry_isActive_idx" ON "AIModelRegistry"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AIModelRegistry_modelName_version_key" ON "AIModelRegistry"("modelName", "version");

-- CreateIndex
CREATE INDEX "HRDecisionLog_decisionType_idx" ON "HRDecisionLog"("decisionType");

-- CreateIndex
CREATE INDEX "HRDecisionLog_relatedEntityType_relatedEntityId_idx" ON "HRDecisionLog"("relatedEntityType", "relatedEntityId");

-- CreateIndex
CREATE INDEX "HRDecisionLog_decisionMaker_idx" ON "HRDecisionLog"("decisionMaker");

-- CreateIndex
CREATE INDEX "HRDecisionLog_effectiveDate_idx" ON "HRDecisionLog"("effectiveDate");

-- CreateIndex
CREATE INDEX "HRDecisionLog_createdAt_idx" ON "HRDecisionLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DisputeCase_caseNumber_key" ON "DisputeCase"("caseNumber");

-- CreateIndex
CREATE INDEX "DisputeCase_status_idx" ON "DisputeCase"("status");

-- CreateIndex
CREATE INDEX "DisputeCase_category_idx" ON "DisputeCase"("category");

-- CreateIndex
CREATE INDEX "DisputeCase_assignedTo_idx" ON "DisputeCase"("assignedTo");

-- CreateIndex
CREATE INDEX "DisputeCase_createdAt_idx" ON "DisputeCase"("createdAt");

-- CreateIndex
CREATE INDEX "DisputeTimelineEvent_caseId_idx" ON "DisputeTimelineEvent"("caseId");

-- CreateIndex
CREATE INDEX "DisputeTimelineEvent_eventDate_idx" ON "DisputeTimelineEvent"("eventDate");

-- CreateIndex
CREATE INDEX "EvidenceItem_caseId_idx" ON "EvidenceItem"("caseId");

-- CreateIndex
CREATE INDEX "EvidenceItem_type_idx" ON "EvidenceItem"("type");

-- CreateIndex
CREATE INDEX "EvidencePackage_purpose_idx" ON "EvidencePackage"("purpose");

-- CreateIndex
CREATE INDEX "EvidencePackage_relatedCaseId_idx" ON "EvidencePackage"("relatedCaseId");

-- CreateIndex
CREATE INDEX "AccessStateSnapshot_userId_idx" ON "AccessStateSnapshot"("userId");

-- CreateIndex
CREATE INDEX "AccessStateSnapshot_snapshotDate_idx" ON "AccessStateSnapshot"("snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "LegalTeamAccess_userId_key" ON "LegalTeamAccess"("userId");

-- CreateIndex
CREATE INDEX "LegalTeamAccess_userId_idx" ON "LegalTeamAccess"("userId");

-- CreateIndex
CREATE INDEX "LegalTeamAccess_isActive_idx" ON "LegalTeamAccess"("isActive");

-- CreateIndex
CREATE INDEX "BatchJob_type_idx" ON "BatchJob"("type");

-- CreateIndex
CREATE INDEX "BatchJob_status_idx" ON "BatchJob"("status");

-- CreateIndex
CREATE INDEX "BatchJob_scheduledAt_idx" ON "BatchJob"("scheduledAt");

-- CreateIndex
CREATE INDEX "BatchJobLog_jobId_idx" ON "BatchJobLog"("jobId");

-- CreateIndex
CREATE INDEX "BatchJobLog_level_idx" ON "BatchJobLog"("level");

-- CreateIndex
CREATE UNIQUE INDEX "SearchIndex_indexName_key" ON "SearchIndex"("indexName");

-- CreateIndex
CREATE INDEX "SearchQueryLog_userId_idx" ON "SearchQueryLog"("userId");

-- CreateIndex
CREATE INDEX "SearchQueryLog_createdAt_idx" ON "SearchQueryLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DataZone_name_key" ON "DataZone"("name");

-- CreateIndex
CREATE INDEX "PrivacyZoneAccessLog_zoneId_idx" ON "PrivacyZoneAccessLog"("zoneId");

-- CreateIndex
CREATE INDEX "PrivacyZoneAccessLog_userId_idx" ON "PrivacyZoneAccessLog"("userId");

-- CreateIndex
CREATE INDEX "PrivacyZoneAccessLog_accessedAt_idx" ON "PrivacyZoneAccessLog"("accessedAt");

-- CreateIndex
CREATE INDEX "ZeroTrustVerification_userId_idx" ON "ZeroTrustVerification"("userId");

-- CreateIndex
CREATE INDEX "ZeroTrustVerification_sessionId_idx" ON "ZeroTrustVerification"("sessionId");

-- CreateIndex
CREATE INDEX "ZeroTrustVerification_passed_idx" ON "ZeroTrustVerification"("passed");

-- CreateIndex
CREATE INDEX "ZeroTrustVerification_verifiedAt_idx" ON "ZeroTrustVerification"("verifiedAt");

-- CreateIndex
CREATE INDEX "AnomalyDetection_userId_idx" ON "AnomalyDetection"("userId");

-- CreateIndex
CREATE INDEX "AnomalyDetection_anomalyType_idx" ON "AnomalyDetection"("anomalyType");

-- CreateIndex
CREATE INDEX "AnomalyDetection_severity_idx" ON "AnomalyDetection"("severity");

-- CreateIndex
CREATE INDEX "AnomalyDetection_isReviewed_idx" ON "AnomalyDetection"("isReviewed");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityPolicy_name_key" ON "SecurityPolicy"("name");

-- CreateIndex
CREATE INDEX "HREvent_eventType_idx" ON "HREvent"("eventType");

-- CreateIndex
CREATE INDEX "HREvent_classification_idx" ON "HREvent"("classification");

-- CreateIndex
CREATE INDEX "HREvent_entityType_entityId_idx" ON "HREvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "HREvent_occurredAt_idx" ON "HREvent"("occurredAt");

-- CreateIndex
CREATE INDEX "DataLakeRecord_sourceTable_recordId_idx" ON "DataLakeRecord"("sourceTable", "recordId");

-- CreateIndex
CREATE INDEX "DataLakeRecord_partition_idx" ON "DataLakeRecord"("partition");

-- CreateIndex
CREATE INDEX "DataLakeRecord_isLatest_idx" ON "DataLakeRecord"("isLatest");

-- CreateIndex
CREATE INDEX "TimeSeriesAnalysis_metricName_idx" ON "TimeSeriesAnalysis"("metricName");

-- CreateIndex
CREATE INDEX "TimeSeriesAnalysis_organizationId_idx" ON "TimeSeriesAnalysis"("organizationId");

-- CreateIndex
CREATE INDEX "TimeSeriesAnalysis_periodValue_idx" ON "TimeSeriesAnalysis"("periodValue");

-- CreateIndex
CREATE UNIQUE INDEX "TimeSeriesAnalysis_metricName_organizationId_timePeriod_per_key" ON "TimeSeriesAnalysis"("metricName", "organizationId", "timePeriod", "periodValue");

-- CreateIndex
CREATE INDEX "ExternalDataLink_sourceType_idx" ON "ExternalDataLink"("sourceType");

-- CreateIndex
CREATE INDEX "ExternalDataLink_isActive_idx" ON "ExternalDataLink"("isActive");

-- CreateIndex
CREATE INDEX "LongTermTrendReport_reportName_idx" ON "LongTermTrendReport"("reportName");

-- CreateIndex
CREATE INDEX "LongTermTrendReport_startDate_idx" ON "LongTermTrendReport"("startDate");

-- CreateIndex
CREATE INDEX "CohortAnalysis_cohortType_cohortValue_idx" ON "CohortAnalysis"("cohortType", "cohortValue");

-- CreateIndex
CREATE INDEX "CohortAnalysis_analysisType_idx" ON "CohortAnalysis"("analysisType");

-- CreateIndex
CREATE INDEX "AIProviderConfig_type_idx" ON "AIProviderConfig"("type");

-- CreateIndex
CREATE INDEX "AIProviderConfig_isDefault_idx" ON "AIProviderConfig"("isDefault");

-- CreateIndex
CREATE INDEX "AIProviderConfig_status_idx" ON "AIProviderConfig"("status");

-- CreateIndex
CREATE INDEX "AIProviderModel_providerId_idx" ON "AIProviderModel"("providerId");

-- CreateIndex
CREATE INDEX "AIProviderModel_isAvailable_idx" ON "AIProviderModel"("isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "AIProviderModel_providerId_modelId_key" ON "AIProviderModel"("providerId", "modelId");

-- CreateIndex
CREATE INDEX "AIFeatureModelMapping_featureType_idx" ON "AIFeatureModelMapping"("featureType");

-- CreateIndex
CREATE UNIQUE INDEX "AIFeatureModelMapping_featureType_modelId_key" ON "AIFeatureModelMapping"("featureType", "modelId");

-- CreateIndex
CREATE UNIQUE INDEX "AIPromptTemplate_name_key" ON "AIPromptTemplate"("name");

-- CreateIndex
CREATE INDEX "AIPromptTemplate_featureType_idx" ON "AIPromptTemplate"("featureType");

-- CreateIndex
CREATE INDEX "AIPromptTemplate_isActive_idx" ON "AIPromptTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AIAccessPolicy_name_key" ON "AIAccessPolicy"("name");

-- CreateIndex
CREATE INDEX "AIAccessPolicy_isActive_idx" ON "AIAccessPolicy"("isActive");

-- CreateIndex
CREATE INDEX "AICallLog_userId_idx" ON "AICallLog"("userId");

-- CreateIndex
CREATE INDEX "AICallLog_providerId_idx" ON "AICallLog"("providerId");

-- CreateIndex
CREATE INDEX "AICallLog_featureType_idx" ON "AICallLog"("featureType");

-- CreateIndex
CREATE INDEX "AICallLog_status_idx" ON "AICallLog"("status");

-- CreateIndex
CREATE INDEX "AICallLog_createdAt_idx" ON "AICallLog"("createdAt");

-- CreateIndex
CREATE INDEX "Objective_ownerId_idx" ON "Objective"("ownerId");

-- CreateIndex
CREATE INDEX "Objective_organizationId_idx" ON "Objective"("organizationId");

-- CreateIndex
CREATE INDEX "Objective_period_idx" ON "Objective"("period");

-- CreateIndex
CREATE INDEX "Objective_status_idx" ON "Objective"("status");

-- CreateIndex
CREATE INDEX "KeyResult_objectiveId_idx" ON "KeyResult"("objectiveId");

-- CreateIndex
CREATE INDEX "KeyResult_status_idx" ON "KeyResult"("status");

-- CreateIndex
CREATE INDEX "KeyResultCheckIn_keyResultId_idx" ON "KeyResultCheckIn"("keyResultId");

-- CreateIndex
CREATE INDEX "KeyResultCheckIn_checkedAt_idx" ON "KeyResultCheckIn"("checkedAt");

-- CreateIndex
CREATE INDEX "PeerReviewCycle_evaluationPeriodId_idx" ON "PeerReviewCycle"("evaluationPeriodId");

-- CreateIndex
CREATE INDEX "PeerReviewCycle_status_idx" ON "PeerReviewCycle"("status");

-- CreateIndex
CREATE INDEX "PeerReviewCycleQuestion_cycleId_idx" ON "PeerReviewCycleQuestion"("cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "PeerReviewCycleQuestion_cycleId_questionId_key" ON "PeerReviewCycleQuestion"("cycleId", "questionId");

-- CreateIndex
CREATE INDEX "PeerReview_cycleId_idx" ON "PeerReview"("cycleId");

-- CreateIndex
CREATE INDEX "PeerReview_reviewerId_idx" ON "PeerReview"("reviewerId");

-- CreateIndex
CREATE INDEX "PeerReview_revieweeId_idx" ON "PeerReview"("revieweeId");

-- CreateIndex
CREATE INDEX "PeerReview_status_idx" ON "PeerReview"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PeerReview_cycleId_reviewerId_revieweeId_key" ON "PeerReview"("cycleId", "reviewerId", "revieweeId");

-- CreateIndex
CREATE INDEX "PeerReviewResponse_reviewId_idx" ON "PeerReviewResponse"("reviewId");

-- CreateIndex
CREATE INDEX "PeerReviewQuestion_category_idx" ON "PeerReviewQuestion"("category");

-- CreateIndex
CREATE INDEX "PeerReviewQuestion_isActive_idx" ON "PeerReviewQuestion"("isActive");

-- CreateIndex
CREATE INDEX "FlexibleWorkPolicy_workType_idx" ON "FlexibleWorkPolicy"("workType");

-- CreateIndex
CREATE INDEX "FlexibleWorkPolicy_isActive_idx" ON "FlexibleWorkPolicy"("isActive");

-- CreateIndex
CREATE INDEX "FlexWorkRequest_employeeId_idx" ON "FlexWorkRequest"("employeeId");

-- CreateIndex
CREATE INDEX "FlexWorkRequest_policyId_idx" ON "FlexWorkRequest"("policyId");

-- CreateIndex
CREATE INDEX "FlexWorkRequest_status_idx" ON "FlexWorkRequest"("status");

-- CreateIndex
CREATE INDEX "FlexWorkRequest_startDate_idx" ON "FlexWorkRequest"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE INDEX "Project_organizationId_idx" ON "Project"("organizationId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_startDate_idx" ON "Project"("startDate");

-- CreateIndex
CREATE INDEX "ProjectAssignment_projectId_idx" ON "ProjectAssignment"("projectId");

-- CreateIndex
CREATE INDEX "ProjectAssignment_employeeId_idx" ON "ProjectAssignment"("employeeId");

-- CreateIndex
CREATE INDEX "ProjectAssignment_startDate_idx" ON "ProjectAssignment"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAssignment_projectId_employeeId_key" ON "ProjectAssignment"("projectId", "employeeId");

-- CreateIndex
CREATE INDEX "ProjectOutcome_projectId_idx" ON "ProjectOutcome"("projectId");

-- CreateIndex
CREATE INDEX "ProjectOutcome_impactType_idx" ON "ProjectOutcome"("impactType");

-- CreateIndex
CREATE INDEX "EvaluationDispute_employeeId_idx" ON "EvaluationDispute"("employeeId");

-- CreateIndex
CREATE INDEX "EvaluationDispute_status_idx" ON "EvaluationDispute"("status");

-- CreateIndex
CREATE INDEX "EvaluationDispute_disputeType_idx" ON "EvaluationDispute"("disputeType");

-- CreateIndex
CREATE INDEX "EvaluationDispute_relatedEntityType_relatedEntityId_idx" ON "EvaluationDispute"("relatedEntityType", "relatedEntityId");

-- CreateIndex
CREATE INDEX "EmployeeCertification_employeeId_idx" ON "EmployeeCertification"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeCertification_expiryDate_idx" ON "EmployeeCertification"("expiryDate");

-- CreateIndex
CREATE INDEX "EmployeeCertification_isExpiringSoon_idx" ON "EmployeeCertification"("isExpiringSoon");

-- CreateIndex
CREATE INDEX "EmployeeCertification_isExpired_idx" ON "EmployeeCertification"("isExpired");

-- CreateIndex
CREATE INDEX "EmployeeCertification_category_idx" ON "EmployeeCertification"("category");

-- CreateIndex
CREATE INDEX "UserFavorite_userId_idx" ON "UserFavorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavorite_userId_menuPath_key" ON "UserFavorite"("userId", "menuPath");

-- CreateIndex
CREATE INDEX "AdminDelegation_delegatorId_idx" ON "AdminDelegation"("delegatorId");

-- CreateIndex
CREATE INDEX "AdminDelegation_delegateeId_idx" ON "AdminDelegation"("delegateeId");

-- CreateIndex
CREATE INDEX "AdminDelegation_isActive_idx" ON "AdminDelegation"("isActive");

-- CreateIndex
CREATE INDEX "AdminDelegation_startDate_endDate_idx" ON "AdminDelegation"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "BudgetLimit_organizationId_idx" ON "BudgetLimit"("organizationId");

-- CreateIndex
CREATE INDEX "BudgetLimit_year_idx" ON "BudgetLimit"("year");

-- CreateIndex
CREATE INDEX "BudgetLimit_budgetType_idx" ON "BudgetLimit"("budgetType");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetLimit_organizationId_budgetType_year_quarter_key" ON "BudgetLimit"("organizationId", "budgetType", "year", "quarter");

-- CreateIndex
CREATE INDEX "InterviewSchedule_applicationId_idx" ON "InterviewSchedule"("applicationId");

-- CreateIndex
CREATE INDEX "InterviewSchedule_interviewerId_idx" ON "InterviewSchedule"("interviewerId");

-- CreateIndex
CREATE INDEX "InterviewSchedule_scheduledAt_idx" ON "InterviewSchedule"("scheduledAt");

-- CreateIndex
CREATE INDEX "InterviewSchedule_status_idx" ON "InterviewSchedule"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RnR_code_key" ON "RnR"("code");

-- CreateIndex
CREATE INDEX "RnR_category_idx" ON "RnR"("category");

-- CreateIndex
CREATE INDEX "RnR_level_idx" ON "RnR"("level");

-- CreateIndex
CREATE INDEX "RnRAssignment_employeeId_idx" ON "RnRAssignment"("employeeId");

-- CreateIndex
CREATE INDEX "RnRAssignment_rnrId_idx" ON "RnRAssignment"("rnrId");

-- CreateIndex
CREATE UNIQUE INDEX "RnRAssignment_employeeId_rnrId_key" ON "RnRAssignment"("employeeId", "rnrId");

-- CreateIndex
CREATE INDEX "LaborCostActual_yearMonth_idx" ON "LaborCostActual"("yearMonth");

-- CreateIndex
CREATE INDEX "LaborCostActual_organizationId_idx" ON "LaborCostActual"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "LaborCostActual_yearMonth_organizationId_key" ON "LaborCostActual"("yearMonth", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentRule_code_key" ON "AppointmentRule"("code");

-- CreateIndex
CREATE INDEX "AppointmentRule_appointmentType_idx" ON "AppointmentRule"("appointmentType");

-- CreateIndex
CREATE INDEX "AppointmentRule_isActive_idx" ON "AppointmentRule"("isActive");

-- CreateIndex
CREATE INDEX "IDP_employeeId_idx" ON "IDP"("employeeId");

-- CreateIndex
CREATE INDEX "IDP_status_idx" ON "IDP"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IDP_employeeId_year_key" ON "IDP"("employeeId", "year");

-- CreateIndex
CREATE INDEX "IDPGoal_idpId_idx" ON "IDPGoal"("idpId");

-- CreateIndex
CREATE INDEX "IDPGoal_status_idx" ON "IDPGoal"("status");

-- CreateIndex
CREATE INDEX "IDPProgress_goalId_idx" ON "IDPProgress"("goalId");

-- CreateIndex
CREATE INDEX "IDPProgress_recordedAt_idx" ON "IDPProgress"("recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkScheduleTemplate_code_key" ON "WorkScheduleTemplate"("code");

-- CreateIndex
CREATE INDEX "WorkScheduleTemplate_scheduleType_idx" ON "WorkScheduleTemplate"("scheduleType");

-- CreateIndex
CREATE INDEX "WorkScheduleTemplate_isActive_idx" ON "WorkScheduleTemplate"("isActive");

-- CreateIndex
CREATE INDEX "EmployeeWorkSchedule_employeeId_idx" ON "EmployeeWorkSchedule"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeWorkSchedule_templateId_idx" ON "EmployeeWorkSchedule"("templateId");

-- CreateIndex
CREATE INDEX "EmployeeWorkSchedule_startDate_idx" ON "EmployeeWorkSchedule"("startDate");

-- CreateIndex
CREATE INDEX "LeavePromotionCampaign_year_idx" ON "LeavePromotionCampaign"("year");

-- CreateIndex
CREATE INDEX "LeavePromotionCampaign_isActive_idx" ON "LeavePromotionCampaign"("isActive");

-- CreateIndex
CREATE INDEX "LeaveUsageTarget_campaignId_idx" ON "LeaveUsageTarget"("campaignId");

-- CreateIndex
CREATE INDEX "LeaveUsageTarget_employeeId_idx" ON "LeaveUsageTarget"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveUsageTarget_campaignId_employeeId_key" ON "LeaveUsageTarget"("campaignId", "employeeId");

-- CreateIndex
CREATE INDEX "AbsenceOfLeave_employeeId_idx" ON "AbsenceOfLeave"("employeeId");

-- CreateIndex
CREATE INDEX "AbsenceOfLeave_status_idx" ON "AbsenceOfLeave"("status");

-- CreateIndex
CREATE INDEX "AbsenceOfLeave_absenceType_idx" ON "AbsenceOfLeave"("absenceType");

-- CreateIndex
CREATE INDEX "BusinessTrip_employeeId_idx" ON "BusinessTrip"("employeeId");

-- CreateIndex
CREATE INDEX "BusinessTrip_status_idx" ON "BusinessTrip"("status");

-- CreateIndex
CREATE INDEX "BusinessTrip_startDate_idx" ON "BusinessTrip"("startDate");

-- CreateIndex
CREATE INDEX "TripExpense_tripId_idx" ON "TripExpense"("tripId");

-- CreateIndex
CREATE INDEX "TripExpense_category_idx" ON "TripExpense"("category");

-- CreateIndex
CREATE INDEX "TripBudget_organizationId_idx" ON "TripBudget"("organizationId");

-- CreateIndex
CREATE INDEX "TripBudget_year_idx" ON "TripBudget"("year");

-- CreateIndex
CREATE UNIQUE INDEX "TripBudget_organizationId_year_quarter_key" ON "TripBudget"("organizationId", "year", "quarter");

-- CreateIndex
CREATE INDEX "Promotion_employeeId_idx" ON "Promotion"("employeeId");

-- CreateIndex
CREATE INDEX "Promotion_effectiveDate_idx" ON "Promotion"("effectiveDate");

-- CreateIndex
CREATE INDEX "Promotion_status_idx" ON "Promotion"("status");

-- CreateIndex
CREATE INDEX "RewardPunishment_employeeId_idx" ON "RewardPunishment"("employeeId");

-- CreateIndex
CREATE INDEX "RewardPunishment_type_idx" ON "RewardPunishment"("type");

-- CreateIndex
CREATE INDEX "RewardPunishment_date_idx" ON "RewardPunishment"("date");

-- CreateIndex
CREATE INDEX "KCBLog_employeeId_idx" ON "KCBLog"("employeeId");

-- CreateIndex
CREATE INDEX "KCBLog_eventTime_idx" ON "KCBLog"("eventTime");

-- CreateIndex
CREATE INDEX "KCBLog_processed_idx" ON "KCBLog"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalApprovalLink_localApprovalId_key" ON "ExternalApprovalLink"("localApprovalId");

-- CreateIndex
CREATE INDEX "ExternalApprovalLink_externalSystem_idx" ON "ExternalApprovalLink"("externalSystem");

-- CreateIndex
CREATE INDEX "ExternalApprovalLink_externalApprovalId_idx" ON "ExternalApprovalLink"("externalApprovalId");

-- CreateIndex
CREATE INDEX "ExternalApprovalLink_status_idx" ON "ExternalApprovalLink"("status");

-- CreateIndex
CREATE INDEX "TrainingRefund_employeeId_idx" ON "TrainingRefund"("employeeId");

-- CreateIndex
CREATE INDEX "TrainingRefund_status_idx" ON "TrainingRefund"("status");

-- CreateIndex
CREATE INDEX "TrainingCredits_employeeId_idx" ON "TrainingCredits"("employeeId");

-- CreateIndex
CREATE INDEX "TrainingCredits_year_idx" ON "TrainingCredits"("year");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingCredits_employeeId_year_key" ON "TrainingCredits"("employeeId", "year");

-- CreateIndex
CREATE INDEX "ExternalTrainingCertificate_employeeId_idx" ON "ExternalTrainingCertificate"("employeeId");

-- CreateIndex
CREATE INDEX "ExternalTrainingCertificate_status_idx" ON "ExternalTrainingCertificate"("status");

-- AddForeignKey
ALTER TABLE "OnboardingTemplateTask" ADD CONSTRAINT "OnboardingTemplateTask_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "OnboardingTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "OnboardingTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTask" ADD CONSTRAINT "OnboardingTask_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "OnboardingChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorAssignment" ADD CONSTRAINT "MentorAssignment_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "OnboardingChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorFeedback" ADD CONSTRAINT "MentorFeedback_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "MentorAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffboardingTask" ADD CONSTRAINT "OffboardingTask_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "OffboardingChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeTransfer" ADD CONSTRAINT "KnowledgeTransfer_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "OffboardingChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitInterview" ADD CONSTRAINT "ExitInterview_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "OffboardingChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillTaxonomy" ADD CONSTRAINT "SkillTaxonomy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SkillTaxonomy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAssessment" ADD CONSTRAINT "SkillAssessment_employeeSkillId_fkey" FOREIGN KEY ("employeeSkillId") REFERENCES "EmployeeSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEndorsement" ADD CONSTRAINT "SkillEndorsement_employeeSkillId_fkey" FOREIGN KEY ("employeeSkillId") REFERENCES "EmployeeSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequiredSkill" ADD CONSTRAINT "JobRequiredSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRequiredSkill" ADD CONSTRAINT "ProjectRequiredSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSkill" ADD CONSTRAINT "CourseSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalApplication" ADD CONSTRAINT "InternalApplication_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "InternalOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalInterview" ADD CONSTRAINT "InternalInterview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "InternalApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityMatch" ADD CONSTRAINT "OpportunityMatch_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "InternalOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeTimelineEvent" ADD CONSTRAINT "DisputeTimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DisputeCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DisputeCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchJobLog" ADD CONSTRAINT "BatchJobLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "BatchJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivacyZoneAccessLog" ADD CONSTRAINT "PrivacyZoneAccessLog_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "PrivacyZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProviderModel" ADD CONSTRAINT "AIProviderModel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AIProviderConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIFeatureModelMapping" ADD CONSTRAINT "AIFeatureModelMapping_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIProviderModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AICallLog" ADD CONSTRAINT "AICallLog_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AIProviderConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Objective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResult" ADD CONSTRAINT "KeyResult_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResultCheckIn" ADD CONSTRAINT "KeyResultCheckIn_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "KeyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerReviewCycleQuestion" ADD CONSTRAINT "PeerReviewCycleQuestion_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "PeerReviewCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerReviewCycleQuestion" ADD CONSTRAINT "PeerReviewCycleQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PeerReviewQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerReview" ADD CONSTRAINT "PeerReview_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "PeerReviewCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerReviewResponse" ADD CONSTRAINT "PeerReviewResponse_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "PeerReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlexWorkRequest" ADD CONSTRAINT "FlexWorkRequest_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "FlexibleWorkPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOutcome" ADD CONSTRAINT "ProjectOutcome_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RnRAssignment" ADD CONSTRAINT "RnRAssignment_rnrId_fkey" FOREIGN KEY ("rnrId") REFERENCES "RnR"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IDPGoal" ADD CONSTRAINT "IDPGoal_idpId_fkey" FOREIGN KEY ("idpId") REFERENCES "IDP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IDPProgress" ADD CONSTRAINT "IDPProgress_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "IDPGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeWorkSchedule" ADD CONSTRAINT "EmployeeWorkSchedule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkScheduleTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveUsageTarget" ADD CONSTRAINT "LeaveUsageTarget_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "LeavePromotionCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTrip" ADD CONSTRAINT "BusinessTrip_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "TripBudget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripExpense" ADD CONSTRAINT "TripExpense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "BusinessTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
