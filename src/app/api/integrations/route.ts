import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 외부 연동 목록
export async function GET() {
  try {
    const integrations = await prisma.externalIntegration.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(integrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// POST: 외부 연동 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, config } = body;

    if (!name || !type || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, config' },
        { status: 400 }
      );
    }

    const integration = await prisma.externalIntegration.create({
      data: {
        name,
        type,
        config,
        isActive: true,
      },
    });

    return NextResponse.json(integration, { status: 201 });
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { error: 'Failed to create integration' },
      { status: 500 }
    );
  }
}
