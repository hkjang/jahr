import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 정책 카테고리 목록
export async function GET() {
  try {
    const categories = await prisma.policyCategory.findMany({
      include: {
        _count: {
          select: { policies: true },
        },
        children: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        parentId: null, // 최상위 카테고리만
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST: 정책 카테고리 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, parentId, sortOrder } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.policyCategory.create({
      data: {
        name,
        description,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
