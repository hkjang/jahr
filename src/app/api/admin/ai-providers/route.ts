// AI Providers Admin API
// Provider 설정 CRUD

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProviders,
  createProvider,
} from '@/lib/ai-config-service';
import type { AIProviderConfigInput } from '@/types/ai-provider';

/**
 * GET /api/admin/ai-providers
 * 모든 Provider 목록 조회
 */
export async function GET() {
  try {
    const providers = await getAllProviders();
    return NextResponse.json({
      success: true,
      data: providers,
    });
  } catch (error) {
    console.error('Failed to get AI providers:', error);
    return NextResponse.json(
      { success: false, error: 'Provider 목록 조회 실패' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ai-providers
 * 새 Provider 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 필수 필드 검증
    const { name, type, baseUrl, apiKey, ...options } = body as AIProviderConfigInput & { apiKey?: string };
    
    if (!name || !type || !baseUrl) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다 (name, type, baseUrl)' },
        { status: 400 }
      );
    }
    
    // 지원하는 Provider 타입 검증
    if (!['VLLM', 'OLLAMA', 'OPENAI_COMPATIBLE'].includes(type)) {
      return NextResponse.json(
        { success: false, error: '지원하지 않는 Provider 타입입니다' },
        { status: 400 }
      );
    }
    
    // TODO: 실제 구현에서는 세션에서 사용자 ID 가져오기
    const createdBy = 'system';
    
    const provider = await createProvider(
      { name, type, baseUrl, apiKey, ...options },
      createdBy
    );
    
    return NextResponse.json({
      success: true,
      data: provider,
    });
  } catch (error) {
    console.error('Failed to create AI provider:', error);
    const message = error instanceof Error ? error.message : 'Provider 생성 실패';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
