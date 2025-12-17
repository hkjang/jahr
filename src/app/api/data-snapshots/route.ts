import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 데이터 스냅샷 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    const where: {
      entityType?: string;
      entityId?: string;
    } = {};
    
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const snapshots = await prisma.dataSnapshot.findMany({
      where,
      orderBy: { changedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(snapshots);
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 }
    );
  }
}

// POST: 데이터 스냅샷 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityType, entityId, operation, beforeData, afterData, changedBy, reason } = body;

    if (!entityType || !entityId || !operation || !changedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const snapshot = await prisma.dataSnapshot.create({
      data: {
        entityType,
        entityId,
        operation,
        beforeData,
        afterData,
        changedBy,
        reason,
      },
    });

    return NextResponse.json(snapshot, { status: 201 });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to create snapshot' },
      { status: 500 }
    );
  }
}
