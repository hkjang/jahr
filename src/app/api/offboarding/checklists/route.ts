import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List offboarding checklists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;

    const checklists = await prisma.offboardingChecklist.findMany({
      where,
      include: {
        tasks: {
          orderBy: { sortOrder: 'asc' }
        },
        knowledgeTransfers: {
          select: {
            id: true,
            title: true,
            status: true,
            recipientId: true
          }
        },
        exitInterview: {
          select: {
            id: true,
            scheduledDate: true,
            conductedDate: true
          }
        }
      },
      orderBy: { lastWorkingDate: 'asc' }
    });

    return NextResponse.json(checklists);
  } catch (error) {
    console.error('Failed to fetch offboarding checklists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offboarding checklists' },
      { status: 500 }
    );
  }
}

// POST - Create offboarding checklist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, lastWorkingDate, reason } = body;

    if (!employeeId || !lastWorkingDate) {
      return NextResponse.json(
        { error: 'Employee ID and last working date are required' },
        { status: 400 }
      );
    }

    // Check if checklist already exists
    const existing = await prisma.offboardingChecklist.findUnique({
      where: { employeeId }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Offboarding checklist already exists for this employee' },
        { status: 400 }
      );
    }

    const lastDate = new Date(lastWorkingDate);

    // Create standard offboarding tasks
    const standardTasks = [
      { category: 'EQUIPMENT_RETURN', name: '장비 반납', description: '노트북, 휴대폰 등 회사 장비 반납', daysBeforeEnd: 3 },
      { category: 'ACCESS_REVOKE', name: '계정 접근 권한 해제', description: '시스템 접근 권한 및 계정 비활성화', daysBeforeEnd: 0 },
      { category: 'ACCESS_REVOKE', name: '보안 카드 반납', description: '출입 카드 및 보안 장치 반납', daysBeforeEnd: 0 },
      { category: 'HANDOVER', name: '업무 인수인계', description: '담당 업무 및 프로젝트 인수인계', daysBeforeEnd: 7 },
      { category: 'DOCUMENTATION', name: '인수인계 문서 작성', description: '업무 매뉴얼 및 인수인계 문서 작성', daysBeforeEnd: 5 },
      { category: 'HANDOVER', name: '팀 미팅', description: '팀원들과 마지막 미팅 진행', daysBeforeEnd: 1 },
    ];

    const checklist = await prisma.offboardingChecklist.create({
      data: {
        employeeId,
        status: 'NOT_STARTED',
        lastWorkingDate: lastDate,
        reason,
        tasks: {
          create: standardTasks.map((task, index) => ({
            category: task.category,
            name: task.name,
            description: task.description,
            dueDate: new Date(lastDate.getTime() - task.daysBeforeEnd * 24 * 60 * 60 * 1000),
            status: 'NOT_STARTED',
            sortOrder: index
          }))
        }
      },
      include: {
        tasks: true
      }
    });

    return NextResponse.json(checklist, { status: 201 });
  } catch (error) {
    console.error('Failed to create offboarding checklist:', error);
    return NextResponse.json(
      { error: 'Failed to create offboarding checklist' },
      { status: 500 }
    );
  }
}
