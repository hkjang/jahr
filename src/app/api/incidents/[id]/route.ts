import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 인시던트 상세
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const incident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

// PUT: 인시던트 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, assignedTo, rootCause, resolution, timelineEvent } = body;

    const current = await prisma.incident.findUnique({
      where: { id },
    });

    if (!current) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // 타임라인에 이벤트 추가
    const timeline = (current.timeline as Array<{ timestamp: string; event: string; user: string }>) || [];
    if (timelineEvent) {
      timeline.push({
        timestamp: new Date().toISOString(),
        event: timelineEvent,
        user: 'admin',
      });
    }

    const updateData: {
      status?: typeof status;
      assignedTo?: string;
      rootCause?: string;
      resolution?: string;
      resolvedAt?: Date;
      timeline: typeof timeline;
    } = { timeline };

    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (rootCause) updateData.rootCause = rootCause;
    if (resolution) updateData.resolution = resolution;

    const incident = await prisma.incident.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}
