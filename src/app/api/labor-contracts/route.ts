import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 근로 계약 목록
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const expiringSoon = searchParams.get('expiringSoon');

    const where: {
      employeeId?: string;
      status?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'TERMINATED' | 'RENEWED';
      endDate?: { lte: Date };
    } = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status as typeof where.status;
    
    // 30일 내 만료 예정
    if (expiringSoon === 'true') {
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      where.endDate = { lte: thirtyDaysLater };
      where.status = 'ACTIVE';
    }

    const contracts = await prisma.laborContract.findMany({
      where,
      orderBy: { endDate: 'asc' },
    });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

// POST: 근로 계약 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      contractType,
      startDate,
      endDate,
      probationEnd,
      workingHours,
      terms,
      documentUrl,
    } = body;

    if (!employeeId || !contractType || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const contract = await prisma.laborContract.create({
      data: {
        employeeId,
        contractType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        probationEnd: probationEnd ? new Date(probationEnd) : null,
        workingHours: workingHours || 40,
        terms,
        documentUrl,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    );
  }
}
