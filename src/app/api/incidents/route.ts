import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 인시던트 목록
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');

    const where: {
      status?: 'OPEN' | 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
      severity?: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
    } = {};
    
    if (status) where.status = status as typeof where.status;
    if (severity) where.severity = severity as typeof where.severity;

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: [
        { severity: 'asc' },
        { startedAt: 'desc' },
      ],
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

// POST: 인시던트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, severity, affectedSystems, assignedTo } = body;

    if (!title || !description || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        severity,
        status: 'OPEN',
        affectedSystems: affectedSystems || [],
        assignedTo,
        timeline: [{
          timestamp: new Date().toISOString(),
          event: 'Incident created',
          user: 'system',
        }],
      },
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}
