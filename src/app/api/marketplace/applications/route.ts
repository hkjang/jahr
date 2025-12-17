import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunityId');
    const applicantId = searchParams.get('applicantId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (opportunityId) where.opportunityId = opportunityId;
    if (applicantId) where.applicantId = applicantId;
    if (status) where.status = status;

    const applications = await prisma.internalApplication.findMany({
      where,
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            type: true,
            organizationId: true,
            status: true
          }
        },
        interviews: true
      },
      orderBy: { appliedAt: 'desc' }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST - Submit application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunityId, applicantId, coverLetter } = body;

    if (!opportunityId || !applicantId) {
      return NextResponse.json(
        { error: 'Opportunity ID and applicant ID are required' },
        { status: 400 }
      );
    }

    // Check if already applied
    const existing = await prisma.internalApplication.findUnique({
      where: {
        opportunityId_applicantId: { opportunityId, applicantId }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already applied to this opportunity' },
        { status: 400 }
      );
    }

    // Check if opportunity is open
    const opportunity = await prisma.internalOpportunity.findUnique({
      where: { id: opportunityId }
    });

    if (!opportunity || opportunity.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Opportunity is not open for applications' },
        { status: 400 }
      );
    }

    // Calculate skill match if employee has skills
    let matchScore = null;
    let skillMatch = null;

    const applicantSkills = await prisma.employeeSkill.findMany({
      where: { employeeId: applicantId },
      include: { skill: true }
    });

    if (applicantSkills.length > 0 && opportunity.requiredSkills) {
      const requiredSkills = opportunity.requiredSkills as Array<{ skillId: string; level: string }>;
      const levelToNumber: Record<string, number> = {
        'NOVICE': 1, 'BEGINNER': 2, 'INTERMEDIATE': 3, 'ADVANCED': 4, 'EXPERT': 5
      };

      let totalScore = 0;
      let maxScore = 0;
      const matchDetails: Array<{ skillId: string; required: string; current: string | null; met: boolean }> = [];

      for (const req of requiredSkills) {
        const empSkill = applicantSkills.find(s => s.skillId === req.skillId);
        const reqLevel = levelToNumber[req.level] || 0;
        const curLevel = empSkill ? (levelToNumber[empSkill.currentLevel] || 0) : 0;

        const skillScore = reqLevel > 0 ? Math.min(curLevel / reqLevel, 1) * 100 : 0;
        totalScore += skillScore;
        maxScore += 100;

        matchDetails.push({
          skillId: req.skillId,
          required: req.level,
          current: empSkill?.currentLevel || null,
          met: curLevel >= reqLevel
        });
      }

      matchScore = maxScore > 0 ? Math.round(totalScore / maxScore * 100) : 0;
      skillMatch = matchDetails;
    }

    const application = await prisma.internalApplication.create({
      data: {
        opportunityId,
        applicantId,
        coverLetter,
        status: 'APPLIED',
        matchScore,
        skillMatch: skillMatch ? JSON.parse(JSON.stringify(skillMatch)) : undefined
      },
      include: {
        opportunity: {
          select: { id: true, title: true, type: true }
        }
      }
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Failed to create application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
