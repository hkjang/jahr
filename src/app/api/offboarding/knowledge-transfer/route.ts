import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List knowledge transfer documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checklistId = searchParams.get('checklistId');
    const recipientId = searchParams.get('recipientId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (checklistId) where.checklistId = checklistId;
    if (recipientId) where.recipientId = recipientId;
    if (status) where.status = status;

    const transfers = await prisma.knowledgeTransfer.findMany({
      where,
      include: {
        checklist: {
          select: { 
            employeeId: true, 
            lastWorkingDate: true 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error('Failed to fetch knowledge transfers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge transfers' },
      { status: 500 }
    );
  }
}

// POST - Create knowledge transfer document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checklistId, title, description, content, recipientId, attachments } = body;

    if (!checklistId || !title || !content || !recipientId) {
      return NextResponse.json(
        { error: 'Checklist ID, title, content, and recipient ID are required' },
        { status: 400 }
      );
    }

    const transfer = await prisma.knowledgeTransfer.create({
      data: {
        checklistId,
        title,
        description,
        content,
        recipientId,
        status: 'DRAFT',
        attachments: attachments || null
      }
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error('Failed to create knowledge transfer:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge transfer' },
      { status: 500 }
    );
  }
}
