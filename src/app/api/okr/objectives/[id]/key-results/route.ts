import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/okr/objectives/[id]/key-results - 핵심 결과 목록
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const keyResults = await prisma.keyResult.findMany({
      where: { objectiveId: id },
      include: {
        checkIns: {
          orderBy: { checkedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 각 KR의 진행률 계산
    const keyResultsWithProgress = keyResults.map((kr) => {
      const progress = kr.targetValue > 0
        ? ((kr.currentValue - kr.startValue) / (kr.targetValue - kr.startValue)) * 100
        : 0;
      return {
        ...kr,
        calculatedProgress: Math.round(Math.min(Math.max(progress, 0), 100)),
      };
    });

    return NextResponse.json(keyResultsWithProgress);
  } catch (error) {
    console.error('Failed to fetch key results:', error);
    return NextResponse.json({ error: 'Failed to fetch key results' }, { status: 500 });
  }
}

// POST /api/okr/objectives/[id]/key-results - 핵심 결과 추가
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, metricType, startValue, targetValue, weight, dueDate } = body;

    if (!title || !metricType || targetValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, metricType, targetValue' },
        { status: 400 }
      );
    }

    // 목표가 존재하는지 확인
    const objective = await prisma.objective.findUnique({
      where: { id },
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    const keyResult = await prisma.keyResult.create({
      data: {
        objectiveId: id,
        title,
        metricType,
        startValue: startValue || 0,
        targetValue,
        currentValue: startValue || 0,
        weight: weight || 1.0,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: objective.status,
      },
      include: {
        checkIns: true,
      },
    });

    return NextResponse.json(keyResult, { status: 201 });
  } catch (error) {
    console.error('Failed to create key result:', error);
    return NextResponse.json({ error: 'Failed to create key result' }, { status: 500 });
  }
}
