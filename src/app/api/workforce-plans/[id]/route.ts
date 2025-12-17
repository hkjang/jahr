import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 특정 인력 계획 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const plan = await prisma.workforcePlan.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Workforce plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching workforce plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workforce plan' },
      { status: 500 }
    );
  }
}

// PUT: 인력 계획 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      currentHeadcount,
      plannedHeadcount,
      budgetAmount,
      status,
      notes,
    } = body;

    const plan = await prisma.workforcePlan.update({
      where: { id },
      data: {
        ...(currentHeadcount !== undefined && { currentHeadcount }),
        ...(plannedHeadcount !== undefined && { plannedHeadcount }),
        ...(budgetAmount !== undefined && { budgetAmount }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        organization: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error updating workforce plan:', error);
    return NextResponse.json(
      { error: 'Failed to update workforce plan' },
      { status: 500 }
    );
  }
}

// DELETE: 인력 계획 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.workforcePlan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workforce plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete workforce plan' },
      { status: 500 }
    );
  }
}
