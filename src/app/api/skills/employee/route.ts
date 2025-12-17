import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get employee skills
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const skillId = searchParams.get('skillId');
    const category = searchParams.get('category');
    const level = searchParams.get('level');

    if (!employeeId && !skillId) {
      return NextResponse.json(
        { error: 'Either employeeId or skillId is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (skillId) where.skillId = skillId;
    if (level) where.currentLevel = level;

    // Filter by skill category if provided
    const skillWhere: Record<string, unknown> = {};
    if (category) skillWhere.category = category;

    const skills = await prisma.employeeSkill.findMany({
      where: {
        ...where,
        skill: skillWhere
      },
      include: {
        skill: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            description: true
          }
        },
        assessments: {
          orderBy: { assessedAt: 'desc' },
          take: 5
        },
        endorsements: {
          orderBy: { endorsedAt: 'desc' },
          take: 10
        }
      },
      orderBy: [
        { currentLevel: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error('Failed to fetch employee skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee skills' },
      { status: 500 }
    );
  }
}

// POST - Add or update employee skill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, skillId, currentLevel, targetLevel, yearsExperience } = body;

    if (!employeeId || !skillId || !currentLevel) {
      return NextResponse.json(
        { error: 'Employee ID, skill ID, and current level are required' },
        { status: 400 }
      );
    }

    // Upsert employee skill
    const employeeSkill = await prisma.employeeSkill.upsert({
      where: {
        employeeId_skillId: { employeeId, skillId }
      },
      create: {
        employeeId,
        skillId,
        currentLevel,
        targetLevel,
        yearsExperience,
        lastAssessed: new Date()
      },
      update: {
        currentLevel,
        targetLevel,
        yearsExperience,
        lastAssessed: new Date()
      },
      include: {
        skill: {
          select: { id: true, name: true, category: true }
        }
      }
    });

    return NextResponse.json(employeeSkill, { status: 201 });
  } catch (error) {
    console.error('Failed to save employee skill:', error);
    return NextResponse.json(
      { error: 'Failed to save employee skill' },
      { status: 500 }
    );
  }
}
