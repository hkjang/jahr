import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/okr/key-results/[id]/check-in - 진행률 체크인
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { value, note } = body;

    if (value === undefined) {
      return NextResponse.json({ error: 'Value is required' }, { status: 400 });
    }

    // 체크인 생성
    const checkIn = await prisma.keyResultCheckIn.create({
      data: {
        keyResultId: id,
        value,
        note,
        checkedBy: session.user?.id || 'unknown',
      },
    });

    // KR의 currentValue 업데이트
    const keyResult = await prisma.keyResult.update({
      where: { id },
      data: { currentValue: value },
      include: {
        objective: true,
      },
    });

    // 목표의 progress 재계산
    const allKeyResults = await prisma.keyResult.findMany({
      where: { objectiveId: keyResult.objectiveId },
    });

    const totalWeight = allKeyResults.reduce((sum, kr) => sum + kr.weight, 0);
    const weightedProgress = allKeyResults.reduce((sum, kr) => {
      const progress = kr.targetValue > 0
        ? ((kr.currentValue - kr.startValue) / (kr.targetValue - kr.startValue)) * 100
        : 0;
      return sum + Math.min(Math.max(progress, 0), 100) * kr.weight;
    }, 0);

    const objectiveProgress = totalWeight > 0 ? weightedProgress / totalWeight : 0;

    await prisma.objective.update({
      where: { id: keyResult.objectiveId },
      data: { progress: Math.round(objectiveProgress) },
    });

    return NextResponse.json({
      checkIn,
      keyResult: {
        ...keyResult,
        calculatedProgress: Math.round(
          ((value - keyResult.startValue) / (keyResult.targetValue - keyResult.startValue)) * 100
        ),
      },
      objectiveProgress: Math.round(objectiveProgress),
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create check-in:', error);
    return NextResponse.json({ error: 'Failed to create check-in' }, { status: 500 });
  }
}

// GET /api/okr/key-results/[id]/check-in - 체크인 이력 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const checkIns = await prisma.keyResultCheckIn.findMany({
      where: { keyResultId: id },
      orderBy: { checkedAt: 'desc' },
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error('Failed to fetch check-ins:', error);
    return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
  }
}
