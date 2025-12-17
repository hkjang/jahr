// Phase 8: 운영 안정성 (SRE) API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "incident":
        return getIncidents(searchParams);
      case "metric":
        return getPerformanceMetrics(searchParams);
      case "backup":
        return getBackupSchedules();
      case "deployment":
        return getDeploymentRecords(searchParams);
      default:
        return getIncidents(searchParams);
    }
  } catch (error) {
    console.error("Error in SRE GET:", error);
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "incident":
        return createIncident(data);
      case "metric":
        return recordMetric(data);
      case "backup":
        return createBackupSchedule(data);
      case "deployment":
        return recordDeployment(data);
      case "resolve":
        return resolveIncident(data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in SRE POST:", error);
    return NextResponse.json({ error: "생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    switch (type) {
      case "incident":
        return updateIncident(id, data);
      case "backup":
        return updateBackupSchedule(id, data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in SRE PUT:", error);
    return NextResponse.json({ error: "수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    switch (type) {
      case "backup":
        await prisma.backupSchedule.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in SRE DELETE:", error);
    return NextResponse.json({ error: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// Incident functions
async function getIncidents(searchParams: URLSearchParams) {
  const severity = searchParams.get("severity");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (severity) where.severity = severity;
  if (status) where.status = status;

  const incidents = await prisma.incident.findMany({
    where,
    orderBy: { startedAt: "desc" },
  });
  return NextResponse.json(incidents);
}

async function createIncident(data: Record<string, unknown>) {
  const incident = await prisma.incident.create({
    data: {
      title: data.title as string,
      description: data.description as string,
      severity: data.severity as "P1_CRITICAL" | "P2_HIGH" | "P3_MEDIUM" | "P4_LOW",
      status: "OPEN",
      affectedSystems: data.affectedSystems as string[] || [],
      assignedTo: data.assignedTo as string | undefined,
    },
  });
  return NextResponse.json(incident, { status: 201 });
}

async function updateIncident(id: string, data: Record<string, unknown>) {
  const incident = await prisma.incident.update({
    where: { id },
    data: {
      title: data.title as string | undefined,
      description: data.description as string | undefined,
      status: data.status as "OPEN" | "INVESTIGATING" | "IDENTIFIED" | "MONITORING" | "RESOLVED" | undefined,
      assignedTo: data.assignedTo as string | undefined,
      timeline: data.timeline as object | undefined,
    },
  });
  return NextResponse.json(incident);
}

async function resolveIncident(data: Record<string, unknown>) {
  const incident = await prisma.incident.update({
    where: { id: data.id as string },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
      rootCause: data.rootCause as string | undefined,
      resolution: data.resolution as string | undefined,
    },
  });
  return NextResponse.json(incident);
}

// Performance Metric functions
async function getPerformanceMetrics(searchParams: URLSearchParams) {
  const endpoint = searchParams.get("endpoint");
  const hours = parseInt(searchParams.get("hours") || "24");

  const since = new Date();
  since.setHours(since.getHours() - hours);

  const where: Record<string, unknown> = {
    timestamp: { gte: since },
  };
  if (endpoint) where.endpoint = { contains: endpoint };

  const metrics = await prisma.performanceMetric.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: 1000,
  });

  // Aggregate stats
  const stats = {
    avgResponseTime: metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length
      : 0,
    errorRate: metrics.length > 0
      ? (metrics.filter(m => m.statusCode >= 400).length / metrics.length) * 100
      : 0,
    totalRequests: metrics.length,
  };

  return NextResponse.json({ metrics, stats });
}

async function recordMetric(data: Record<string, unknown>) {
  const metric = await prisma.performanceMetric.create({
    data: {
      endpoint: data.endpoint as string,
      method: data.method as string,
      responseTime: data.responseTime as number,
      statusCode: data.statusCode as number,
      metadata: data.metadata as object | undefined,
    },
  });
  return NextResponse.json(metric, { status: 201 });
}

// Backup Schedule functions
async function getBackupSchedules() {
  const schedules = await prisma.backupSchedule.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(schedules);
}

async function createBackupSchedule(data: Record<string, unknown>) {
  const schedule = await prisma.backupSchedule.create({
    data: {
      name: data.name as string,
      type: data.type as string,
      schedule: data.schedule as string,
      retentionDays: data.retentionDays as number || 30,
      isActive: true,
    },
  });
  return NextResponse.json(schedule, { status: 201 });
}

async function updateBackupSchedule(id: string, data: Record<string, unknown>) {
  const schedule = await prisma.backupSchedule.update({
    where: { id },
    data: {
      name: data.name as string | undefined,
      schedule: data.schedule as string | undefined,
      retentionDays: data.retentionDays as number | undefined,
      isActive: data.isActive as boolean | undefined,
      lastRunAt: data.lastRunAt ? new Date(data.lastRunAt as string) : undefined,
      lastStatus: data.lastStatus as string | undefined,
      nextRunAt: data.nextRunAt ? new Date(data.nextRunAt as string) : undefined,
    },
  });
  return NextResponse.json(schedule);
}

// Deployment Record functions
async function getDeploymentRecords(searchParams: URLSearchParams) {
  const environment = searchParams.get("environment");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (environment) where.environment = environment;

  const deployments = await prisma.deploymentRecord.findMany({
    where,
    orderBy: { deployedAt: "desc" },
    take: limit,
  });
  return NextResponse.json(deployments);
}

async function recordDeployment(data: Record<string, unknown>) {
  const deployment = await prisma.deploymentRecord.create({
    data: {
      version: data.version as string,
      environment: data.environment as string,
      deployedBy: data.deployedBy as string,
      status: data.status as string || "SUCCESS",
      changelog: data.changelog as string | undefined,
      rollbackFrom: data.rollbackFrom as string | undefined,
      duration: data.duration as number | undefined,
    },
  });
  return NextResponse.json(deployment, { status: 201 });
}
