import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Ingest HR event to data lake
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, classification, entityType, entityId, eventPayload, metadata, sourceSystem, occurredAt } = body;

    if (!eventType || !classification || !entityType || !entityId || !sourceSystem) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const event = await prisma.hREvent.create({
      data: {
        eventType,
        classification,
        entityType,
        entityId,
        eventPayload: JSON.parse(JSON.stringify(eventPayload || {})),
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        sourceSystem,
        occurredAt: occurredAt ? new Date(occurredAt) : new Date()
      }
    });

    // Also create data lake record for analysis
    const partition = new Date().toISOString().substring(0, 7).replace('-', ''); // YYYYMM
    await prisma.dataLakeRecord.create({
      data: {
        sourceTable: 'HREvent',
        recordId: event.id,
        data: JSON.parse(JSON.stringify({
          ...event,
          processedAt: new Date().toISOString()
        })),
        partition,
        isLatest: true
      }
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Failed to ingest event:', error);
    return NextResponse.json(
      { error: 'Failed to ingest event' },
      { status: 500 }
    );
  }
}

// GET - Query HR events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const classification = searchParams.get('classification');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};
    if (eventType) where.eventType = eventType;
    if (classification) where.classification = classification;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (startDate || endDate) {
      where.occurredAt = {};
      if (startDate) (where.occurredAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.occurredAt as Record<string, unknown>).lte = new Date(endDate);
    }

    const events = await prisma.hREvent.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: 100
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
