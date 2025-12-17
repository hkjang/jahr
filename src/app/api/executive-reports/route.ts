import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 경영 리포트 목록
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');

    const where: { reportType?: string } = {};
    if (reportType) where.reportType = reportType;

    const reports = await prisma.executiveReport.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST: 경영 리포트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, reportType, period, data, summary, keyInsights, generatedBy } = body;

    if (!title || !reportType || !period || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const report = await prisma.executiveReport.create({
      data: {
        title,
        reportType,
        period,
        data,
        summary,
        keyInsights: keyInsights || [],
        generatedBy: generatedBy || 'system',
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
