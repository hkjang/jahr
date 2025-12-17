import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/okr/key-results/[id] - 핵심 결과 상세
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const keyResult = await prisma.keyResult.findUnique({
      where: { id },
      include: {
        objective: {
          select: {
            id: true,
            title: true,
            level: true,
            ownerId: true,
          },
        },
        checkIns: {
          orderBy: { checkedAt: 'desc' },
        },
      },
    });

    if (!keyResult) {
      return NextResponse.json({ error: 'Key result not found' }, { status: 404 });
    }

    const progress = keyResult.targetValue > 0
      ? ((keyResult.currentValue - keyResult.startValue) / (keyResult.targetValue - keyResult.startValue)) * 100
      : 0;

    return NextResponse.json({
      ...keyResult,
      calculatedProgress: Math.round(Math.min(Math.max(progress, 0), 100)),
    });
  } catch (error) {
    console.error('Failed to fetch key result:', error);
    return NextResponse.json({ error: 'Failed to fetch key result' }, { status: 500 });
  }
}

// PUT /api/okr/key-results/[id] - 핵심 결과 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, metricType, startValue, targetValue, currentValue, weight, dueDate, status } = body;

    const keyResult = await prisma.keyResult.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(metricType && { metricType }),
        ...(startValue !== undefined && { startValue }),
        ...(targetValue !== undefined && { targetValue }),
        ...(currentValue !== undefined && { currentValue }),
        ...(weight !== undefined && { weight }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(status && { status }),
      },
      include: {
        checkIns: {
          orderBy: { checkedAt: 'desc' },
          take: 5,
        },
      },
    });

    // 목표의 progress 업데이트
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

    return NextResponse.json(keyResult);
  } catch (error) {
    console.error('Failed to update key result:', error);
    return NextResponse.json({ error: 'Failed to update key result' }, { status: 500 });
  }
}

// DELETE /api/okr/key-results/[id] - 핵심 결과 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const keyResult = await prisma.keyResult.findUnique({
      where: { id },
      select: { objectiveId: true },
    });

    if (!keyResult) {
      return NextResponse.json({ error: 'Key result not found' }, { status: 404 });
    }

    await prisma.keyResult.delete({
      where: { id },
    });

    // 목표의 progress 재계산
    const remainingKeyResults = await prisma.keyResult.findMany({
      where: { objectiveId: keyResult.objectiveId },
    });

    if (remainingKeyResults.length > 0) {
      const totalWeight = remainingKeyResults.reduce((sum, kr) => sum + kr.weight, 0);
      const weightedProgress = remainingKeyResults.reduce((sum, kr) => {
        const progress = kr.targetValue > 0
          ? ((kr.currentValue - kr.startValue) / (kr.targetValue - kr.startValue)) * 100
          : 0;
        return sum + Math.min(Math.max(progress, 0), 100) * kr.weight;
      }, 0);

      await prisma.objective.update({
        where: { id: keyResult.objectiveId },
        data: { progress: Math.round(weightedProgress / totalWeight) },
      });
    } else {
      await prisma.objective.update({
        where: { id: keyResult.objectiveId },
        data: { progress: 0 },
      });
    }

    return NextResponse.json({ message: 'Key result deleted successfully' });
  } catch (error) {
    console.error('Failed to delete key result:', error);
    return NextResponse.json({ error: 'Failed to delete key result' }, { status: 500 });
  }
}
