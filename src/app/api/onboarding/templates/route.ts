import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List onboarding templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const orgId = searchParams.get('orgId');

    const where: Record<string, unknown> = {};
    if (jobId) where.targetJobId = jobId;
    if (orgId) where.targetOrgId = orgId;

    const templates = await prisma.onboardingTemplate.findMany({
      where,
      include: {
        tasks: {
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: { checklists: true }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to fetch onboarding templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding templates' },
      { status: 500 }
    );
  }
}

// POST - Create new onboarding template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, targetJobId, targetOrgId, isDefault, tasks } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    const template = await prisma.onboardingTemplate.create({
      data: {
        name,
        description,
        targetJobId,
        targetOrgId,
        isDefault: isDefault || false,
        tasks: tasks ? {
          create: tasks.map((task: {
            category: string;
            name: string;
            description?: string;
            daysFromStart: number;
            assigneeRole?: string;
            isRequired?: boolean;
            sortOrder?: number;
          }, index: number) => ({
            category: task.category,
            name: task.name,
            description: task.description,
            daysFromStart: task.daysFromStart,
            assigneeRole: task.assigneeRole,
            isRequired: task.isRequired ?? true,
            sortOrder: task.sortOrder ?? index
          }))
        } : undefined
      },
      include: {
        tasks: true
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Failed to create onboarding template:', error);
    return NextResponse.json(
      { error: 'Failed to create onboarding template' },
      { status: 500 }
    );
  }
}
