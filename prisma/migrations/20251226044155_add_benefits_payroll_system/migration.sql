-- CreateEnum
CREATE TYPE "WelfareCategoryType" AS ENUM ('SCHOLARSHIP', 'HEALTH_CHECKUP', 'CONDO', 'WELFARE_POINT', 'GIFT', 'CONGRATULATORY', 'MEDICAL');

-- CreateEnum
CREATE TYPE "NationalInsuranceType" AS ENUM ('PENSION', 'HEALTH', 'EMPLOYMENT', 'INDUSTRIAL');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('ACTIVE', 'EXEMPTED', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PrivateInsuranceType" AS ENUM ('PRIVACY_PROTECTION', 'DIRECTORS_LIABILITY', 'GROUP_ACCIDENT', 'FIDELITY_GUARANTEE');

-- CreateEnum
CREATE TYPE "AllowanceType" AS ENUM ('FIXED', 'VARIABLE', 'RATIO', 'CONDITIONAL');

-- CreateEnum
CREATE TYPE "DeductionType" AS ENUM ('TAX', 'INSURANCE', 'LOAN', 'GARNISHMENT', 'UNION', 'OTHER');

-- CreateEnum
CREATE TYPE "RetirementPensionType" AS ENUM ('DB', 'DC');

-- CreateEnum
CREATE TYPE "TaxSettlementStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'REVISED');

-- CreateEnum
CREATE TYPE "TaxDeductionCategory" AS ENUM ('INSURANCE', 'MEDICAL', 'EDUCATION', 'DONATION', 'CREDIT_CARD', 'PENSION_SAVING', 'HOUSING', 'DEPENDENT', 'OTHER');

-- CreateTable
CREATE TABLE "WelfareCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WelfareCategoryType" NOT NULL,
    "description" TEXT,
    "maxAmount" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WelfareCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WelfareApplication" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvalId" TEXT,
    "externalApprovalId" TEXT,
    "details" JSONB,
    "attachments" JSONB,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "processedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WelfareApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NationalInsurance" (
    "id" TEXT NOT NULL,
    "type" "NationalInsuranceType" NOT NULL,
    "name" TEXT NOT NULL,
    "employeeRate" DECIMAL(5,4) NOT NULL,
    "employerRate" DECIMAL(5,4) NOT NULL,
    "maxIncome" DECIMAL(12,2),
    "minIncome" DECIMAL(12,2),
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NationalInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeInsurance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "insuranceType" "NationalInsuranceType" NOT NULL,
    "status" "InsuranceStatus" NOT NULL DEFAULT 'ACTIVE',
    "standardIncome" DECIMAL(12,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "exemptionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePayment" (
    "id" TEXT NOT NULL,
    "employeeInsuranceId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "standardIncome" DECIMAL(12,2) NOT NULL,
    "employeeAmount" DECIMAL(12,2) NOT NULL,
    "employerAmount" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsurancePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceSettlement" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "insuranceType" "NationalInsuranceType" NOT NULL,
    "totalStandardIncome" DECIMAL(14,2) NOT NULL,
    "totalEmployeePayment" DECIMAL(14,2) NOT NULL,
    "totalEmployerPayment" DECIMAL(14,2) NOT NULL,
    "adjustmentAmount" DECIMAL(12,2) NOT NULL,
    "settlementDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsuranceSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateInsurance" (
    "id" TEXT NOT NULL,
    "type" "PrivateInsuranceType" NOT NULL,
    "name" TEXT NOT NULL,
    "insuranceCompany" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "coverage" DECIMAL(14,2) NOT NULL,
    "annualPremium" DECIMAL(12,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "autoRenewal" BOOLEAN NOT NULL DEFAULT false,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayBand" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "grade" TEXT,
    "minSalary" DECIMAL(12,2) NOT NULL,
    "midSalary" DECIMAL(12,2) NOT NULL,
    "maxSalary" DECIMAL(12,2) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayBand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllowanceRule" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AllowanceType" NOT NULL,
    "baseAmount" DECIMAL(12,2),
    "calculationFormula" JSONB,
    "isTaxable" BOOLEAN NOT NULL DEFAULT true,
    "isRetirementIncluded" BOOLEAN NOT NULL DEFAULT true,
    "applicablePositions" TEXT[],
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllowanceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeductionRule" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DeductionType" NOT NULL,
    "calculationFormula" JSONB NOT NULL,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeductionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeverancePay" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "accumulatedAmount" DECIMAL(14,2) NOT NULL,
    "averageWage" DECIMAL(12,2) NOT NULL,
    "averageWageCalcPeriod" TEXT,
    "serviceDays" INTEGER NOT NULL,
    "calculatedAmount" DECIMAL(14,2) NOT NULL,
    "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "lastCalculatedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeverancePay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetirementPension" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "pensionType" "RetirementPensionType" NOT NULL,
    "provider" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "monthlyContribution" DECIMAL(12,2) NOT NULL,
    "accumulatedAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "joinDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetirementPension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntermediateSettlement" (
    "id" TEXT NOT NULL,
    "severancePayId" TEXT NOT NULL,
    "settlementDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "serviceDays" INTEGER NOT NULL,
    "averageWage" DECIMAL(12,2) NOT NULL,
    "approvedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntermediateSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YearEndTaxSettlement" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalIncome" DECIMAL(14,2) NOT NULL,
    "taxableIncome" DECIMAL(14,2) NOT NULL,
    "calculatedTax" DECIMAL(12,2) NOT NULL,
    "paidTax" DECIMAL(12,2) NOT NULL,
    "refundAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "additionalTax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "TaxSettlementStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "simplifiedDataFile" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YearEndTaxSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxDeduction" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "category" "TaxDeductionCategory" NOT NULL,
    "item" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "deductionAmount" DECIMAL(12,2) NOT NULL,
    "proof" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DependentFamily" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "residentNumber" TEXT,
    "birthDate" TIMESTAMP(3),
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "isEligible" BOOLEAN NOT NULL DEFAULT true,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DependentFamily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WelfareCategory_code_key" ON "WelfareCategory"("code");

-- CreateIndex
CREATE INDEX "WelfareCategory_type_idx" ON "WelfareCategory"("type");

-- CreateIndex
CREATE INDEX "WelfareCategory_isActive_idx" ON "WelfareCategory"("isActive");

-- CreateIndex
CREATE INDEX "WelfareApplication_employeeId_idx" ON "WelfareApplication"("employeeId");

-- CreateIndex
CREATE INDEX "WelfareApplication_categoryId_idx" ON "WelfareApplication"("categoryId");

-- CreateIndex
CREATE INDEX "WelfareApplication_status_idx" ON "WelfareApplication"("status");

-- CreateIndex
CREATE INDEX "WelfareApplication_requestDate_idx" ON "WelfareApplication"("requestDate");

-- CreateIndex
CREATE UNIQUE INDEX "NationalInsurance_type_key" ON "NationalInsurance"("type");

-- CreateIndex
CREATE INDEX "NationalInsurance_effectiveDate_idx" ON "NationalInsurance"("effectiveDate");

-- CreateIndex
CREATE INDEX "EmployeeInsurance_employeeId_idx" ON "EmployeeInsurance"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeInsurance_insuranceType_idx" ON "EmployeeInsurance"("insuranceType");

-- CreateIndex
CREATE INDEX "EmployeeInsurance_status_idx" ON "EmployeeInsurance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeInsurance_employeeId_insuranceType_key" ON "EmployeeInsurance"("employeeId", "insuranceType");

-- CreateIndex
CREATE INDEX "InsurancePayment_yearMonth_idx" ON "InsurancePayment"("yearMonth");

-- CreateIndex
CREATE INDEX "InsurancePayment_isPaid_idx" ON "InsurancePayment"("isPaid");

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePayment_employeeInsuranceId_yearMonth_key" ON "InsurancePayment"("employeeInsuranceId", "yearMonth");

-- CreateIndex
CREATE INDEX "InsuranceSettlement_year_idx" ON "InsuranceSettlement"("year");

-- CreateIndex
CREATE INDEX "InsuranceSettlement_insuranceType_idx" ON "InsuranceSettlement"("insuranceType");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceSettlement_year_insuranceType_key" ON "InsuranceSettlement"("year", "insuranceType");

-- CreateIndex
CREATE UNIQUE INDEX "PrivateInsurance_policyNumber_key" ON "PrivateInsurance"("policyNumber");

-- CreateIndex
CREATE INDEX "PrivateInsurance_type_idx" ON "PrivateInsurance"("type");

-- CreateIndex
CREATE INDEX "PrivateInsurance_endDate_idx" ON "PrivateInsurance"("endDate");

-- CreateIndex
CREATE INDEX "PrivateInsurance_isActive_idx" ON "PrivateInsurance"("isActive");

-- CreateIndex
CREATE INDEX "PayBand_positionId_idx" ON "PayBand"("positionId");

-- CreateIndex
CREATE INDEX "PayBand_effectiveDate_idx" ON "PayBand"("effectiveDate");

-- CreateIndex
CREATE INDEX "PayBand_isActive_idx" ON "PayBand"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AllowanceRule_code_key" ON "AllowanceRule"("code");

-- CreateIndex
CREATE INDEX "AllowanceRule_code_idx" ON "AllowanceRule"("code");

-- CreateIndex
CREATE INDEX "AllowanceRule_isActive_idx" ON "AllowanceRule"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DeductionRule_code_key" ON "DeductionRule"("code");

-- CreateIndex
CREATE INDEX "DeductionRule_code_idx" ON "DeductionRule"("code");

-- CreateIndex
CREATE INDEX "DeductionRule_type_idx" ON "DeductionRule"("type");

-- CreateIndex
CREATE INDEX "DeductionRule_isActive_idx" ON "DeductionRule"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SeverancePay_employeeId_key" ON "SeverancePay"("employeeId");

-- CreateIndex
CREATE INDEX "SeverancePay_employeeId_idx" ON "SeverancePay"("employeeId");

-- CreateIndex
CREATE INDEX "RetirementPension_employeeId_idx" ON "RetirementPension"("employeeId");

-- CreateIndex
CREATE INDEX "RetirementPension_pensionType_idx" ON "RetirementPension"("pensionType");

-- CreateIndex
CREATE INDEX "RetirementPension_isActive_idx" ON "RetirementPension"("isActive");

-- CreateIndex
CREATE INDEX "IntermediateSettlement_severancePayId_idx" ON "IntermediateSettlement"("severancePayId");

-- CreateIndex
CREATE INDEX "IntermediateSettlement_settlementDate_idx" ON "IntermediateSettlement"("settlementDate");

-- CreateIndex
CREATE INDEX "YearEndTaxSettlement_employeeId_idx" ON "YearEndTaxSettlement"("employeeId");

-- CreateIndex
CREATE INDEX "YearEndTaxSettlement_year_idx" ON "YearEndTaxSettlement"("year");

-- CreateIndex
CREATE INDEX "YearEndTaxSettlement_status_idx" ON "YearEndTaxSettlement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "YearEndTaxSettlement_employeeId_year_key" ON "YearEndTaxSettlement"("employeeId", "year");

-- CreateIndex
CREATE INDEX "TaxDeduction_settlementId_idx" ON "TaxDeduction"("settlementId");

-- CreateIndex
CREATE INDEX "TaxDeduction_category_idx" ON "TaxDeduction"("category");

-- CreateIndex
CREATE INDEX "DependentFamily_employeeId_idx" ON "DependentFamily"("employeeId");

-- CreateIndex
CREATE INDEX "DependentFamily_isEligible_idx" ON "DependentFamily"("isEligible");

-- AddForeignKey
ALTER TABLE "WelfareApplication" ADD CONSTRAINT "WelfareApplication_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelfareApplication" ADD CONSTRAINT "WelfareApplication_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "WelfareCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeInsurance" ADD CONSTRAINT "EmployeeInsurance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePayment" ADD CONSTRAINT "InsurancePayment_employeeInsuranceId_fkey" FOREIGN KEY ("employeeInsuranceId") REFERENCES "EmployeeInsurance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayBand" ADD CONSTRAINT "PayBand_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeverancePay" ADD CONSTRAINT "SeverancePay_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetirementPension" ADD CONSTRAINT "RetirementPension_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntermediateSettlement" ADD CONSTRAINT "IntermediateSettlement_severancePayId_fkey" FOREIGN KEY ("severancePayId") REFERENCES "SeverancePay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearEndTaxSettlement" ADD CONSTRAINT "YearEndTaxSettlement_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxDeduction" ADD CONSTRAINT "TaxDeduction_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "YearEndTaxSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DependentFamily" ADD CONSTRAINT "DependentFamily_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
