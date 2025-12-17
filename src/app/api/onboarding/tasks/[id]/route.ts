import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get specific onboarding task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const task = await prisma.onboardingTask.findUnique({
      where: { id },
      include: {
        checklist: {
          select: { id: true, employeeId: true, status: true }
        }
      }
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to fetch onboarding task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding task' },
      { status: 500 }
    );
  }
}

// PUT - Update onboarding task (mark complete, add notes, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, completedBy, assigneeId, assigneeName } = body;

    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
        if (completedBy) updateData.completedBy = completedBy;
      }
    }
    if (notes !== undefined) updateData.notes = notes;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (assigneeName !== undefined) updateData.assigneeName = assigneeName;

    const task = await prisma.onboardingTask.update({
      where: { id },
      data: updateData,
      include: {
        checklist: {
          select: { id: true, employeeId: true }
        }
      }
    });

    // Check if all tasks are completed, update checklist status
    const allTasks = await prisma.onboardingTask.findMany({
      where: { checklistId: task.checklistId }
    });

    const allCompleted = allTasks.every(t => t.status === 'COMPLETED');
    const anyInProgress = allTasks.some(t => t.status === 'IN_PROGRESS');

    if (allCompleted) {
      await prisma.onboardingChecklist.update({
        where: { id: task.checklistId },
        data: { status: 'COMPLETED', completedDate: new Date() }
      });
    } else if (anyInProgress || allTasks.some(t => t.status === 'COMPLETED')) {
      await prisma.onboardingChecklist.update({
        where: { id: task.checklistId },
        data: { status: 'IN_PROGRESS' }
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to update onboarding task:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding task' },
      { status: 500 }
    );
  }
}
