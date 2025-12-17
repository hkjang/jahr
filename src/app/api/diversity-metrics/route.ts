import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 다양성 지표 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const orgId = searchParams.get('organizationId');

    const where: { period?: string; organizationId?: string } = {};
    if (period) where.period = period;
    if (orgId) where.organizationId = orgId;

    const metrics = await prisma.diversityMetrics.findMany({
      where,
      orderBy: { measuredAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching diversity metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diversity metrics' },
      { status: 500 }
    );
  }
}

// POST: 다양성 지표 기록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period, organizationId, metrics, genderRatio, ageDistribution, positionDiversity, trend } = body;

    if (!period || !metrics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const diversityMetrics = await prisma.diversityMetrics.create({
      data: {
        period,
        organizationId,
        metrics,
        genderRatio,
        ageDistribution,
        positionDiversity,
        trend,
      },
    });

    return NextResponse.json(diversityMetrics, { status: 201 });
  } catch (error) {
    console.error('Error creating diversity metrics:', error);
    return NextResponse.json(
      { error: 'Failed to create diversity metrics' },
      { status: 500 }
    );
  }
}
