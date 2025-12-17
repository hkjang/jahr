import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 성능 메트릭 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const hours = parseInt(searchParams.get('hours') || '24');

    const since = new Date();
    since.setHours(since.getHours() - hours);

    const where: {
      timestamp: { gte: Date };
      endpoint?: string;
    } = {
      timestamp: { gte: since },
    };
    
    if (endpoint) where.endpoint = endpoint;

    const metrics = await prisma.performanceMetric.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });

    // 집계 통계
    const stats = {
      total: metrics.length,
      avgResponseTime: metrics.length > 0 
        ? Math.round(metrics.reduce((sum: number, m: { responseTime: number }) => sum + m.responseTime, 0) / metrics.length)
        : 0,
      p95ResponseTime: metrics.length > 0
        ? metrics.sort((a: { responseTime: number }, b: { responseTime: number }) => b.responseTime - a.responseTime)[Math.floor(metrics.length * 0.05)]?.responseTime || 0
        : 0,
      errorRate: metrics.length > 0
        ? Math.round((metrics.filter((m: { statusCode: number }) => m.statusCode >= 400).length / metrics.length) * 100 * 10) / 10
        : 0,
    };

    return NextResponse.json({ metrics: metrics.slice(0, 100), stats });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// POST: 성능 메트릭 기록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, method, responseTime, statusCode, metadata } = body;

    if (!endpoint || !method || responseTime === undefined || !statusCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const metric = await prisma.performanceMetric.create({
      data: {
        endpoint,
        method,
        responseTime,
        statusCode,
        metadata,
      },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}
