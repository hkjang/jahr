// Phase 2: 채용 관리 API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ========================================
// Recruitment API
// ========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "posting":
        return getJobPostings(searchParams);
      case "applicant":
        return getApplicants(searchParams);
      case "application":
        return getApplications(searchParams);
      case "template":
        return getInterviewTemplates();
      case "evaluation":
        return getInterviewEvaluations(searchParams);
      default:
        return getJobPostings(searchParams);
    }
  } catch (error) {
    console.error("Error in recruitment GET:", error);
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "posting":
        return createJobPosting(data);
      case "applicant":
        return createApplicant(data);
      case "application":
        return createApplication(data);
      case "template":
        return createInterviewTemplate(data);
      case "evaluation":
        return createInterviewEvaluation(data);
      case "stage":
        return advanceApplicationStage(data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in recruitment POST:", error);
    return NextResponse.json({ error: "생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    switch (type) {
      case "posting":
        return updateJobPosting(id, data);
      case "applicant":
        return updateApplicant(id, data);
      case "application":
        return updateApplication(id, data);
      case "template":
        return updateInterviewTemplate(id, data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in recruitment PUT:", error);
    return NextResponse.json({ error: "수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    switch (type) {
      case "posting":
        await prisma.jobPosting.delete({ where: { id } });
        break;
      case "applicant":
        await prisma.applicant.delete({ where: { id } });
        break;
      case "application":
        await prisma.application.delete({ where: { id } });
        break;
      case "template":
        await prisma.interviewTemplate.delete({ where: { id } });
        break;
      case "evaluation":
        await prisma.interviewEvaluation.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in recruitment DELETE:", error);
    return NextResponse.json({ error: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// Job Posting functions
async function getJobPostings(searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const postings = await prisma.jobPosting.findMany({
    where,
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(postings);
}

async function createJobPosting(data: Record<string, unknown>) {
  const posting = await prisma.jobPosting.create({
    data: {
      title: data.title as string,
      organizationId: data.organizationId as string,
      positionId: data.positionId as string,
      description: data.description as string,
      requirements: data.requirements as string,
      benefits: data.benefits as string | undefined,
      salaryRange: data.salaryRange as string | undefined,
      employmentType: data.employmentType as never,
      location: data.location as string | undefined,
      status: "DRAFT",
      closingDate: data.closingDate ? new Date(data.closingDate as string) : undefined,
      createdBy: data.createdBy as string,
    },
  });
  return NextResponse.json(posting, { status: 201 });
}

async function updateJobPosting(id: string, data: Record<string, unknown>) {
  const updateData: Record<string, unknown> = {};
  
  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.requirements) updateData.requirements = data.requirements;
  if (data.benefits !== undefined) updateData.benefits = data.benefits;
  if (data.salaryRange !== undefined) updateData.salaryRange = data.salaryRange;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.status) {
    updateData.status = data.status;
    if (data.status === "PUBLISHED") updateData.publishedAt = new Date();
  }
  if (data.closingDate) updateData.closingDate = new Date(data.closingDate as string);

  const posting = await prisma.jobPosting.update({
    where: { id },
    data: updateData as never,
  });
  return NextResponse.json(posting);
}

// Applicant functions
async function getApplicants(searchParams: URLSearchParams) {
  const talentPool = searchParams.get("talentPool");
  const where: Record<string, unknown> = {};
  if (talentPool === "true") where.isInTalentPool = true;

  const applicants = await prisma.applicant.findMany({
    where,
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(applicants);
}

async function createApplicant(data: Record<string, unknown>) {
  const applicant = await prisma.applicant.create({
    data: {
      email: data.email as string,
      name: data.name as string,
      phone: data.phone as string | undefined,
      resumeUrl: data.resumeUrl as string | undefined,
      portfolioUrl: data.portfolioUrl as string | undefined,
      source: data.source as string | undefined,
      isInTalentPool: data.isInTalentPool as boolean || false,
    },
  });
  return NextResponse.json(applicant, { status: 201 });
}

async function updateApplicant(id: string, data: Record<string, unknown>) {
  const applicant = await prisma.applicant.update({
    where: { id },
    data: {
      name: data.name as string | undefined,
      phone: data.phone as string | undefined,
      resumeUrl: data.resumeUrl as string | undefined,
      portfolioUrl: data.portfolioUrl as string | undefined,
      isInTalentPool: data.isInTalentPool as boolean | undefined,
    },
  });
  return NextResponse.json(applicant);
}

// Application functions
async function getApplications(searchParams: URLSearchParams) {
  const postingId = searchParams.get("postingId");
  const status = searchParams.get("status");
  const stage = searchParams.get("stage");
  
  const where: Record<string, unknown> = {};
  if (postingId) where.postingId = postingId;
  if (status) where.status = status;
  if (stage) where.currentStage = stage;

  const applications = await prisma.application.findMany({
    where,
    include: {
      applicant: true,
      posting: { select: { title: true } },
      stages: { orderBy: { processedAt: "desc" } },
    },
    orderBy: { appliedAt: "desc" },
  });
  return NextResponse.json(applications);
}

async function createApplication(data: Record<string, unknown>) {
  // Check for existing application
  const existing = await prisma.application.findUnique({
    where: {
      postingId_applicantId: {
        postingId: data.postingId as string,
        applicantId: data.applicantId as string,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "이미 지원한 공고입니다." }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: {
      postingId: data.postingId as string,
      applicantId: data.applicantId as string,
      coverLetter: data.coverLetter as string | undefined,
      status: "SUBMITTED",
      currentStage: "DOCUMENT",
    },
  });

  // Create initial stage history
  await prisma.applicationStageHistory.create({
    data: {
      applicationId: application.id,
      stage: "DOCUMENT",
      result: "PENDING",
    },
  });

  return NextResponse.json(application, { status: 201 });
}

async function updateApplication(id: string, data: Record<string, unknown>) {
  const application = await prisma.application.update({
    where: { id },
    data: {
      status: data.status as "SUBMITTED" | "IN_REVIEW" | "PASSED" | "REJECTED" | "WITHDRAWN" | undefined,
      coverLetter: data.coverLetter as string | undefined,
    },
  });
  return NextResponse.json(application);
}

// Stage advancement
async function advanceApplicationStage(data: Record<string, unknown>) {
  const { applicationId, result, notes, processedBy, nextStage } = data;

  const stageOrder = ["DOCUMENT", "FIRST_INTERVIEW", "SECOND_INTERVIEW", "FINAL_INTERVIEW", "OFFER", "ONBOARDING"];

  const application = await prisma.application.findUnique({
    where: { id: applicationId as string },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const currentIndex = stageOrder.indexOf(application.currentStage);
  const newStage = nextStage || (result === "PASSED" && currentIndex < stageOrder.length - 1 
    ? stageOrder[currentIndex + 1] 
    : application.currentStage);

  // Create stage history
  await prisma.applicationStageHistory.create({
    data: {
      applicationId: applicationId as string,
      stage: application.currentStage,
      result: result as "PASSED" | "FAILED" | "PENDING",
      notes: notes as string | undefined,
      processedBy: processedBy as string | undefined,
    },
  });

  // Update application
  const updated = await prisma.application.update({
    where: { id: applicationId as string },
    data: {
      currentStage: newStage as "DOCUMENT" | "FIRST_INTERVIEW" | "SECOND_INTERVIEW" | "FINAL_INTERVIEW" | "OFFER" | "ONBOARDING",
      status: result === "FAILED" ? "REJECTED" : result === "PASSED" && newStage === "ONBOARDING" ? "PASSED" : "IN_REVIEW",
    },
  });

  return NextResponse.json(updated);
}

// Interview Template functions
async function getInterviewTemplates() {
  const templates = await prisma.interviewTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(templates);
}

async function createInterviewTemplate(data: Record<string, unknown>) {
  const template = await prisma.interviewTemplate.create({
    data: {
      name: data.name as string,
      description: data.description as string | undefined,
      items: data.items as object,
      isActive: true,
    },
  });
  return NextResponse.json(template, { status: 201 });
}

async function updateInterviewTemplate(id: string, data: Record<string, unknown>) {
  const template = await prisma.interviewTemplate.update({
    where: { id },
    data: {
      name: data.name as string | undefined,
      description: data.description as string | undefined,
      items: data.items as object | undefined,
      isActive: data.isActive as boolean | undefined,
    },
  });
  return NextResponse.json(template);
}

// Interview Evaluation functions
async function getInterviewEvaluations(searchParams: URLSearchParams) {
  const applicationId = searchParams.get("applicationId");
  const where: Record<string, unknown> = {};
  if (applicationId) where.applicationId = applicationId;

  const evaluations = await prisma.interviewEvaluation.findMany({
    where,
    include: {
      template: { select: { name: true } },
    },
    orderBy: { evaluatedAt: "desc" },
  });
  return NextResponse.json(evaluations);
}

async function createInterviewEvaluation(data: Record<string, unknown>) {
  const evaluation = await prisma.interviewEvaluation.create({
    data: {
      applicationId: data.applicationId as string,
      interviewerId: data.interviewerId as string,
      templateId: data.templateId as string,
      stage: data.stage as "DOCUMENT" | "FIRST_INTERVIEW" | "SECOND_INTERVIEW" | "FINAL_INTERVIEW" | "OFFER" | "ONBOARDING",
      scores: data.scores as object,
      overallScore: data.overallScore as number,
      recommendation: data.recommendation as "STRONG_HIRE" | "HIRE" | "NO_HIRE" | "STRONG_NO_HIRE",
      comments: data.comments as string | undefined,
    },
  });
  return NextResponse.json(evaluation, { status: 201 });
}
