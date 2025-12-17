import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: 조직 개편 시뮬레이션 실행
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 시뮬레이션 상태를 RUNNING으로 변경
    const simulation = await prisma.orgRestructureSimulation.update({
      where: { id },
      data: { status: 'RUNNING' },
    });

    // 현재 구조와 제안 구조 분석
    const currentStructure = simulation.currentStructure as {
      departments?: Array<{ id: string; name: string; headcount: number }>;
    };
    const proposedStructure = simulation.proposedStructure as {
      departments?: Array<{ id: string; name: string; headcount: number }>;
    };

    // 영향 분석 수행
    const currentDepts = currentStructure.departments || [];
    const proposedDepts = proposedStructure.departments || [];
    
    const currentTotal = currentDepts.reduce((sum, d) => sum + (d.headcount || 0), 0);
    const proposedTotal = proposedDepts.reduce((sum, d) => sum + (d.headcount || 0), 0);
    
    const impactAnalysis = {
      currentDepartmentCount: currentDepts.length,
      proposedDepartmentCount: proposedDepts.length,
      departmentChange: proposedDepts.length - currentDepts.length,
      currentHeadcount: currentTotal,
      proposedHeadcount: proposedTotal,
      headcountChange: proposedTotal - currentTotal,
      affectedEmployees: Math.abs(proposedTotal - currentTotal),
      estimatedTransitionTime: Math.ceil(Math.abs(proposedTotal - currentTotal) / 10) + ' weeks',
      riskLevel: Math.abs(proposedTotal - currentTotal) > 50 ? 'HIGH' : 
                 Math.abs(proposedTotal - currentTotal) > 20 ? 'MEDIUM' : 'LOW',
    };
    
    // 분석 완료 및 결과 저장
    const updatedSimulation = await prisma.orgRestructureSimulation.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        impactAnalysis,
      },
    });

    return NextResponse.json({
      success: true,
      simulation: updatedSimulation,
      impactAnalysis,
    });
  } catch (error) {
    console.error('Error running simulation:', error);
    return NextResponse.json(
      { error: 'Failed to run simulation' },
      { status: 500 }
    );
  }
}
