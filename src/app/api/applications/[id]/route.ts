import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 지원서 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: true,
        posting: true,
        stages: {
          orderBy: { processedAt: 'asc' },
        },
        evaluations: {
          include: {
            template: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { evaluatedAt: 'desc' },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

// PUT: 지원서 상태/단계 변경
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, currentStage, stageResult, notes, processedBy } = body;

    const updateData: {
      status?: 'SUBMITTED' | 'IN_REVIEW' | 'PASSED' | 'REJECTED' | 'WITHDRAWN';
      currentStage?: 'DOCUMENT' | 'FIRST_INTERVIEW' | 'SECOND_INTERVIEW' | 'FINAL_INTERVIEW' | 'OFFER' | 'ONBOARDING';
    } = {};

    if (status) updateData.status = status;
    if (currentStage) updateData.currentStage = currentStage;

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        applicant: true,
        posting: true,
      },
    });

    // 단계 변경 시 이력 생성
    if (currentStage) {
      await prisma.applicationStageHistory.create({
        data: {
          applicationId: id,
          stage: currentStage,
          result: stageResult || 'PENDING',
          notes,
          processedBy,
        },
      });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// DELETE: 지원서 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
