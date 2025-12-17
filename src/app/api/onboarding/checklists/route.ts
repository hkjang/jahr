import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List onboarding checklists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;

    const checklists = await prisma.onboardingChecklist.findMany({
      where,
      include: {
        template: {
          select: { id: true, name: true }
        },
        tasks: {
          orderBy: { sortOrder: 'asc' }
        },
        mentorAssignment: {
          select: {
            id: true,
            mentorId: true,
            matchScore: true,
            status: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return NextResponse.json(checklists);
  } catch (error) {
    console.error('Failed to fetch onboarding checklists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding checklists' },
      { status: 500 }
    );
  }
}

// POST - Create onboarding checklist for new hire (auto-generate from template)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, templateId, startDate } = body;

    if (!employeeId || !startDate) {
      return NextResponse.json(
        { error: 'Employee ID and start date are required' },
        { status: 400 }
      );
    }

    // Check if checklist already exists
    const existing = await prisma.onboardingChecklist.findUnique({
      where: { employeeId }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Onboarding checklist already exists for this employee' },
        { status: 400 }
      );
    }

    // Get template (use specified or default)
    let template = null;
    if (templateId) {
      template = await prisma.onboardingTemplate.findUnique({
        where: { id: templateId },
        include: { tasks: { orderBy: { sortOrder: 'asc' } } }
      });
    } else {
      template = await prisma.onboardingTemplate.findFirst({
        where: { isDefault: true },
        include: { tasks: { orderBy: { sortOrder: 'asc' } } }
      });
    }

    const startDateObj = new Date(startDate);

    // Create checklist with tasks
    const checklist = await prisma.onboardingChecklist.create({
      data: {
        employeeId,
        templateId: template?.id,
        status: 'NOT_STARTED',
        startDate: startDateObj,
        targetEndDate: template?.tasks.length 
          ? new Date(startDateObj.getTime() + Math.max(...template.tasks.map(t => t.daysFromStart)) * 24 * 60 * 60 * 1000)
          : new Date(startDateObj.getTime() + 30 * 24 * 60 * 60 * 1000),
        tasks: template?.tasks ? {
          create: template.tasks.map((task, index) => ({
            category: task.category,
            name: task.name,
            description: task.description,
            dueDate: new Date(startDateObj.getTime() + task.daysFromStart * 24 * 60 * 60 * 1000),
            assigneeName: task.assigneeRole,
            status: 'NOT_STARTED',
            sortOrder: index
          }))
        } : undefined
      },
      include: {
        tasks: true,
        template: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(checklist, { status: 201 });
  } catch (error) {
    console.error('Failed to create onboarding checklist:', error);
    return NextResponse.json(
      { error: 'Failed to create onboarding checklist' },
      { status: 500 }
    );
  }
}
