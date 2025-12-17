import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/okr/objectives/[id] - 목표 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const objective = await prisma.objective.findUnique({
      where: { id },
      include: {
        keyResults: {
          include: {
            checkIns: {
              orderBy: { checkedAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        children: {
          include: {
            keyResults: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
            level: true,
            ownerId: true,
          },
        },
      },
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    // 진행률 계산
    const keyResultsProgress = objective.keyResults.length > 0
      ? objective.keyResults.reduce((sum, kr) => {
          const progress = kr.targetValue > 0
            ? ((kr.currentValue - kr.startValue) / (kr.targetValue - kr.startValue)) * 100
            : 0;
          return sum + Math.min(Math.max(progress, 0), 100) * kr.weight;
        }, 0) / objective.keyResults.reduce((sum, kr) => sum + kr.weight, 0)
      : 0;

    return NextResponse.json({
      ...objective,
      calculatedProgress: Math.round(keyResultsProgress),
    });
  } catch (error) {
    console.error('Failed to fetch objective:', error);
    return NextResponse.json({ error: 'Failed to fetch objective' }, { status: 500 });
  }
}

// PUT /api/okr/objectives/[id] - 목표 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, status, parentId, organizationId } = body;

    const objective = await prisma.objective.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(parentId !== undefined && { parentId }),
        ...(organizationId !== undefined && { organizationId }),
      },
      include: {
        keyResults: true,
        parent: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(objective);
  } catch (error) {
    console.error('Failed to update objective:', error);
    return NextResponse.json({ error: 'Failed to update objective' }, { status: 500 });
  }
}

// DELETE /api/okr/objectives/[id] - 목표 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // 하위 목표가 있는지 확인
    const childCount = await prisma.objective.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete objective with child objectives' },
        { status: 400 }
      );
    }

    await prisma.objective.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Objective deleted successfully' });
  } catch (error) {
    console.error('Failed to delete objective:', error);
    return NextResponse.json({ error: 'Failed to delete objective' }, { status: 500 });
  }
}
