import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Detect attrition signals for employees
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, organizationId, scanAll } = body;

    const signals: Array<{
      employeeId: string;
      signalType: string;
      signalStrength: number;
      dataPoints: Record<string, unknown>;
      trend?: string;
    }> = [];

    // Determine which employees to scan
    let employeeIds: string[] = [];
    
    if (scanAll && organizationId) {
      const employees = await prisma.employee.findMany({
        where: { organizationId },
        select: { userId: true }
      });
      employeeIds = employees.map(e => e.userId);
    } else if (employeeId) {
      employeeIds = [employeeId];
    } else {
      return NextResponse.json(
        { error: 'Either employeeId or organizationId with scanAll is required' },
        { status: 400 }
      );
    }

    for (const empId of employeeIds) {
      // Check various attrition signals

      // 1. Performance decline check
      const evaluations = await prisma.evaluation.findMany({
        where: { employeeId: empId },
        orderBy: { createdAt: 'desc' },
        take: 4
      });

      if (evaluations.length >= 2) {
        const recent = evaluations.slice(0, 2);
        const older = evaluations.slice(2);
        const recentAvg = recent.reduce((s, e) => s + (e.finalScore || 0), 0) / recent.length;
        const olderAvg = older.length > 0 
          ? older.reduce((s, e) => s + (e.finalScore || 0), 0) / older.length 
          : recentAvg;

        if (recentAvg < olderAvg * 0.85) {
          signals.push({
            employeeId: empId,
            signalType: 'PERFORMANCE_DECLINE',
            signalStrength: Math.min(100, (olderAvg - recentAvg) * 2),
            dataPoints: { recentAvg, olderAvg, decline: olderAvg - recentAvg },
            trend: 'INCREASING'
          });
        }
      }

      // 2. Overtime excess check
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const overtimeRecords = await prisma.overtime.findMany({
        where: {
          employeeId: empId,
          date: { gte: thirtyDaysAgo },
          status: 'APPROVED'
        }
      });

      const totalOvertimeHours = overtimeRecords.reduce((sum, o) => sum + o.hours, 0);
      if (totalOvertimeHours > 40) {
        signals.push({
          employeeId: empId,
          signalType: 'OVERTIME_EXCESS',
          signalStrength: Math.min(100, totalOvertimeHours * 1.5),
          dataPoints: { monthlyHours: totalOvertimeHours, records: overtimeRecords.length },
          trend: totalOvertimeHours > 60 ? 'INCREASING' : 'STABLE'
        });
      }

      // 3. Leave pattern check (frequent short leaves)
      const leaves = await prisma.leave.findMany({
        where: {
          employeeId: empId,
          startDate: { gte: thirtyDaysAgo },
          status: 'APPROVED'
        }
      });

      const shortLeaves = leaves.filter(l => {
        const days = (new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (24 * 60 * 60 * 1000);
        return days <= 2;
      });

      if (shortLeaves.length >= 4) {
        signals.push({
          employeeId: empId,
          signalType: 'ABSENCE_PATTERN',
          signalStrength: Math.min(100, shortLeaves.length * 20),
          dataPoints: { shortLeaveCount: shortLeaves.length, totalLeaves: leaves.length },
          trend: 'STABLE'
        });
      }

      // 4. Career stall check (no promotion in 3+ years)
      const employee = await prisma.employee.findFirst({
        where: { userId: empId },
        include: { position: true }
      });

      if (employee) {
        const yearsInCompany = (new Date().getTime() - employee.hireDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
        
        // Check appointment history
        const appointments = await prisma.appointment.findMany({
          where: { employeeId: empId },
          orderBy: { effectiveDate: 'desc' },
          take: 1
        });

        const lastPromotion = appointments[0];
        const yearsSincePromotion = lastPromotion
          ? (new Date().getTime() - lastPromotion.effectiveDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
          : yearsInCompany;

        if (yearsSincePromotion >= 3 && yearsInCompany >= 3) {
          signals.push({
            employeeId: empId,
            signalType: 'CAREER_STALL',
            signalStrength: Math.min(100, yearsSincePromotion * 20),
            dataPoints: { yearsInCompany, yearsSincePromotion },
            trend: 'STABLE'
          });
        }
      }
    }

    // Save signals to database
    for (const signal of signals) {
      await prisma.attritionSignal.create({
        data: {
          employeeId: signal.employeeId,
          signalType: signal.signalType as 'ENGAGEMENT_DROP' | 'PERFORMANCE_DECLINE' | 'ABSENCE_PATTERN' | 'OVERTIME_EXCESS' | 'TRAINING_SKIP' | 'PEER_CONFLICT' | 'COMPENSATION_GAP' | 'CAREER_STALL',
          signalStrength: signal.signalStrength,
          dataPoints: JSON.parse(JSON.stringify(signal.dataPoints)),
          trend: signal.trend,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiry
        }
      });
    }

    return NextResponse.json({
      scannedEmployees: employeeIds.length,
      signalsDetected: signals.length,
      signals: signals.slice(0, 50)
    });
  } catch (error) {
    console.error('Failed to detect attrition signals:', error);
    return NextResponse.json(
      { error: 'Failed to detect attrition signals' },
      { status: 500 }
    );
  }
}

// GET - List attrition signals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const signalType = searchParams.get('signalType');
    const minStrength = searchParams.get('minStrength');

    const where: Record<string, unknown> = {
      isAcknowledged: false,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } }
      ]
    };
    
    if (employeeId) where.employeeId = employeeId;
    if (signalType) where.signalType = signalType;
    if (minStrength) where.signalStrength = { gte: parseFloat(minStrength) };

    const signals = await prisma.attritionSignal.findMany({
      where,
      orderBy: [
        { signalStrength: 'desc' },
        { detectedAt: 'desc' }
      ],
      take: 100
    });

    return NextResponse.json(signals);
  } catch (error) {
    console.error('Failed to fetch attrition signals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attrition signals' },
      { status: 500 }
    );
  }
}
