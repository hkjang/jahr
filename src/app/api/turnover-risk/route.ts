import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 이직 위험 분석 목록
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const riskLevel = searchParams.get('level');
    const employeeId = searchParams.get('employeeId');

    const where: { riskLevel?: string; employeeId?: string } = {};
    if (riskLevel) where.riskLevel = riskLevel;
    if (employeeId) where.employeeId = employeeId;

    const analyses = await prisma.turnoverRiskAnalysis.findMany({
      where,
      orderBy: [
        { riskScore: 'desc' },
        { analyzedAt: 'desc' },
      ],
      take: 100,
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error('Error fetching turnover risk:', error);
    return NextResponse.json(
      { error: 'Failed to fetch turnover risk' },
      { status: 500 }
    );
  }
}

// POST: 이직 위험 분석 실행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, riskScore, riskLevel, factors, recommendations } = body;

    if (!employeeId || riskScore === undefined || !riskLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const analysis = await prisma.turnoverRiskAnalysis.create({
      data: {
        employeeId,
        riskScore,
        riskLevel,
        factors: factors || {},
        recommendations: recommendations || [],
      },
    });

    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    console.error('Error creating turnover risk:', error);
    return NextResponse.json(
      { error: 'Failed to create turnover risk' },
      { status: 500 }
    );
  }
}
