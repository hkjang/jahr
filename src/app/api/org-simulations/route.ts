import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 조직 개편 시뮬레이션 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: { status?: 'DRAFT' | 'RUNNING' | 'COMPLETED' } = {};
    if (status) where.status = status as 'DRAFT' | 'RUNNING' | 'COMPLETED';

    const simulations = await prisma.orgRestructureSimulation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(simulations);
  } catch (error) {
    console.error('Error fetching org simulations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch org simulations' },
      { status: 500 }
    );
  }
}

// POST: 조직 개편 시뮬레이션 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, currentStructure, proposedStructure, createdBy } = body;

    if (!name || !currentStructure || !proposedStructure) {
      return NextResponse.json(
        { error: 'Missing required fields: name, currentStructure, proposedStructure' },
        { status: 400 }
      );
    }

    const simulation = await prisma.orgRestructureSimulation.create({
      data: {
        name,
        description,
        currentStructure,
        proposedStructure,
        createdBy: createdBy || 'system',
        status: 'DRAFT',
      },
    });

    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    console.error('Error creating org simulation:', error);
    return NextResponse.json(
      { error: 'Failed to create org simulation' },
      { status: 500 }
    );
  }
}
