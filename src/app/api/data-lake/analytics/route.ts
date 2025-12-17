import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Store or update time series analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metricName, organizationId, timePeriod, periodValue, value, previousValue } = body;

    if (!metricName || !timePeriod || !periodValue || value === undefined) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Calculate change percent and trend
    let changePercent = null;
    let trend = 'STABLE';
    
    if (previousValue !== undefined && previousValue !== null && previousValue !== 0) {
      changePercent = ((value - previousValue) / previousValue) * 100;
      if (changePercent > 5) trend = 'UP';
      else if (changePercent < -5) trend = 'DOWN';
    }

    const analysis = await prisma.timeSeriesAnalysis.upsert({
      where: {
        metricName_organizationId_timePeriod_periodValue: {
          metricName,
          organizationId: organizationId || '',
          timePeriod,
          periodValue
        }
      },
      create: {
        metricName,
        organizationId,
        timePeriod,
        periodValue,
        value,
        previousValue,
        changePercent,
        trend
      },
      update: {
        value,
        previousValue,
        changePercent,
        trend,
        calculatedAt: new Date()
      }
    });

    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    console.error('Failed to store time series:', error);
    return NextResponse.json(
      { error: 'Failed to store time series' },
      { status: 500 }
    );
  }
}

// GET - Query time series data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metricName = searchParams.get('metricName');
    const organizationId = searchParams.get('organizationId');
    const timePeriod = searchParams.get('timePeriod');
    const startPeriod = searchParams.get('startPeriod');
    const endPeriod = searchParams.get('endPeriod');

    const where: Record<string, unknown> = {};
    if (metricName) where.metricName = metricName;
    if (organizationId) where.organizationId = organizationId;
    if (timePeriod) where.timePeriod = timePeriod;
    if (startPeriod || endPeriod) {
      where.periodValue = {};
      if (startPeriod) (where.periodValue as Record<string, unknown>).gte = startPeriod;
      if (endPeriod) (where.periodValue as Record<string, unknown>).lte = endPeriod;
    }

    const series = await prisma.timeSeriesAnalysis.findMany({
      where,
      orderBy: { periodValue: 'asc' },
      take: 100
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error('Failed to fetch time series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time series' },
      { status: 500 }
    );
  }
}
