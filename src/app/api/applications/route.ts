import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 지원서 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postingId = searchParams.get('postingId');
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');

    const where: {
      postingId?: string;
      status?: 'SUBMITTED' | 'IN_REVIEW' | 'PASSED' | 'REJECTED' | 'WITHDRAWN';
      currentStage?: 'DOCUMENT' | 'FIRST_INTERVIEW' | 'SECOND_INTERVIEW' | 'FINAL_INTERVIEW' | 'OFFER' | 'ONBOARDING';
    } = {};
    
    if (postingId) where.postingId = postingId;
    if (status) where.status = status as typeof where.status;
    if (stage) where.currentStage = stage as typeof where.currentStage;

    const applications = await prisma.application.findMany({
      where,
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        posting: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: { evaluations: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST: 지원서 생성 (지원)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      postingId,
      name,
      email,
      phone,
      resumeUrl,
      portfolioUrl,
      coverLetter,
      source,
    } = body;

    if (!postingId || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: postingId, name, email' },
        { status: 400 }
      );
    }

    // 지원자 조회 또는 생성
    let applicant = await prisma.applicant.findUnique({
      where: { email },
    });

    if (!applicant) {
      applicant = await prisma.applicant.create({
        data: {
          email,
          name,
          phone,
          resumeUrl,
          portfolioUrl,
          source,
        },
      });
    }

    // 중복 지원 확인
    const existingApplication = await prisma.application.findUnique({
      where: {
        postingId_applicantId: {
          postingId,
          applicantId: applicant.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Already applied to this position' },
        { status: 400 }
      );
    }

    // 지원서 생성
    const application = await prisma.application.create({
      data: {
        postingId,
        applicantId: applicant.id,
        coverLetter,
        status: 'SUBMITTED',
        currentStage: 'DOCUMENT',
      },
      include: {
        applicant: true,
        posting: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // 단계 이력 생성
    await prisma.applicationStageHistory.create({
      data: {
        applicationId: application.id,
        stage: 'DOCUMENT',
        result: 'PENDING',
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
