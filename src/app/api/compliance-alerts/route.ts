import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 컴플라이언스 경고 목록
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const resolved = searchParams.get('resolved');

    const where: {
      type?: 'OVERTIME_LIMIT' | 'CONTRACT_EXPIRY' | 'COMPLIANCE_VIOLATION' | 'LEGAL_UPDATE' | 'RISK_DETECTED';
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      isResolved?: boolean;
    } = {};
    
    if (type) where.type = type as typeof where.type;
    if (severity) where.severity = severity as typeof where.severity;
    if (resolved !== null) where.isResolved = resolved === 'true';

    const alerts = await prisma.complianceAlert.findMany({
      where,
      include: {
        rule: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// POST: 컴플라이언스 경고 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId, type, severity, title, message, employeeId, data } = body;

    if (!type || !severity || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const alert = await prisma.complianceAlert.create({
      data: {
        ruleId,
        type,
        severity,
        title,
        message,
        employeeId,
        data,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
