import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 시나리오 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: { status?: 'DRAFT' | 'ANALYZING' | 'COMPLETED' } = {};
    if (status) where.status = status as 'DRAFT' | 'ANALYZING' | 'COMPLETED';

    const scenarios = await prisma.headcountScenario.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}

// POST: 시나리오 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, baselineData, changes, costImpact, createdBy } = body;

    if (!name || !baselineData || !changes) {
      return NextResponse.json(
        { error: 'Missing required fields: name, baselineData, changes' },
        { status: 400 }
      );
    }

    const scenario = await prisma.headcountScenario.create({
      data: {
        name,
        description,
        baselineData,
        changes,
        costImpact: costImpact || 0,
        createdBy: createdBy || 'system',
        status: 'DRAFT',
      },
    });

    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    console.error('Error creating scenario:', error);
    return NextResponse.json(
      { error: 'Failed to create scenario' },
      { status: 500 }
    );
  }
}
