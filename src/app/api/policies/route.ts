import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 정책 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const where: {
      status?: 'DRAFT' | 'UNDER_REVIEW' | 'ACTIVE' | 'DEPRECATED';
      categoryId?: string;
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        code?: { contains: string; mode: 'insensitive' };
        keywords?: { has: string };
      }>;
    } = {};
    
    if (status) where.status = status as typeof where.status;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { keywords: { has: search } },
      ];
    }

    const policies = await prisma.policy.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { 
            versions: true,
            acknowledgments: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}

// POST: 정책 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      title,
      categoryId,
      content,
      effectiveDate,
      keywords,
      requiresAcknowledgment,
      createdBy,
    } = body;

    if (!code || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: code, title, content' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 Policy와 첫 버전 생성
    const policy = await prisma.$transaction(async (tx: any) => {
      const newPolicy = await tx.policy.create({
        data: {
          code,
          title,
          categoryId: categoryId || null,
          currentVersion: 1,
          status: 'DRAFT',
          effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
          keywords: keywords || [],
          requiresAcknowledgment: requiresAcknowledgment || false,
          createdBy: createdBy || 'admin',
        },
      });

      await tx.policyVersion.create({
        data: {
          policyId: newPolicy.id,
          versionNumber: 1,
          content,
          summary: '최초 작성',
          effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
          createdBy: createdBy || 'admin',
        },
      });

      return newPolicy;
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error('Error creating policy:', error);
    return NextResponse.json(
      { error: 'Failed to create policy' },
      { status: 500 }
    );
  }
}
