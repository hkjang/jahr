import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 채용 공고 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organizationId');

    const where: {
      status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED';
      organizationId?: string;
    } = {};
    
    if (status) where.status = status as 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED';
    if (organizationId) where.organizationId = organizationId;

    const postings = await prisma.jobPosting.findMany({
      where,
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(postings);
  } catch (error) {
    console.error('Error fetching job postings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job postings' },
      { status: 500 }
    );
  }
}

// POST: 채용 공고 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      organizationId,
      positionId,
      description,
      requirements,
      benefits,
      salaryRange,
      employmentType,
      location,
      closingDate,
      createdBy,
    } = body;

    if (!title || !organizationId || !positionId || !description || !requirements || !employmentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const posting = await prisma.jobPosting.create({
      data: {
        title,
        organizationId,
        positionId,
        description,
        requirements,
        benefits,
        salaryRange,
        employmentType,
        location,
        closingDate: closingDate ? new Date(closingDate) : null,
        createdBy: createdBy || 'admin',
        status: 'DRAFT',
      },
    });

    return NextResponse.json(posting, { status: 201 });
  } catch (error) {
    console.error('Error creating job posting:', error);
    return NextResponse.json(
      { error: 'Failed to create job posting' },
      { status: 500 }
    );
  }
}
