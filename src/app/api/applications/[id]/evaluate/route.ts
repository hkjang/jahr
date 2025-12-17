import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: 면접 평가 등록
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      interviewerId,
      templateId,
      stage,
      scores,
      overallScore,
      recommendation,
      comments,
    } = body;

    if (!interviewerId || !templateId || !stage || !scores || overallScore === undefined || !recommendation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const evaluation = await prisma.interviewEvaluation.create({
      data: {
        applicationId: id,
        interviewerId,
        templateId,
        stage,
        scores,
        overallScore,
        recommendation,
        comments,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    console.error('Error creating evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    );
  }
}

// GET: 지원서별 평가 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const evaluations = await prisma.interviewEvaluation.findMany({
      where: { applicationId: id },
      include: {
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { evaluatedAt: 'desc' },
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}
