import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: 외부 연동 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, config, isActive, syncStatus } = body;

    const integration = await prisma.externalIntegration.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(config && { config }),
        ...(isActive !== undefined && { isActive }),
        ...(syncStatus && { syncStatus }),
      },
    });

    return NextResponse.json(integration);
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 });
  }
}

// DELETE: 외부 연동 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.externalIntegration.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting integration:', error);
    return NextResponse.json({ error: 'Failed to delete integration' }, { status: 500 });
  }
}
