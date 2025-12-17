import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Log Zero Trust verification attempt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId, sessionId, resourceType, resourceId,
      requiredLevel, actualLevel, factors
    } = body;

    if (!userId || !sessionId || !resourceType || !requiredLevel || !actualLevel) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Get request context
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent');

    // Determine if verification passed
    const levelOrder = ['BASIC', 'MFA', 'BIOMETRIC', 'SUPERVISOR'];
    const requiredIndex = levelOrder.indexOf(requiredLevel);
    const actualIndex = levelOrder.indexOf(actualLevel);
    const passed = actualIndex >= requiredIndex;

    // Calculate risk score (simplified)
    let riskScore = 0;
    if (!passed) riskScore += 50;
    if (ip === 'unknown') riskScore += 20;
    // Add more risk factors as needed

    const verification = await prisma.zeroTrustVerification.create({
      data: {
        userId,
        sessionId,
        resourceType,
        resourceId,
        requiredLevel,
        actualLevel,
        passed,
        factors: JSON.parse(JSON.stringify(factors || {})),
        riskScore,
        ipAddress: ip,
        deviceFingerprint: userAgent?.substring(0, 100)
      }
    });

    // If high risk or failed verification, create anomaly detection record
    if (!passed || riskScore >= 50) {
      await prisma.anomalyDetection.create({
        data: {
          userId,
          anomalyType: passed ? 'ACCESS_PATTERN' : 'LOGIN_PATTERN',
          severity: riskScore >= 70 ? 'HIGH' : riskScore >= 50 ? 'MEDIUM' : 'LOW',
          description: passed 
            ? `High risk access attempt to ${resourceType}`
            : `Failed ${requiredLevel} verification for ${resourceType}`,
          detectedPattern: JSON.parse(JSON.stringify({ resourceType, resourceId, requiredLevel, actualLevel })),
          baselinePattern: JSON.parse(JSON.stringify({ expectedLevel: requiredLevel })),
          deviation: riskScore / 100,
          isBlocked: !passed && riskScore >= 70
        }
      });
    }

    return NextResponse.json({
      verified: passed,
      riskScore,
      verification
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to verify access:', error);
    return NextResponse.json(
      { error: 'Failed to verify access' },
      { status: 500 }
    );
  }
}

// GET - Get verification history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const passed = searchParams.get('passed');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (passed !== null) where.passed = passed === 'true';

    const verifications = await prisma.zeroTrustVerification.findMany({
      where,
      orderBy: { verifiedAt: 'desc' },
      take: 100
    });

    return NextResponse.json(verifications);
  } catch (error) {
    console.error('Failed to fetch verifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verifications' },
      { status: 500 }
    );
  }
}
