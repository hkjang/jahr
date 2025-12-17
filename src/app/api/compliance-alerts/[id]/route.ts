import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: 경고 해결 처리
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isResolved, resolvedBy, resolutionNotes } = body;

    const alert = await prisma.complianceAlert.update({
      where: { id },
      data: {
        isResolved: isResolved ?? true,
        resolvedBy,
        resolvedAt: isResolved ? new Date() : null,
        resolutionNotes,
      },
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
