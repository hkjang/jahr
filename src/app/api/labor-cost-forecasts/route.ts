import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 인건비 예측 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearMonth = searchParams.get('yearMonth');
    const organizationId = searchParams.get('organizationId');
    const isActual = searchParams.get('isActual');

    const where: {
      yearMonth?: string;
      organizationId?: string | null;
      isActual?: boolean;
    } = {};
    
    if (yearMonth) where.yearMonth = yearMonth;
    if (organizationId) where.organizationId = organizationId;
    if (isActual !== null) where.isActual = isActual === 'true';

    const forecasts = await prisma.laborCostForecast.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { yearMonth: 'desc' },
    });

    return NextResponse.json(forecasts);
  } catch (error) {
    console.error('Error fetching labor cost forecasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labor cost forecasts' },
      { status: 500 }
    );
  }
}

// POST: 인건비 예측 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      yearMonth,
      organizationId,
      baseSalary,
      bonus,
      benefits,
      isActual,
    } = body;

    if (!yearMonth || baseSalary === undefined || bonus === undefined || benefits === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const totalCost = parseFloat(baseSalary) + parseFloat(bonus) + parseFloat(benefits);

    const forecast = await prisma.laborCostForecast.create({
      data: {
        yearMonth,
        organizationId: organizationId || null,
        baseSalary,
        bonus,
        benefits,
        totalCost,
        isActual: isActual || false,
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

    return NextResponse.json(forecast, { status: 201 });
  } catch (error) {
    console.error('Error creating labor cost forecast:', error);
    return NextResponse.json(
      { error: 'Failed to create labor cost forecast' },
      { status: 500 }
    );
  }
}
