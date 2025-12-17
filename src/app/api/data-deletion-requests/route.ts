import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 데이터 삭제 요청 목록
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: {
      status?: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
    } = {};
    
    if (status) where.status = status as typeof where.status;

    const requests = await prisma.dataDeletionRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching deletion requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deletion requests' },
      { status: 500 }
    );
  }
}

// POST: 데이터 삭제 요청 생성 (GDPR)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requesterId, targetUserId, reason } = body;

    if (!requesterId || !targetUserId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const deletionRequest = await prisma.dataDeletionRequest.create({
      data: {
        requesterId,
        targetUserId,
        reason,
        status: 'PENDING',
      },
    });

    return NextResponse.json(deletionRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating deletion request:', error);
    return NextResponse.json(
      { error: 'Failed to create deletion request' },
      { status: 500 }
    );
  }
}
