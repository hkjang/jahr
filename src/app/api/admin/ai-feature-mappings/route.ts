// AI Feature Mappings API
// 기능별 모델 매핑 관리

import { NextRequest, NextResponse } from 'next/server';
import { 
  getFeatureModelMappings, 
  setFeatureModelMapping,
} from '@/lib/ai-config-service';
import type { AIFeatureType } from '@/types/ai-provider';

/**
 * GET /api/admin/ai-feature-mappings
 * 기능-모델 매핑 목록 조회
 */
export async function GET() {
  try {
    const mappings = await getFeatureModelMappings();
    return NextResponse.json({
      success: true,
      data: mappings,
    });
  } catch (error) {
    console.error('Failed to get feature mappings:', error);
    return NextResponse.json(
      { success: false, error: '기능 매핑 조회 실패' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ai-feature-mappings
 * 기능-모델 매핑 설정
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { featureType, modelId, isDefault, priority, maxTokensOverride, temperatureOverride, systemPrompt } = body;
    
    // 필수 필드 검증
    if (!featureType || !modelId) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다 (featureType, modelId)' },
        { status: 400 }
      );
    }
    
    // 지원하는 기능 타입 검증
    const validFeatureTypes: AIFeatureType[] = [
      'HR_SUMMARY',
      'AI_RECOMMENDATION',
      'REGULATION_QA',
      'DOCUMENT_GENERATION',
      'SENTIMENT_ANALYSIS',
      'CHATBOT',
    ];
    
    if (!validFeatureTypes.includes(featureType)) {
      return NextResponse.json(
        { success: false, error: '지원하지 않는 기능 타입입니다' },
        { status: 400 }
      );
    }
    
    await setFeatureModelMapping(featureType, modelId, {
      isDefault,
      priority,
      maxTokensOverride,
      temperatureOverride,
      systemPrompt,
    });
    
    return NextResponse.json({
      success: true,
      message: '기능 매핑이 설정되었습니다',
    });
  } catch (error) {
    console.error('Failed to set feature mapping:', error);
    const message = error instanceof Error ? error.message : '기능 매핑 설정 실패';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
