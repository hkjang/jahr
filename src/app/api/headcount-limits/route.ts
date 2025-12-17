import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 정원 관리 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    const where: { organizationId?: string } = {};
    if (organizationId) where.organizationId = organizationId;

    const limits = await prisma.headcountLimit.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true,
          },
        },
      },
      orderBy: { effectiveDate: 'desc' },
    });

    return NextResponse.json(limits);
  } catch (error) {
    console.error('Error fetching headcount limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch headcount limits' },
      { status: 500 }
    );
  }
}

// POST: 정원 설정
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, limitCount, effectiveDate, expiryDate } = body;

    if (!organizationId || limitCount === undefined || !effectiveDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const limit = await prisma.headcountLimit.create({
      data: {
        organizationId,
        limitCount,
        effectiveDate: new Date(effectiveDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
      include: {
        organization: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(limit, { status: 201 });
  } catch (error) {
    console.error('Error creating headcount limit:', error);
    return NextResponse.json(
      { error: 'Failed to create headcount limit' },
      { status: 500 }
    );
  }
}
