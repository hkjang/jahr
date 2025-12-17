import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: 시나리오 분석 실행
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 시나리오 상태를 ANALYZING으로 변경
    const scenario = await prisma.headcountScenario.update({
      where: { id },
      data: { status: 'ANALYZING' },
    });

    // 실제 분석 로직 (비동기 처리 시뮬레이션)
    const changes = scenario.changes as { additions?: number; reductions?: number; salaryAdjustment?: number };
    const additions = changes.additions || 0;
    const reductions = changes.reductions || 0;
    const avgSalary = 50000000; // 5천만원 평균 급여 가정
    
    // 비용 영향 계산
    const costImpact = (additions - reductions) * avgSalary;
    
    // 분석 완료 및 결과 저장
    const updatedScenario = await prisma.headcountScenario.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        costImpact,
      },
    });

    return NextResponse.json({
      success: true,
      scenario: updatedScenario,
      analysis: {
        netHeadcountChange: additions - reductions,
        annualCostImpact: costImpact,
        monthlyImpact: costImpact / 12,
      },
    });
  } catch (error) {
    console.error('Error analyzing scenario:', error);
    return NextResponse.json(
      { error: 'Failed to analyze scenario' },
      { status: 500 }
    );
  }
}
