import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 법규 업데이트 목록
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewed = searchParams.get('reviewed');
    const category = searchParams.get('category');

    const where: {
      isReviewed?: boolean;
      category?: string;
    } = {};
    
    if (reviewed !== null) where.isReviewed = reviewed === 'true';
    if (category) where.category = category;

    const updates = await prisma.legalUpdate.findMany({
      where,
      orderBy: { effectiveDate: 'desc' },
    });

    return NextResponse.json(updates);
  } catch (error) {
    console.error('Error fetching legal updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch legal updates' },
      { status: 500 }
    );
  }
}

// POST: 법규 업데이트 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, effectiveDate, category, sourceUrl } = body;

    if (!title || !description || !effectiveDate || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const update = await prisma.legalUpdate.create({
      data: {
        title,
        description,
        effectiveDate: new Date(effectiveDate),
        category,
        sourceUrl,
      },
    });

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    console.error('Error creating legal update:', error);
    return NextResponse.json(
      { error: 'Failed to create legal update' },
      { status: 500 }
    );
  }
}
