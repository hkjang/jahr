import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List HR decision logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const decisionType = searchParams.get('decisionType');
    const decisionMaker = searchParams.get('decisionMaker');
    const relatedEntityType = searchParams.get('relatedEntityType');
    const relatedEntityId = searchParams.get('relatedEntityId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};
    if (decisionType) where.decisionType = decisionType;
    if (decisionMaker) where.decisionMaker = decisionMaker;
    if (relatedEntityType) where.relatedEntityType = relatedEntityType;
    if (relatedEntityId) where.relatedEntityId = relatedEntityId;
    if (startDate || endDate) {
      where.effectiveDate = {};
      if (startDate) (where.effectiveDate as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.effectiveDate as Record<string, unknown>).lte = new Date(endDate);
    }

    const logs = await prisma.hRDecisionLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to fetch decision logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decision logs' },
      { status: 500 }
    );
  }
}

// POST - Log an HR decision (typically called by other services)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      decisionType, relatedEntityType, relatedEntityId,
      decisionMaker, decisionMakerRole, decision, reasoning,
      supportingData, policyReference, approvalChain, effectiveDate
    } = body;

    if (!decisionType || !relatedEntityType || !relatedEntityId || !decisionMaker || !decision) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Get system context from request
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const log = await prisma.hRDecisionLog.create({
      data: {
        decisionType,
        relatedEntityType,
        relatedEntityId,
        decisionMaker,
        decisionMakerRole: decisionMakerRole || 'USER',
        decision,
        reasoning,
        supportingData: JSON.parse(JSON.stringify(supportingData || {})),
        policyReference,
        approvalChain: approvalChain ? JSON.parse(JSON.stringify(approvalChain)) : undefined,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        systemContext: JSON.parse(JSON.stringify({ ip, userAgent, timestamp: new Date().toISOString() }))
      }
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Failed to create decision log:', error);
    return NextResponse.json(
      { error: 'Failed to create decision log' },
      { status: 500 }
    );
  }
}
