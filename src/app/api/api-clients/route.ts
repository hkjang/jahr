import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

// GET: API 클라이언트 목록
export async function GET() {
  try {
    const clients = await prisma.apiClient.findMany({
      select: {
        id: true,
        name: true,
        clientId: true,
        description: true,
        allowedScopes: true,
        isActive: true,
        rateLimitPerMin: true,
        createdAt: true,
        _count: {
          select: { logs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST: API 클라이언트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, allowedScopes, allowedOrigins, rateLimitPerMin } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // 클라이언트 ID와 시크릿 생성
    const clientId = `cli_${randomBytes(16).toString('hex')}`;
    const clientSecret = `sec_${randomBytes(32).toString('hex')}`;

    const client = await prisma.apiClient.create({
      data: {
        name,
        clientId,
        clientSecret,
        description,
        allowedScopes: allowedScopes || ['read'],
        allowedOrigins: allowedOrigins || [],
        rateLimitPerMin: rateLimitPerMin || 60,
        isActive: true,
      },
    });

    // 시크릿은 생성 시에만 반환
    return NextResponse.json({
      ...client,
      clientSecret, // 최초 생성 시에만 표시
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
