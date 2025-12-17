import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List dispute cases
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const assignedTo = searchParams.get('assignedTo');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (assignedTo) where.assignedTo = assignedTo;

    const cases = await prisma.disputeCase.findMany({
      where,
      include: {
        timeline: {
          orderBy: { eventDate: 'desc' },
          take: 5
        },
        evidences: {
          select: { id: true, type: true, title: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error('Failed to fetch dispute cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dispute cases' },
      { status: 500 }
    );
  }
}

// POST - Create a new dispute case
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description, category, reporterId, isAnonymous,
      involvedParties, priority
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    // Generate case number
    const count = await prisma.disputeCase.count();
    const caseNumber = `DC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const disputeCase = await prisma.disputeCase.create({
      data: {
        caseNumber,
        title,
        description,
        category,
        reporterId: isAnonymous ? null : reporterId,
        isAnonymous: isAnonymous || false,
        involvedParties: JSON.parse(JSON.stringify(involvedParties || [])),
        status: 'REPORTED',
        priority: priority || 'MEDIUM',
        timeline: {
          create: {
            eventDate: new Date(),
            eventType: 'REPORTED',
            title: '케이스 접수',
            description: '새로운 분쟁 케이스가 접수되었습니다.',
            actorId: isAnonymous ? null : reporterId
          }
        }
      },
      include: { timeline: true }
    });

    return NextResponse.json(disputeCase, { status: 201 });
  } catch (error) {
    console.error('Failed to create dispute case:', error);
    return NextResponse.json(
      { error: 'Failed to create dispute case' },
      { status: 500 }
    );
  }
}
