import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get specific opportunity with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const opportunity = await prisma.internalOpportunity.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            interviews: true
          }
        },
        matches: {
          orderBy: { matchScore: 'desc' },
          take: 20
        }
      }
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Failed to fetch opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity' },
      { status: 500 }
    );
  }
}

// PUT - Update opportunity (publish, close, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, title, description, closingDate, openings } = body;

    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'OPEN') {
        updateData.publishedAt = new Date();
      }
    }
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (closingDate) updateData.closingDate = new Date(closingDate);
    if (openings !== undefined) updateData.openings = openings;

    const opportunity = await prisma.internalOpportunity.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Failed to update opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to update opportunity' },
      { status: 500 }
    );
  }
}

// DELETE - Delete opportunity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.internalOpportunity.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to delete opportunity' },
      { status: 500 }
    );
  }
}
