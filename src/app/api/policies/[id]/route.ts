import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 정책 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const policy = await prisma.policy.findUnique({
      where: { id },
      include: {
        category: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
        _count: {
          select: { acknowledgments: true },
        },
      },
    });

    if (!policy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(policy);
  } catch (error) {
    console.error('Error fetching policy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policy' },
      { status: 500 }
    );
  }
}

// PUT: 정책 수정 (새 버전 생성)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, changeNotes, status, effectiveDate, keywords, createdBy } = body;

    // 현재 정책 조회
    const currentPolicy = await prisma.policy.findUnique({
      where: { id },
    });

    if (!currentPolicy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    // 내용 변경 시 새 버전 생성
    if (content) {
      const newVersion = currentPolicy.currentVersion + 1;

      const policy = await prisma.$transaction(async (tx: any) => {
        await tx.policyVersion.create({
          data: {
            policyId: id,
            versionNumber: newVersion,
            content,
            summary: `버전 ${newVersion}`,
            changeNotes,
            effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
            createdBy: createdBy || 'admin',
          },
        });

        return tx.policy.update({
          where: { id },
          data: {
            ...(title && { title }),
            currentVersion: newVersion,
            ...(status && { status }),
            ...(effectiveDate && { effectiveDate: new Date(effectiveDate) }),
            ...(keywords && { keywords }),
          },
        });
      });

      return NextResponse.json(policy);
    }

    // 메타데이터만 변경
    const policy = await prisma.policy.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(status && { status }),
        ...(effectiveDate !== undefined && { 
          effectiveDate: effectiveDate ? new Date(effectiveDate) : null 
        }),
        ...(keywords && { keywords }),
      },
    });

    return NextResponse.json(policy);
  } catch (error) {
    console.error('Error updating policy:', error);
    return NextResponse.json(
      { error: 'Failed to update policy' },
      { status: 500 }
    );
  }
}

// DELETE: 정책 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.policy.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting policy:', error);
    return NextResponse.json(
      { error: 'Failed to delete policy' },
      { status: 500 }
    );
  }
}
