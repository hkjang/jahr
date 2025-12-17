import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

// GET: 증명서 발급 목록
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    const where: {
      employeeId?: string;
      status?: 'REQUESTED' | 'APPROVED' | 'ISSUED' | 'REJECTED' | 'EXPIRED';
    } = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status as typeof where.status;

    const issuances = await prisma.certificateIssuance.findMany({
      where,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(issuances);
  } catch (error) {
    console.error('Error fetching issuances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issuances' },
      { status: 500 }
    );
  }
}

// POST: 증명서 발급 요청
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, employeeId, purpose, requestedBy } = body;

    if (!templateId || !employeeId) {
      return NextResponse.json(
        { error: 'Missing required fields: templateId, employeeId' },
        { status: 400 }
      );
    }

    // 고유 검증 코드 생성
    const verificationCode = randomBytes(16).toString('hex').toUpperCase();

    const issuance = await prisma.certificateIssuance.create({
      data: {
        templateId,
        employeeId,
        purpose,
        requestedBy: requestedBy || employeeId,
        verificationCode,
        status: 'REQUESTED',
      },
      include: {
        template: true,
      },
    });

    return NextResponse.json(issuance, { status: 201 });
  } catch (error) {
    console.error('Error creating issuance:', error);
    return NextResponse.json(
      { error: 'Failed to create issuance' },
      { status: 500 }
    );
  }
}
