import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const level = searchParams.get('level');
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');
    const organizationId = searchParams.get('organizationId');

    const where: Record<string, unknown> = {};

    if (period) where.period = period;
    if (level) where.level = level;
    if (status) where.status = status;
    if (ownerId) where.ownerId = ownerId;
    if (organizationId) where.organizationId = organizationId;

    const objectives = await prisma.objective.findMany({
      where,
      include: {
        keyResults: {
          include: {
            checkIns: {
              orderBy: { checkedAt: 'desc' },
              take: 1,
            },
          },
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
          },
        },
      },
      orderBy: [
        { level: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const objectivesWithProgress = objectives.map((obj) => {
      const keyResultsProgress = obj.keyResults.length > 0
        ? obj.keyResults.reduce((sum, kr) => {
            const progress = kr.targetValue > 0
              ? ((kr.currentValue - kr.startValue) / (kr.targetValue - kr.startValue)) * 100
              : 0;
            return sum + Math.min(Math.max(progress, 0), 100) * kr.weight;
          }, 0) / obj.keyResults.reduce((sum, kr) => sum + kr.weight, 0)
        : 0;

      return {
        ...obj,
        calculatedProgress: Math.round(keyResultsProgress),
      };
    });

    return NextResponse.json(objectivesWithProgress);
  } catch (error) {
    console.error('Failed to fetch objectives:', error);
    return NextResponse.json({ error: 'Failed to fetch objectives' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, level, ownerId, organizationId, parentId, period, keyResults } = body;

    if (!title || !level || !ownerId || !period) {
      return NextResponse.json(
        { error: 'Missing required fields: title, level, ownerId, period' },
        { status: 400 }
      );
    }

    interface KeyResultInput {
      title: string;
      metricType: string;
      startValue?: number;
      targetValue: number;
      weight?: number;
      dueDate?: string;
    }

    const objective = await prisma.objective.create({
      data: {
        title,
        description,
        level,
        ownerId,
        organizationId,
        parentId,
        period,
        status: 'DRAFT',
        keyResults: keyResults?.length > 0 ? {
          create: keyResults.map((kr: KeyResultInput) => ({
            title: kr.title,
            metricType: kr.metricType,
            startValue: kr.startValue || 0,
            targetValue: kr.targetValue,
            weight: kr.weight || 1.0,
            dueDate: kr.dueDate ? new Date(kr.dueDate) : null,
            status: 'DRAFT',
          })),
        } : undefined,
      },
      include: {
        keyResults: true,
        parent: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(objective, { status: 201 });
  } catch (error) {
    console.error('Failed to create objective:', error);
    return NextResponse.json({ error: 'Failed to create objective' }, { status: 500 });
  }
}
