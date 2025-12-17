// AI Provider Connection Test API
// Provider 연결 테스트

import { NextRequest, NextResponse } from 'next/server';
import { testProviderConnection } from '@/lib/ai-config-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/ai-providers/[id]/test
 * Provider 연결 테스트 실행
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const result = await testProviderConnection(id);
    
    return NextResponse.json({
      success: result.success,
      data: {
        connected: result.success,
        message: result.message,
        latencyMs: result.latencyMs,
        modelCount: result.modelCount,
      },
    });
  } catch (error) {
    console.error('Failed to test AI provider connection:', error);
    const message = error instanceof Error ? error.message : '연결 테스트 실패';
    return NextResponse.json(
      { 
        success: false, 
        data: {
          connected: false,
          message: message,
        },
      },
      { status: 500 }
    );
  }
}
