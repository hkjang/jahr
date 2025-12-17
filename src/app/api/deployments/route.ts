import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 배포 기록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment');

    const where: { environment?: string } = {};
    if (environment) where.environment = environment;

    const deployments = await prisma.deploymentRecord.findMany({
      where,
      orderBy: { deployedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(deployments);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deployments' },
      { status: 500 }
    );
  }
}

// POST: 배포 기록 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { version, environment, deployedBy, changelog, status, duration } = body;

    if (!version || !environment || !deployedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const deployment = await prisma.deploymentRecord.create({
      data: {
        version,
        environment,
        deployedBy,
        changelog,
        status: status || 'SUCCESS',
        duration,
      },
    });

    return NextResponse.json(deployment, { status: 201 });
  } catch (error) {
    console.error('Error creating deployment:', error);
    return NextResponse.json(
      { error: 'Failed to create deployment' },
      { status: 500 }
    );
  }
}
