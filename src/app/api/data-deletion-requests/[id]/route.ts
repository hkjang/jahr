import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// PUT: 삭제 요청 처리
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, processedBy, deletedEntities } = body;

    const updateData: Prisma.DataDeletionRequestUpdateInput = {};

    if (status) {
      updateData.status = status;
      updateData.processedAt = new Date();
    }
    if (processedBy) updateData.processedBy = processedBy;
    if (deletedEntities) updateData.deletedEntities = deletedEntities as Prisma.InputJsonValue;

    const deletionRequest = await prisma.dataDeletionRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(deletionRequest);
  } catch (error) {
    console.error('Error updating deletion request:', error);
    return NextResponse.json(
      { error: 'Failed to update deletion request' },
      { status: 500 }
    );
  }
}

// DELETE: 삭제 요청 취소
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.dataDeletionRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}
