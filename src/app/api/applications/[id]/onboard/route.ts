import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST: 채용 합격자 입사 처리 (Employee 자동 생성)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { hireDate, employeeId, password } = body;

    if (!hireDate || !employeeId) {
      return NextResponse.json(
        { error: 'Missing required fields: hireDate, employeeId' },
        { status: 400 }
      );
    }

    // 지원서 조회
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: true,
        posting: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.currentStage !== 'OFFER') {
      return NextResponse.json(
        { error: 'Application must be at OFFER stage to onboard' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 User 및 Employee 생성
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. User 생성
      const hashedPassword = await bcrypt.hash(password || 'temp1234!', 10);
      const user = await tx.user.create({
        data: {
          employeeId,
          email: application.applicant.email,
          password: hashedPassword,
          name: application.applicant.name,
          phoneNumber: application.applicant.phone,
          status: 'ACTIVE',
        },
      });

      // 2. Employee 생성
      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          organizationId: application.posting.organizationId,
          positionId: application.posting.positionId,
          hireDate: new Date(hireDate),
          employmentType: application.posting.employmentType,
        },
      });

      // 3. 지원서 상태 업데이트
      await tx.application.update({
        where: { id },
        data: {
          status: 'PASSED',
          currentStage: 'ONBOARDING',
        },
      });

      // 4. 단계 이력 추가
      await tx.applicationStageHistory.create({
        data: {
          applicationId: id,
          stage: 'ONBOARDING',
          result: 'PASSED',
          notes: `Employee ID: ${employeeId}`,
        },
      });

      return { user, employee };
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully onboarded',
      employee: result.employee,
    });
  } catch (error) {
    console.error('Error onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to onboard applicant' },
      { status: 500 }
    );
  }
}
