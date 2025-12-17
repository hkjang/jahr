import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Skill level to numeric value mapping
const levelToNumber: Record<string, number> = {
  'NOVICE': 1,
  'BEGINNER': 2,
  'INTERMEDIATE': 3,
  'ADVANCED': 4,
  'EXPERT': 5
};

// POST - Find matching candidates for an opportunity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunityId } = body;

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      );
    }

    // Get opportunity with required skills
    const opportunity = await prisma.internalOpportunity.findUnique({
      where: { id: opportunityId }
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    const requiredSkills = (opportunity.requiredSkills || []) as Array<{ skillId: string; level: string }>;

    if (requiredSkills.length === 0) {
      return NextResponse.json({
        opportunityId,
        message: 'No required skills defined for this opportunity',
        matches: []
      });
    }

    // Get all employees with any of the required skills
    const skillIds = requiredSkills.map(s => s.skillId);
    const employeesWithSkills = await prisma.employeeSkill.findMany({
      where: {
        skillId: { in: skillIds }
      },
      include: {
        skill: { select: { id: true, name: true } }
      }
    });

    // Group by employee
    const employeeSkillsMap = new Map<string, typeof employeesWithSkills>();
    for (const es of employeesWithSkills) {
      const current = employeeSkillsMap.get(es.employeeId) || [];
      current.push(es);
      employeeSkillsMap.set(es.employeeId, current);
    }

    // Score each employee
    const matches: Array<{
      employeeId: string;
      matchScore: number;
      matchBreakdown: Array<{
        skillId: string;
        skillName: string;
        required: string;
        current: string;
        met: boolean;
      }>;
    }> = [];

    for (const [employeeId, skills] of employeeSkillsMap) {
      let totalScore = 0;
      let maxScore = 0;
      const matchBreakdown: Array<{
        skillId: string;
        skillName: string;
        required: string;
        current: string;
        met: boolean;
      }> = [];

      for (const req of requiredSkills) {
        const employeeSkill = skills.find(s => s.skillId === req.skillId);
        const requiredNum = levelToNumber[req.level] || 0;
        const currentNum = employeeSkill ? (levelToNumber[employeeSkill.currentLevel] || 0) : 0;

        const skillScore = requiredNum > 0 ? Math.min(currentNum / requiredNum, 1) * 100 : 0;
        totalScore += skillScore;
        maxScore += 100;

        matchBreakdown.push({
          skillId: req.skillId,
          skillName: employeeSkill?.skill.name || 'Unknown',
          required: req.level,
          current: employeeSkill?.currentLevel || 'NONE',
          met: currentNum >= requiredNum
        });
      }

      const matchScore = maxScore > 0 ? Math.round(totalScore / maxScore * 100) : 0;

      if (matchScore >= 50) { // Only include if at least 50% match
        matches.push({ employeeId, matchScore, matchBreakdown });
      }
    }

    // Sort by score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Save matches to database
    await prisma.opportunityMatch.deleteMany({
      where: { opportunityId }
    });

    for (const match of matches.slice(0, 50)) {
      await prisma.opportunityMatch.create({
        data: {
          opportunityId,
          employeeId: match.employeeId,
          matchScore: match.matchScore,
          matchBreakdown: JSON.parse(JSON.stringify(match.matchBreakdown)),
          isNotified: false
        }
      });
    }

    return NextResponse.json({
      opportunityId,
      totalMatches: matches.length,
      topMatches: matches.slice(0, 20)
    });
  } catch (error) {
    console.error('Failed to find matches:', error);
    return NextResponse.json(
      { error: 'Failed to find matches' },
      { status: 500 }
    );
  }
}

// GET - Get existing matches for an opportunity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunityId');
    const employeeId = searchParams.get('employeeId');

    const where: Record<string, unknown> = {};
    if (opportunityId) where.opportunityId = opportunityId;
    if (employeeId) where.employeeId = employeeId;

    const matches = await prisma.opportunityMatch.findMany({
      where,
      include: {
        opportunity: {
          select: { id: true, title: true, type: true, status: true }
        }
      },
      orderBy: { matchScore: 'desc' },
      take: 50
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Failed to fetch matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
