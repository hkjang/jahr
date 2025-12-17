import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 인재풀 조회 (미채용 인재)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: {
      isInTalentPool: boolean;
      OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }>;
    } = {
      isInTalentPool: true,
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const applicants = await prisma.applicant.findMany({
      where,
      include: {
        applications: {
          include: {
            posting: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { appliedAt: 'desc' },
          take: 3,
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(applicants);
  } catch (error) {
    console.error('Error fetching talent pool:', error);
    return NextResponse.json(
      { error: 'Failed to fetch talent pool' },
      { status: 500 }
    );
  }
}

// POST: 인재풀에 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicantId } = body;

    if (!applicantId) {
      return NextResponse.json(
        { error: 'applicantId is required' },
        { status: 400 }
      );
    }

    const applicant = await prisma.applicant.update({
      where: { id: applicantId },
      data: { isInTalentPool: true },
    });

    return NextResponse.json(applicant);
  } catch (error) {
    console.error('Error adding to talent pool:', error);
    return NextResponse.json(
      { error: 'Failed to add to talent pool' },
      { status: 500 }
    );
  }
}
