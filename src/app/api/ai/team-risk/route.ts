import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Analyze team risks for an organization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const risks: Array<{
      riskType: string;
      riskLevel: string;
      riskScore: number;
      affectedEmployees: string[];
      indicators: Record<string, unknown>;
      suggestedActions: string[];
      explanation: string;
    }> = [];

    // Get all employees in the organization
    const employees = await prisma.employee.findMany({
      where: { organizationId },
      include: {
        position: true
      }
    });

    const employeeIds = employees.map(e => e.userId);

    // 1. Check for attrition cluster
    const attritionSignals = await prisma.attritionSignal.findMany({
      where: {
        employeeId: { in: employeeIds },
        isAcknowledged: false,
        signalStrength: { gte: 50 }
      }
    });

    const employeesWithSignals = [...new Set(attritionSignals.map(s => s.employeeId))];
    const attritionRate = employeesWithSignals.length / employees.length;

    if (attritionRate >= 0.2) {
      risks.push({
        riskType: 'ATTRITION_CLUSTER',
        riskLevel: attritionRate >= 0.4 ? 'CRITICAL' : attritionRate >= 0.3 ? 'HIGH' : 'MEDIUM',
        riskScore: Math.min(100, attritionRate * 200),
        affectedEmployees: employeesWithSignals,
        indicators: {
          employeesAtRisk: employeesWithSignals.length,
          totalEmployees: employees.length,
          attritionRate: (attritionRate * 100).toFixed(1) + '%'
        },
        suggestedActions: [
          '1:1 면담을 통한 불만 요인 파악',
          '보상 및 복지 개선 검토',
          '경력 개발 기회 제공'
        ],
        explanation: `조직 내 ${employeesWithSignals.length}명(${(attritionRate * 100).toFixed(0)}%)의 직원에게서 이탈 신호가 감지되었습니다. 집단 이탈 위험이 있어 즉각적인 조치가 필요합니다.`
      });
    }

    // 2. Check for overwork pattern
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const overtimeData = await prisma.overtime.groupBy({
      by: ['employeeId'],
      where: {
        employeeId: { in: employeeIds },
        date: { gte: thirtyDaysAgo },
        status: 'APPROVED'
      },
      _sum: { hours: true }
    });

    const overworkedEmployees = overtimeData.filter(o => (o._sum.hours || 0) > 40);
    const overworkRate = overworkedEmployees.length / employees.length;

    if (overworkRate >= 0.3) {
      risks.push({
        riskType: 'OVERWORK',
        riskLevel: overworkRate >= 0.5 ? 'HIGH' : 'MEDIUM',
        riskScore: Math.min(100, overworkRate * 150),
        affectedEmployees: overworkedEmployees.map(o => o.employeeId),
        indicators: {
          overworkedCount: overworkedEmployees.length,
          totalEmployees: employees.length,
          avgOvertimeHours: overtimeData.reduce((s, o) => s + (o._sum.hours || 0), 0) / overtimeData.length
        },
        suggestedActions: [
          '업무 재분배 검토',
          '추가 인력 채용 고려',
          '업무 프로세스 효율화'
        ],
        explanation: `조직 내 ${overworkedEmployees.length}명(${(overworkRate * 100).toFixed(0)}%)이 월 40시간 이상 초과 근무를 하고 있습니다. 번아웃 위험이 높습니다.`
      });
    }

    // 3. Check for performance decline
    const evaluations = await prisma.evaluation.findMany({
      where: {
        employeeId: { in: employeeIds }
      },
      orderBy: { createdAt: 'desc' }
    });

    const recentEvals = evaluations.filter(e => {
      const monthsAgo = (new Date().getTime() - e.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000);
      return monthsAgo <= 6;
    });

    const lowPerformers = recentEvals.filter(e => (e.finalScore || 0) < 60);
    const lowPerformRate = recentEvals.length > 0 ? lowPerformers.length / recentEvals.length : 0;

    if (lowPerformRate >= 0.25) {
      const affectedEmps = [...new Set(lowPerformers.map(e => e.employeeId))];
      risks.push({
        riskType: 'PERFORMANCE_DECLINE',
        riskLevel: lowPerformRate >= 0.4 ? 'HIGH' : 'MEDIUM',
        riskScore: Math.min(100, lowPerformRate * 200),
        affectedEmployees: affectedEmps,
        indicators: {
          lowPerformerCount: affectedEmps.length,
          evaluationCount: recentEvals.length,
          lowPerformRate: (lowPerformRate * 100).toFixed(1) + '%'
        },
        suggestedActions: [
          '성과 개선 계획(PIP) 수립',
          '교육 및 코칭 프로그램 제공',
          '목표 설정 재검토'
        ],
        explanation: `최근 6개월 평가에서 ${(lowPerformRate * 100).toFixed(0)}%의 평가 결과가 미흡 수준입니다. 성과 관리 강화가 필요합니다.`
      });
    }

    // Save team risk indicators
    for (const risk of risks) {
      await prisma.teamRiskIndicator.create({
        data: {
          organizationId,
          riskType: risk.riskType,
          riskLevel: risk.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          riskScore: risk.riskScore,
          affectedEmployees: JSON.parse(JSON.stringify(risk.affectedEmployees)),
          indicators: JSON.parse(JSON.stringify(risk.indicators)),
          suggestedActions: JSON.parse(JSON.stringify(risk.suggestedActions)),
          explanation: risk.explanation
        }
      });
    }

    return NextResponse.json({
      organizationId,
      totalEmployees: employees.length,
      risksDetected: risks.length,
      risks
    });
  } catch (error) {
    console.error('Failed to analyze team risks:', error);
    return NextResponse.json(
      { error: 'Failed to analyze team risks' },
      { status: 500 }
    );
  }
}

// GET - List team risk indicators
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const riskType = searchParams.get('riskType');
    const riskLevel = searchParams.get('riskLevel');

    const where: Record<string, unknown> = {
      resolvedAt: null
    };
    if (organizationId) where.organizationId = organizationId;
    if (riskType) where.riskType = riskType;
    if (riskLevel) where.riskLevel = riskLevel;

    const risks = await prisma.teamRiskIndicator.findMany({
      where,
      orderBy: [
        { riskLevel: 'desc' },
        { detectedAt: 'desc' }
      ],
      take: 50
    });

    return NextResponse.json(risks);
  } catch (error) {
    console.error('Failed to fetch team risks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team risks' },
      { status: 500 }
    );
  }
}
