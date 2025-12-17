import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List internal opportunities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organizationId');
    const isOpen = searchParams.get('isOpen');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (organizationId) where.organizationId = organizationId;
    if (isOpen === 'true') {
      where.status = 'OPEN';
      where.closingDate = { gte: new Date() };
    }

    const opportunities = await prisma.internalOpportunity.findMany({
      where,
      include: {
        _count: {
          select: { 
            applications: true,
            matches: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { publishedAt: 'desc' }
      ]
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Failed to fetch opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

// POST - Create new internal opportunity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, title, description, organizationId, positionId, jobId,
      requiredSkills, preferredSkills, requirements, duration, hoursPerWeek,
      location, benefits, openings, closingDate, createdBy
    } = body;

    if (!type || !title || !description || !organizationId || !createdBy) {
      return NextResponse.json(
        { error: 'Type, title, description, organization, and creator are required' },
        { status: 400 }
      );
    }

    const opportunity = await prisma.internalOpportunity.create({
      data: {
        type,
        title,
        description,
        organizationId,
        positionId,
        jobId,
        requiredSkills: JSON.parse(JSON.stringify(requiredSkills || [])),
        preferredSkills: preferredSkills ? JSON.parse(JSON.stringify(preferredSkills)) : undefined,
        requirements: requirements ? JSON.parse(JSON.stringify(requirements)) : undefined,
        duration,
        hoursPerWeek,
        location,
        benefits,
        openings: openings || 1,
        closingDate: closingDate ? new Date(closingDate) : undefined,
        status: 'DRAFT',
        createdBy
      }
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Failed to create opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}
