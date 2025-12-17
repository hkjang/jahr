import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 백업 스케줄 조회
export async function GET() {
  try {
    const schedules = await prisma.backupSchedule.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching backup schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backup schedules' },
      { status: 500 }
    );
  }
}

// POST: 백업 스케줄 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, schedule, retentionDays } = body;

    if (!name || !type || !schedule) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const backupSchedule = await prisma.backupSchedule.create({
      data: {
        name,
        type,
        schedule,
        retentionDays: retentionDays || 30,
        isActive: true,
      },
    });

    return NextResponse.json(backupSchedule, { status: 201 });
  } catch (error) {
    console.error('Error creating backup schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create backup schedule' },
      { status: 500 }
    );
  }
}
