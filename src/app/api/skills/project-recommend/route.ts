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

// POST - Get staffing recommendations for a project based on skills
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, requiredSkills } = body;

    if (!projectId || !requiredSkills || !Array.isArray(requiredSkills)) {
      return NextResponse.json(
        { error: 'Project ID and required skills array are required' },
        { status: 400 }
      );
    }

    // Save project skill requirements
    for (const skill of requiredSkills) {
      await prisma.projectRequiredSkill.upsert({
        where: {
          projectId_skillId: { projectId, skillId: skill.skillId }
        },
        create: {
          projectId,
          skillId: skill.skillId,
          requiredLevel: skill.requiredLevel,
          headcount: skill.headcount || 1
        },
        update: {
          requiredLevel: skill.requiredLevel,
          headcount: skill.headcount || 1
        }
      });
    }

    // Get all employees with relevant skills
    const employeesWithSkills = await prisma.employeeSkill.findMany({
      where: {
        skillId: { in: requiredSkills.map((s: { skillId: string }) => s.skillId) }
      },
      include: {
        skill: { select: { id: true, name: true, category: true } }
      }
    });

    // Group skills by employee
    const employeeSkillsMap = new Map<string, typeof employeesWithSkills>();
    for (const es of employeesWithSkills) {
      const current = employeeSkillsMap.get(es.employeeId) || [];
      current.push(es);
      employeeSkillsMap.set(es.employeeId, current);
    }

    // Score each employee
    const recommendations: Array<{
      employeeId: string;
      matchScore: number;
      matchDetails: Array<{
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
      const matchDetails: Array<{
        skillId: string;
        skillName: string;
        required: string;
        current: string;
        met: boolean;
      }> = [];

      for (const req of requiredSkills) {
        const employeeSkill = skills.find(s => s.skillId === req.skillId);
        const requiredNum = levelToNumber[req.requiredLevel] || 0;
        const currentNum = employeeSkill ? (levelToNumber[employeeSkill.currentLevel] || 0) : 0;
        
        const skillScore = Math.min(currentNum / requiredNum, 1) * 100;
        totalScore += skillScore;
        maxScore += 100;

        matchDetails.push({
          skillId: req.skillId,
          skillName: employeeSkill?.skill.name || 'Unknown',
          required: req.requiredLevel,
          current: employeeSkill?.currentLevel || 'NONE',
          met: currentNum >= requiredNum
        });
      }

      const matchScore = maxScore > 0 ? Math.round(totalScore / maxScore * 100) : 0;
      
      if (matchScore > 0) {
        recommendations.push({ employeeId, matchScore, matchDetails });
      }
    }

    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Save top recommendations (create new, delete old first)
    await prisma.staffingRecommendation.deleteMany({
      where: { projectId }
    });

    for (const rec of recommendations.slice(0, 20)) {
      await prisma.staffingRecommendation.create({
        data: {
          projectId,
          employeeId: rec.employeeId,
          matchScore: rec.matchScore,
          matchDetails: JSON.parse(JSON.stringify(rec.matchDetails)),
          status: 'RECOMMENDED'
        }
      });
    }

    return NextResponse.json({
      projectId,
      totalCandidates: recommendations.length,
      recommendations: recommendations.slice(0, 10)
    });
  } catch (error) {
    console.error('Failed to get staffing recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get staffing recommendations' },
      { status: 500 }
    );
  }
}

// GET - Get existing recommendations for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const employeeId = searchParams.get('employeeId');

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (employeeId) where.employeeId = employeeId;

    const recommendations = await prisma.staffingRecommendation.findMany({
      where,
      orderBy: { matchScore: 'desc' },
      take: 20
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
