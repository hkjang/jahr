import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List batch jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const jobs = await prisma.batchJob.findMany({
      where,
      include: {
        logs: {
          where: { level: 'ERROR' },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Failed to fetch batch jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch jobs' },
      { status: 500 }
    );
  }
}

// POST - Create and queue a new batch job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, description, parameters, scheduledAt, priority, createdBy } = body;

    if (!type || !name || !createdBy) {
      return NextResponse.json(
        { error: 'Type, name, and creator are required' },
        { status: 400 }
      );
    }

    const job = await prisma.batchJob.create({
      data: {
        type,
        name,
        description,
        parameters: JSON.parse(JSON.stringify(parameters || {})),
        status: scheduledAt ? 'PENDING' : 'QUEUED',
        priority: priority || 0,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdBy
      }
    });

    // Log job creation
    await prisma.batchJobLog.create({
      data: {
        jobId: job.id,
        level: 'INFO',
        message: `Batch job created: ${name}`,
        details: JSON.parse(JSON.stringify({ type, parameters }))
      }
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Failed to create batch job:', error);
    return NextResponse.json(
      { error: 'Failed to create batch job' },
      { status: 500 }
    );
  }
}
