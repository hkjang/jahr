import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: 정책 확인/동의
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 정책 조회
    const policy = await prisma.policy.findUnique({
      where: { id },
    });

    if (!policy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    // 이미 동의했는지 확인
    const existing = await prisma.policyAcknowledgment.findUnique({
      where: {
        policyId_userId_versionNumber: {
          policyId: id,
          userId,
          versionNumber: policy.currentVersion,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already acknowledged this version' },
        { status: 400 }
      );
    }

    // 동의 기록 생성
    const acknowledgment = await prisma.policyAcknowledgment.create({
      data: {
        policyId: id,
        userId,
        versionNumber: policy.currentVersion,
      },
    });

    return NextResponse.json(acknowledgment, { status: 201 });
  } catch (error) {
    console.error('Error acknowledging policy:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge policy' },
      { status: 500 }
    );
  }
}

// GET: 정책 동의 현황 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const acknowledgments = await prisma.policyAcknowledgment.findMany({
      where: { policyId: id },
      orderBy: { acknowledgedAt: 'desc' },
    });

    return NextResponse.json(acknowledgments);
  } catch (error) {
    console.error('Error fetching acknowledgments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch acknowledgments' },
      { status: 500 }
    );
  }
}
