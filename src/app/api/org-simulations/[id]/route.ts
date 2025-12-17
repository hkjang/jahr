import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 시뮬레이션 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const simulation = await prisma.orgRestructureSimulation.findUnique({
      where: { id },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(simulation);
  } catch (error) {
    console.error('Error fetching simulation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulation' },
      { status: 500 }
    );
  }
}

// PUT: 시뮬레이션 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, currentStructure, proposedStructure, impactAnalysis, status } = body;

    const simulation = await prisma.orgRestructureSimulation.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(currentStructure && { currentStructure }),
        ...(proposedStructure && { proposedStructure }),
        ...(impactAnalysis && { impactAnalysis }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(simulation);
  } catch (error) {
    console.error('Error updating simulation:', error);
    return NextResponse.json(
      { error: 'Failed to update simulation' },
      { status: 500 }
    );
  }
}

// DELETE: 시뮬레이션 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.orgRestructureSimulation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting simulation:', error);
    return NextResponse.json(
      { error: 'Failed to delete simulation' },
      { status: 500 }
    );
  }
}
