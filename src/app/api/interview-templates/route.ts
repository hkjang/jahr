import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 면접 평가 템플릿 목록
export async function GET() {
  try {
    const templates = await prisma.interviewTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST: 면접 평가 템플릿 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, items } = body;

    if (!name || !items) {
      return NextResponse.json(
        { error: 'Missing required fields: name, items' },
        { status: 400 }
      );
    }

    const template = await prisma.interviewTemplate.create({
      data: {
        name,
        description,
        items,
        isActive: true,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
