import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

    const [
      totalObjectives,
      completedObjectives,
      activeObjectives,
      companyObjectives,
      departmentObjectives,
      individualObjectives,
    ] = await Promise.all([
      prisma.objective.count({ where: { period } }),
      prisma.objective.count({ where: { period, status: 'COMPLETED' } }),
      prisma.objective.count({ where: { period, status: 'ACTIVE' } }),
      prisma.objective.count({ where: { period, level: 'COMPANY' } }),
      prisma.objective.count({ where: { period, level: 'DEPARTMENT' } }),
      prisma.objective.count({ where: { period, level: 'INDIVIDUAL' } }),
    ]);

    const objectivesWithProgress = await prisma.objective.findMany({
      where: { period, status: 'ACTIVE' },
      select: { progress: true },
    });

    const avgProgress = objectivesWithProgress.length > 0
      ? Math.round(objectivesWithProgress.reduce((sum, obj) => sum + obj.progress, 0) / objectivesWithProgress.length)
      : 0;

    const recentCheckIns = await prisma.keyResultCheckIn.findMany({
      take: 10,
      orderBy: { checkedAt: 'desc' },
      include: {
        keyResult: {
          select: {
            title: true,
            objective: {
              select: {
                title: true,
                ownerId: true,
              },
            },
          },
        },
      },
    });

    const levelProgress = await prisma.objective.groupBy({
      by: ['level'],
      where: { period, status: 'ACTIVE' },
      _avg: { progress: true },
      _count: true,
    });

    const topObjectives = await prisma.objective.findMany({
      where: { period, status: 'ACTIVE' },
      orderBy: { progress: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        level: true,
        progress: true,
        ownerId: true,
      },
    });

    const atRiskObjectives = await prisma.objective.findMany({
      where: {
        period,
        status: 'ACTIVE',
        progress: { lt: 30 },
      },
      orderBy: { progress: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        level: true,
        progress: true,
        ownerId: true,
      },
    });

    return NextResponse.json({
      period,
      summary: {
        total: totalObjectives,
        completed: completedObjectives,
        active: activeObjectives,
        avgProgress,
      },
      byLevel: {
        company: companyObjectives,
        department: departmentObjectives,
        individual: individualObjectives,
      },
      levelProgress: levelProgress.map((lp) => ({
        level: lp.level,
        avgProgress: Math.round(lp._avg.progress || 0),
        count: lp._count,
      })),
      topPerformers: topObjectives,
      atRisk: atRiskObjectives,
      recentCheckIns: recentCheckIns.map((ci) => ({
        id: ci.id,
        value: ci.value,
        note: ci.note,
        checkedAt: ci.checkedAt,
        keyResultTitle: ci.keyResult.title,
        objectiveTitle: ci.keyResult.objective.title,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch OKR dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
