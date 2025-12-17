import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Submit skill assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeSkillId, assessmentType, assessedLevel, assessorId, evidence, notes } = body;

    if (!employeeSkillId || !assessmentType || !assessedLevel) {
      return NextResponse.json(
        { error: 'Employee skill ID, assessment type, and assessed level are required' },
        { status: 400 }
      );
    }

    // Get current skill level
    const employeeSkill = await prisma.employeeSkill.findUnique({
      where: { id: employeeSkillId }
    });

    if (!employeeSkill) {
      return NextResponse.json(
        { error: 'Employee skill not found' },
        { status: 404 }
      );
    }

    // Create assessment record
    const assessment = await prisma.skillAssessment.create({
      data: {
        employeeSkillId,
        assessmentType,
        previousLevel: employeeSkill.currentLevel,
        assessedLevel,
        assessorId,
        evidence,
        notes,
        assessedAt: new Date()
      }
    });

    // Update employee skill if assessment type is authoritative
    if (['MANAGER', 'CERTIFICATION'].includes(assessmentType)) {
      await prisma.employeeSkill.update({
        where: { id: employeeSkillId },
        data: {
          currentLevel: assessedLevel,
          lastAssessed: new Date()
        }
      });
    }

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error('Failed to create skill assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create skill assessment' },
      { status: 500 }
    );
  }
}

// GET - Get assessments for an employee skill
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeSkillId = searchParams.get('employeeSkillId');
    const employeeId = searchParams.get('employeeId');

    if (!employeeSkillId && !employeeId) {
      return NextResponse.json(
        { error: 'Employee skill ID or employee ID is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {};
    if (employeeSkillId) {
      where.employeeSkillId = employeeSkillId;
    } else if (employeeId) {
      where.employeeSkill = { employeeId };
    }

    const assessments = await prisma.skillAssessment.findMany({
      where,
      include: {
        employeeSkill: {
          include: {
            skill: { select: { id: true, name: true, category: true } }
          }
        }
      },
      orderBy: { assessedAt: 'desc' }
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Failed to fetch assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}
