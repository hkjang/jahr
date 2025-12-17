import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 조직 건강도 지수 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const orgId = searchParams.get('organizationId');

    const where: { period?: string; organizationId?: string } = {};
    if (period) where.period = period;
    if (orgId) where.organizationId = orgId;

    const indices = await prisma.organizationHealthIndex.findMany({
      where,
      orderBy: { calculatedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(indices);
  } catch (error) {
    console.error('Error fetching health index:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health index' },
      { status: 500 }
    );
  }
}

// POST: 조직 건강도 지수 산출
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      period,
      overallScore,
      dimensions,
      turnoverRate,
      engagementScore,
      trainingHours,
      leaveUtilization,
      complianceRate,
      trend,
    } = body;

    if (!period || overallScore === undefined || !dimensions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const healthIndex = await prisma.organizationHealthIndex.create({
      data: {
        organizationId,
        period,
        overallScore,
        dimensions,
        turnoverRate,
        engagementScore,
        trainingHours,
        leaveUtilization,
        complianceRate,
        trend,
      },
    });

    return NextResponse.json(healthIndex, { status: 201 });
  } catch (error) {
    console.error('Error creating health index:', error);
    return NextResponse.json(
      { error: 'Failed to create health index' },
      { status: 500 }
    );
  }
}
