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

// POST - Analyze skill gap for employee vs job requirements
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, jobId } = body;

    if (!employeeId || !jobId) {
      return NextResponse.json(
        { error: 'Employee ID and Job ID are required' },
        { status: 400 }
      );
    }

    // Get job required skills
    const jobRequirements = await prisma.jobRequiredSkill.findMany({
      where: { jobId },
      include: {
        skill: { select: { id: true, code: true, name: true, category: true } }
      }
    });

    if (jobRequirements.length === 0) {
      return NextResponse.json(
        { error: 'No skill requirements found for this job' },
        { status: 404 }
      );
    }

    // Get employee skills
    const employeeSkills = await prisma.employeeSkill.findMany({
      where: { employeeId },
      include: {
        skill: { select: { id: true, code: true, name: true, category: true } }
      }
    });

    // Create skill lookup map
    const employeeSkillMap = new Map(
      employeeSkills.map(es => [es.skillId, es])
    );

    // Calculate gaps for each required skill
    const skillGaps: Array<{
      skillId: string;
      skillName: string;
      skillCategory: string;
      requiredLevel: string;
      currentLevel: string | null;
      gap: number;
      importance: string;
      weight: number;
      recommendation: string | null;
    }> = [];

    let totalWeightedGap = 0;
    let totalWeight = 0;

    for (const req of jobRequirements) {
      const employeeSkill = employeeSkillMap.get(req.skillId);
      const requiredNum = levelToNumber[req.requiredLevel] || 0;
      const currentNum = employeeSkill ? (levelToNumber[employeeSkill.currentLevel] || 0) : 0;
      const gap = Math.max(0, requiredNum - currentNum);

      const recommendation = gap > 0 ? getRecommendation(req.skill.name, gap) : null;

      skillGaps.push({
        skillId: req.skillId,
        skillName: req.skill.name,
        skillCategory: req.skill.category,
        requiredLevel: req.requiredLevel,
        currentLevel: employeeSkill?.currentLevel || null,
        gap,
        importance: req.importance,
        weight: req.weight,
        recommendation
      });

      totalWeightedGap += gap * req.weight;
      totalWeight += req.weight;
    }

    // Calculate overall gap score (0-100, lower is better)
    const overallGapScore = totalWeight > 0 
      ? Math.min(100, (totalWeightedGap / totalWeight) * 25) 
      : 0;

    // Generate priority and recommendations
    const priority = overallGapScore > 50 ? 'HIGH' : overallGapScore > 25 ? 'MEDIUM' : 'LOW';

    const recommendations = skillGaps
      .filter(sg => sg.gap > 0)
      .sort((a, b) => (b.gap * b.weight) - (a.gap * a.weight))
      .slice(0, 5)
      .map(sg => ({
        skill: sg.skillName,
        action: sg.recommendation
      }));

    // Save analysis result
    const analysis = await prisma.skillGapAnalysis.create({
      data: {
        employeeId,
        jobId,
        overallGapScore,
        skillGaps: JSON.parse(JSON.stringify(skillGaps)),
        recommendations: JSON.parse(JSON.stringify(recommendations)),
        priority
      }
    });

    return NextResponse.json({
      ...analysis,
      skillGaps,
      summary: {
        totalSkillsRequired: jobRequirements.length,
        skillsWithGap: skillGaps.filter(sg => sg.gap > 0).length,
        averageGap: totalWeight > 0 ? (totalWeightedGap / totalWeight).toFixed(2) : 0
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to analyze skill gap:', error);
    return NextResponse.json(
      { error: 'Failed to analyze skill gap' },
      { status: 500 }
    );
  }
}

// GET - Get skill gap analyses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const jobId = searchParams.get('jobId');

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (jobId) where.jobId = jobId;

    const analyses = await prisma.skillGapAnalysis.findMany({
      where,
      orderBy: { analysisDate: 'desc' },
      take: 20
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error('Failed to fetch skill gap analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill gap analyses' },
      { status: 500 }
    );
  }
}

function getRecommendation(skillName: string, gap: number): string {
  if (gap >= 3) {
    return `${skillName}에 대한 체계적인 교육 프로그램 수강 및 실무 프로젝트 참여 권장`;
  } else if (gap >= 2) {
    return `${skillName} 관련 심화 과정 수강 또는 멘토링 권장`;
  } else {
    return `${skillName} 스킬 향상을 위한 자기 학습 또는 단기 워크샵 참여 권장`;
  }
}
