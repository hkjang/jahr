import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List skill taxonomy (hierarchical)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const parentId = searchParams.get('parentId');
    const flat = searchParams.get('flat') === 'true';

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    if (parentId) where.parentId = parentId;
    else if (!flat) where.parentId = null; // Top level only

    const skills = await prisma.skillTaxonomy.findMany({
      where,
      include: flat ? undefined : {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true }
            }
          }
        },
        _count: {
          select: {
            employeeSkills: true,
            jobRequirements: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error('Failed to fetch skill taxonomy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill taxonomy' },
      { status: 500 }
    );
  }
}

// POST - Create new skill in taxonomy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, nameEn, category, description, parentId, keywords } = body;

    if (!code || !name || !category) {
      return NextResponse.json(
        { error: 'Code, name, and category are required' },
        { status: 400 }
      );
    }

    // Check for duplicate code
    const existing = await prisma.skillTaxonomy.findUnique({
      where: { code }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Skill code already exists' },
        { status: 400 }
      );
    }

    const skill = await prisma.skillTaxonomy.create({
      data: {
        code,
        name,
        nameEn,
        category,
        description,
        parentId,
        keywords: keywords || [],
        isActive: true
      },
      include: {
        parent: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error('Failed to create skill:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}
