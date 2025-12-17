import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 인력 계획 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');

    const where: {
      year?: number;
      organizationId?: string;
      status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    } = {};
    
    if (year) where.year = parseInt(year);
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status as 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

    const plans = await prisma.workforcePlan.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { quarter: 'asc' },
      ],
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching workforce plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workforce plans' },
      { status: 500 }
    );
  }
}

// POST: 인력 계획 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      year,
      quarter,
      organizationId,
      currentHeadcount,
      plannedHeadcount,
      budgetAmount,
      notes,
      createdBy,
    } = body;

    // 필수 필드 검증
    if (!year || !organizationId || currentHeadcount === undefined || plannedHeadcount === undefined || budgetAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: year, organizationId, currentHeadcount, plannedHeadcount, budgetAmount' },
        { status: 400 }
      );
    }

    const plan = await prisma.workforcePlan.create({
      data: {
        year,
        quarter: quarter || null,
        organizationId,
        currentHeadcount,
        plannedHeadcount,
        budgetAmount,
        notes,
        createdBy: createdBy || 'system',
        status: 'DRAFT',
      },
      include: {
        organization: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Error creating workforce plan:', error);
    return NextResponse.json(
      { error: 'Failed to create workforce plan' },
      { status: 500 }
    );
  }
}
