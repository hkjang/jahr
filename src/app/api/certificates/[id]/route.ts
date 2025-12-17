import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 증명서 상세/검증
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // ID 또는 검증코드로 조회
    const issuance = await prisma.certificateIssuance.findFirst({
      where: {
        OR: [
          { id },
          { verificationCode: id },
        ],
      },
      include: {
        template: true,
      },
    });

    if (!issuance) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // 만료 확인
    if (issuance.expiryDate && new Date() > issuance.expiryDate) {
      return NextResponse.json({
        ...issuance,
        isExpired: true,
      });
    }

    return NextResponse.json({
      ...issuance,
      isExpired: false,
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate' },
      { status: 500 }
    );
  }
}

// PUT: 증명서 상태 변경 (승인/발급/거절)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, approvedBy, documentUrl, signatureData } = body;

    const updateData: {
      status?: typeof status;
      approvedBy?: string;
      approvedAt?: Date;
      issuedAt?: Date;
      documentUrl?: string;
      signatureData?: typeof signatureData;
      expiryDate?: Date;
    } = {};

    if (status) {
      updateData.status = status;
      
      if (status === 'APPROVED') {
        updateData.approvedBy = approvedBy;
        updateData.approvedAt = new Date();
      }
      
      if (status === 'ISSUED') {
        updateData.issuedAt = new Date();
        // 기본 유효기간 90일
        updateData.expiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      }
    }

    if (documentUrl) updateData.documentUrl = documentUrl;
    if (signatureData) updateData.signatureData = signatureData;

    const issuance = await prisma.certificateIssuance.update({
      where: { id },
      data: updateData,
      include: {
        template: true,
      },
    });

    return NextResponse.json(issuance);
  } catch (error) {
    console.error('Error updating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to update certificate' },
      { status: 500 }
    );
  }
}
