// AI Provider Detail API
// 개별 Provider 관리 (조회, 수정, 삭제)

import { NextRequest, NextResponse } from 'next/server';
import {
  getProviderById,
  updateProvider,
  deleteProvider,
  setDefaultProvider,
} from '@/lib/ai-config-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/ai-providers/[id]
 * Provider 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const provider = await getProviderById(id);
    
    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: provider,
    });
  } catch (error) {
    console.error('Failed to get AI provider:', error);
    return NextResponse.json(
      { success: false, error: 'Provider 조회 실패' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ai-providers/[id]
 * Provider 업데이트
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData = { ...body };
    
    // setDefault 플래그 처리
    if (body.setDefault === true) {
      await setDefaultProvider(id);
      delete updateData.setDefault;
    }
    
    // 다른 필드 업데이트가 있는 경우
    if (Object.keys(updateData).length > 0) {
      const provider = await updateProvider(id, updateData);
      return NextResponse.json({
        success: true,
        data: provider,
      });
    }
    
    const provider = await getProviderById(id);
    return NextResponse.json({
      success: true,
      data: provider,
    });
  } catch (error) {
    console.error('Failed to update AI provider:', error);
    const message = error instanceof Error ? error.message : 'Provider 업데이트 실패';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ai-providers/[id]
 * Provider 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    await deleteProvider(id);
    
    return NextResponse.json({
      success: true,
      message: 'Provider가 삭제되었습니다',
    });
  } catch (error) {
    console.error('Failed to delete AI provider:', error);
    return NextResponse.json(
      { success: false, error: 'Provider 삭제 실패' },
      { status: 500 }
    );
  }
}
