// AI Call Logs API
// AI 호출 로그 조회 (감사용)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { AIFeatureType } from '@/types/ai-provider';

/**
 * GET /api/admin/ai-call-logs
 * AI 호출 로그 조회
 * 
 * Query Parameters:
 * - userId: 특정 사용자 필터
 * - providerId: 특정 Provider 필터
 * - featureType: 특정 기능 필터
 * - status: 상태 필터 (SUCCESS, ERROR, TIMEOUT, RATE_LIMITED)
 * - startDate: 시작 날짜 (ISO 8601)
 * - endDate: 종료 날짜 (ISO 8601)
 * - limit: 조회 개수 (기본 50, 최대 200)
 * - offset: 오프셋
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 파라미터 파싱
    const userId = searchParams.get('userId');
    const providerId = searchParams.get('providerId');
    const featureType = searchParams.get('featureType') as AIFeatureType | null;
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // WHERE 조건 구성
    const where: Record<string, unknown> = {};
    
    if (userId) where.userId = userId;
    if (providerId) where.providerId = providerId;
    if (featureType) where.featureType = featureType;
    if (status) where.status = status;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate);
    }
    
    // 조회
    const [logs, total] = await Promise.all([
      prisma.aICallLog.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.aICallLog.count({ where }),
    ]);
    
    // 통계
    const stats = await prisma.aICallLog.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        logs: logs.map(log => ({
          id: log.id,
          providerId: log.providerId,
          providerName: log.provider?.name,
          providerType: log.provider?.type,
          userId: log.userId,
          featureType: log.featureType,
          modelId: log.modelId,
          requestSummary: log.requestSummary,
          responseLength: log.responseLength,
          latencyMs: log.latencyMs,
          tokenUsage: log.tokenUsage,
          status: log.status,
          errorMessage: log.errorMessage,
          ipAddress: log.ipAddress,
          createdAt: log.createdAt,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        stats: {
          total,
          byStatus: stats.reduce((acc, s) => {
            acc[s.status] = s._count._all;
            return acc;
          }, {} as Record<string, number>),
        },
      },
    });
  } catch (error) {
    console.error('Failed to get AI call logs:', error);
    return NextResponse.json(
      { success: false, error: 'AI 호출 로그 조회 실패' },
      { status: 500 }
    );
  }
}
