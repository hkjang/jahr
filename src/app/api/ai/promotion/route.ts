import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Generate promotion recommendation for an employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, targetPositionId } = body;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Get employee data
    const employee = await prisma.employee.findFirst({
      where: { userId: employeeId },
      include: {
        user: true,
        position: true,
        job: true,
        organization: true
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Calculate tenure in months
    const tenureMonths = Math.floor(
      (new Date().getTime() - employee.hireDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
    );

    // Get recent performance evaluations
    const evaluations = await prisma.evaluation.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    // Calculate average performance score
    const performanceScore = evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + Number(e.finalScore || 0), 0) / evaluations.length
      : 50;

    // Get skill readiness (based on employee skills)
    const employeeSkills = await prisma.employeeSkill.findMany({
      where: { employeeId }
    });

    const skillLevelToNum: Record<string, number> = {
      'NOVICE': 1, 'BEGINNER': 2, 'INTERMEDIATE': 3, 'ADVANCED': 4, 'EXPERT': 5
    };
    
    const avgSkillLevel = employeeSkills.length > 0
      ? employeeSkills.reduce((sum, s) => sum + (skillLevelToNum[s.currentLevel] || 0), 0) / employeeSkills.length
      : 2;
    
    const skillReadiness = (avgSkillLevel / 5) * 100;

    // Calculate leadership score (simplified - based on position level and tenure)
    const leadershipScore = Math.min(100, 
      (employee.position?.level || 1) * 15 + 
      Math.min(tenureMonths / 2, 30)
    );

    // Calculate overall confidence score
    const confidenceScore = (
      performanceScore * 0.35 +
      skillReadiness * 0.25 +
      leadershipScore * 0.2 +
      Math.min(tenureMonths, 36) * 1.5 // Cap tenure contribution
    );

    // Determine recommendation
    let recommendation: string;
    if (confidenceScore >= 75) {
      recommendation = 'STRONG_RECOMMEND';
    } else if (confidenceScore >= 60) {
      recommendation = 'RECOMMEND';
    } else if (confidenceScore >= 45) {
      recommendation = 'HOLD';
    } else {
      recommendation = 'NOT_READY';
    }

    // Generate explanation
    const factors: string[] = [];
    if (performanceScore >= 70) factors.push('우수한 성과 평가 기록');
    if (tenureMonths >= 24) factors.push('충분한 경력 (2년 이상)');
    if (skillReadiness >= 70) factors.push('역량 요건 충족');
    if (leadershipScore >= 60) factors.push('리더십 역량 보유');

    const explanation = factors.length > 0
      ? `승진 추천 근거: ${factors.join(', ')}. 종합 점수 ${confidenceScore.toFixed(1)}점.`
      : `승진 보류 권고: 추가적인 경력 개발 및 성과 향상이 필요합니다.`;

    // Save recommendation
    const promotionRec = await prisma.promotionRecommendation.create({
      data: {
        employeeId,
        currentPositionId: employee.positionId || '',
        recommendedPositionId: targetPositionId || employee.positionId || '',
        confidenceScore,
        factorAnalysis: JSON.parse(JSON.stringify({
          performance: performanceScore,
          tenure: tenureMonths,
          skillReadiness,
          leadership: leadershipScore
        })),
        performanceScore,
        tenureMonths,
        skillReadiness,
        leadershipScore,
        recommendation,
        explanation,
        status: 'PENDING'
      }
    });

    // Create AI explanation record
    await prisma.aIDecisionExplanation.create({
      data: {
        decisionType: 'PROMOTION',
        relatedEntityId: promotionRec.id,
        modelVersion: 'v1.0-rule-based',
        inputFeatures: JSON.parse(JSON.stringify({
          tenureMonths,
          evaluationCount: evaluations.length,
          skillCount: employeeSkills.length,
          positionLevel: employee.position?.level
        })),
        featureImportance: JSON.parse(JSON.stringify({
          performanceScore: 0.35,
          skillReadiness: 0.25,
          leadershipScore: 0.20,
          tenure: 0.20
        })),
        decisionPath: JSON.parse(JSON.stringify({
          step1: 'Calculate performance from evaluations',
          step2: 'Assess skill readiness from skill levels',
          step3: 'Evaluate leadership based on position and tenure',
          step4: 'Compute weighted confidence score',
          step5: 'Map score to recommendation category'
        })),
        confidenceBreakdown: JSON.parse(JSON.stringify({
          total: confidenceScore,
          components: { performanceScore, skillReadiness, leadershipScore, tenureContribution: Math.min(tenureMonths, 36) * 1.5 }
        })),
        humanReadable: explanation
      }
    });

    return NextResponse.json({
      ...promotionRec,
      employee: {
        name: employee.user?.name,
        position: employee.position?.name,
        organization: employee.organization?.name
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to generate promotion recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to generate promotion recommendation' },
      { status: 500 }
    );
  }
}

// GET - List promotion recommendations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const recommendation = searchParams.get('recommendation');

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (recommendation) where.recommendation = recommendation;

    const recommendations = await prisma.promotionRecommendation.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      take: 50
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
