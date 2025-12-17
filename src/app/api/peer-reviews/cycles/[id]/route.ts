import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const cycle = await prisma.peerReviewCycle.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          select: {
            id: true,
            reviewerId: true,
            revieweeId: true,
            reviewType: true,
            status: true,
            overallRating: true,
            completedAt: true,
          },
        },
      },
    });

    if (!cycle) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });
    }

    const byType = {
      UPWARD: cycle.reviews.filter((r) => r.reviewType === 'UPWARD'),
      DOWNWARD: cycle.reviews.filter((r) => r.reviewType === 'DOWNWARD'),
      LATERAL: cycle.reviews.filter((r) => r.reviewType === 'LATERAL'),
      SELF: cycle.reviews.filter((r) => r.reviewType === 'SELF'),
    };

    const stats = {
      total: cycle.reviews.length,
      completed: cycle.reviews.filter((r) => r.status === 'COMPLETED').length,
      pending: cycle.reviews.filter((r) => r.status === 'PENDING').length,
      inProgress: cycle.reviews.filter((r) => r.status === 'IN_PROGRESS').length,
      byType: Object.entries(byType).map(([type, reviews]) => ({
        type,
        total: reviews.length,
        completed: reviews.filter((r) => r.status === 'COMPLETED').length,
      })),
    };

    return NextResponse.json({
      ...cycle,
      stats,
    });
  } catch (error) {
    console.error('Failed to fetch cycle:', error);
    return NextResponse.json({ error: 'Failed to fetch cycle' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, startDate, endDate, status } = body;

    const cycle = await prisma.peerReviewCycle.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
      },
      include: {
        questions: {
          include: { question: true },
        },
      },
    });

    return NextResponse.json(cycle);
  } catch (error) {
    console.error('Failed to update cycle:', error);
    return NextResponse.json({ error: 'Failed to update cycle' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const inProgressCount = await prisma.peerReview.count({
      where: {
        cycleId: id,
        status: { in: ['IN_PROGRESS', 'COMPLETED'] },
      },
    });

    if (inProgressCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete cycle with completed or in-progress reviews' },
        { status: 400 }
      );
    }

    await prisma.peerReviewCycle.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cycle deleted successfully' });
  } catch (error) {
    console.error('Failed to delete cycle:', error);
    return NextResponse.json({ error: 'Failed to delete cycle' }, { status: 500 });
  }
}
