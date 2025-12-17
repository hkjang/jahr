import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 채용 공고 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const posting = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!posting) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(posting);
  } catch (error) {
    console.error('Error fetching job posting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job posting' },
      { status: 500 }
    );
  }
}

// PUT: 채용 공고 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      requirements,
      benefits,
      salaryRange,
      location,
      status,
      closingDate,
    } = body;

    const posting = await prisma.jobPosting.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(requirements && { requirements }),
        ...(benefits !== undefined && { benefits }),
        ...(salaryRange !== undefined && { salaryRange }),
        ...(location !== undefined && { location }),
        ...(status && { 
          status,
          ...(status === 'PUBLISHED' && { publishedAt: new Date() }),
        }),
        ...(closingDate !== undefined && { 
          closingDate: closingDate ? new Date(closingDate) : null 
        }),
      },
    });

    return NextResponse.json(posting);
  } catch (error) {
    console.error('Error updating job posting:', error);
    return NextResponse.json(
      { error: 'Failed to update job posting' },
      { status: 500 }
    );
  }
}

// DELETE: 채용 공고 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.jobPosting.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job posting:', error);
    return NextResponse.json(
      { error: 'Failed to delete job posting' },
      { status: 500 }
    );
  }
}
