import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 외부 검증 (검증 코드로 증명서 유효성 확인)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    const issuance = await prisma.certificateIssuance.findUnique({
      where: { verificationCode: code },
      include: {
        template: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    if (!issuance) {
      return NextResponse.json(
        { valid: false, error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // 발급 상태 확인
    if (issuance.status !== 'ISSUED') {
      return NextResponse.json({
        valid: false,
        error: 'Certificate not issued',
        status: issuance.status,
      });
    }

    // 만료 확인
    if (issuance.expiryDate && new Date() > issuance.expiryDate) {
      return NextResponse.json({
        valid: false,
        error: 'Certificate expired',
        expiredAt: issuance.expiryDate,
      });
    }

    // 유효한 증명서
    return NextResponse.json({
      valid: true,
      certificateType: issuance.template.type,
      certificateName: issuance.template.name,
      issuedAt: issuance.issuedAt,
      expiryDate: issuance.expiryDate,
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json(
      { error: 'Failed to verify certificate' },
      { status: 500 }
    );
  }
}
