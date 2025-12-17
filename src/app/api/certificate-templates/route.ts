import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 증명서 템플릿 목록
export async function GET() {
  try {
    const templates = await prisma.certificateTemplate.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { issuances: true },
        },
      },
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

// POST: 증명서 템플릿 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, content, variables } = body;

    if (!name || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, content' },
        { status: 400 }
      );
    }

    const template = await prisma.certificateTemplate.create({
      data: {
        name,
        type,
        content,
        variables: variables || {},
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
