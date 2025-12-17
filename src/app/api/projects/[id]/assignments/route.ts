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

    const assignments = await prisma.projectAssignment.findMany({
      where: { projectId: id },
      orderBy: [{ role: 'asc' }, { startDate: 'asc' }],
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { employeeId, role, allocation, startDate, endDate, responsibilities } = body;

    if (!employeeId || !role || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeId, role, startDate' },
        { status: 400 }
      );
    }

    const assignment = await prisma.projectAssignment.create({
      data: {
        projectId: id,
        employeeId,
        role,
        allocation: allocation ?? 100,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        responsibilities,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Failed to create assignment:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
