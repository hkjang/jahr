// AI Provider Models API
// Provider 모델 동기화 및 조회

import { NextRequest, NextResponse } from 'next/server';
import { syncProviderModels, getProviderModels } from '@/lib/ai-config-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/ai-providers/[id]/models
 * Provider 모델 목록 조회
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const models = await getProviderModels(id);
    
    return NextResponse.json({
      success: true,
      data: models,
    });
  } catch (error) {
    console.error('Failed to get provider models:', error);
    return NextResponse.json(
      { success: false, error: '모델 목록 조회 실패' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ai-providers/[id]/models
 * Provider 모델 동기화 (서버에서 최신 목록 가져오기)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const result = await syncProviderModels(id);
    
    return NextResponse.json({
      success: true,
      data: {
        added: result.added.length,
        updated: result.updated.length,
        removed: result.removed.length,
        models: result.added,
        errors: result.errors,
      },
      message: `동기화 완료: ${result.added.length}개 추가, ${result.updated.length}개 업데이트, ${result.removed.length}개 제거`,
    });
  } catch (error) {
    console.error('Failed to sync provider models:', error);
    const message = error instanceof Error ? error.message : '모델 동기화 실패';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
