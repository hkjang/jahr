// Phase 7: API 플랫폼 및 연동 API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "client":
        return getApiClients();
      case "webhook":
        return getWebhooks();
      case "log":
        return getApiLogs(searchParams);
      case "integration":
        return getIntegrations();
      default:
        return getApiClients();
    }
  } catch (error) {
    console.error("Error in platform GET:", error);
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "client":
        return createApiClient(data);
      case "webhook":
        return createWebhook(data);
      case "log":
        return createApiLog(data);
      case "integration":
        return createIntegration(data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in platform POST:", error);
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
      case "client":
        return updateApiClient(id, data);
      case "webhook":
        return updateWebhook(id, data);
      case "integration":
        return updateIntegration(id, data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in platform PUT:", error);
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
      case "client":
        await prisma.apiClient.delete({ where: { id } });
        break;
      case "webhook":
        await prisma.webhook.delete({ where: { id } });
        break;
      case "integration":
        await prisma.externalIntegration.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in platform DELETE:", error);
    return NextResponse.json({ error: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// API Client functions
async function getApiClients() {
  const clients = await prisma.apiClient.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      clientId: true,
      description: true,
      allowedScopes: true,
      allowedOrigins: true,
      isActive: true,
      rateLimitPerMin: true,
      createdAt: true,
    },
  });
  return NextResponse.json(clients);
}

async function createApiClient(data: Record<string, unknown>) {
  const clientId = `jhr_${randomBytes(16).toString("hex")}`;
  const clientSecret = randomBytes(32).toString("hex");

  const client = await prisma.apiClient.create({
    data: {
      name: data.name as string,
      clientId,
      clientSecret,
      description: data.description as string | undefined,
      allowedScopes: data.allowedScopes as string[] || ["read"],
      allowedOrigins: data.allowedOrigins as string[] || [],
      isActive: true,
      rateLimitPerMin: data.rateLimitPerMin as number || 60,
    },
  });

  return NextResponse.json({
    ...client,
    clientSecret, // Only show once
  }, { status: 201 });
}

async function updateApiClient(id: string, data: Record<string, unknown>) {
  const client = await prisma.apiClient.update({
    where: { id },
    data: {
      name: data.name as string | undefined,
      description: data.description as string | undefined,
      allowedScopes: data.allowedScopes as string[] | undefined,
      allowedOrigins: data.allowedOrigins as string[] | undefined,
      isActive: data.isActive as boolean | undefined,
      rateLimitPerMin: data.rateLimitPerMin as number | undefined,
    },
  });
  return NextResponse.json(client);
}

// Webhook functions
async function getWebhooks() {
  const webhooks = await prisma.webhook.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(webhooks);
}

async function createWebhook(data: Record<string, unknown>) {
  const secret = randomBytes(32).toString("hex");

  const webhook = await prisma.webhook.create({
    data: {
      name: data.name as string,
      url: data.url as string,
      events: data.events as string[],
      secret,
      isActive: true,
    },
  });
  return NextResponse.json(webhook, { status: 201 });
}

async function updateWebhook(id: string, data: Record<string, unknown>) {
  const webhook = await prisma.webhook.update({
    where: { id },
    data: {
      name: data.name as string | undefined,
      url: data.url as string | undefined,
      events: data.events as string[] | undefined,
      isActive: data.isActive as boolean | undefined,
    },
  });
  return NextResponse.json(webhook);
}

// API Log functions
async function getApiLogs(searchParams: URLSearchParams) {
  const clientId = searchParams.get("clientId");
  const endpoint = searchParams.get("endpoint");
  const limit = parseInt(searchParams.get("limit") || "100");

  const where: Record<string, unknown> = {};
  if (clientId) where.clientId = clientId;
  if (endpoint) where.endpoint = { contains: endpoint };

  const logs = await prisma.apiLog.findMany({
    where,
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 500),
  });
  return NextResponse.json(logs);
}

async function createApiLog(data: Record<string, unknown>) {
  const log = await prisma.apiLog.create({
    data: {
      clientId: data.clientId as string | undefined,
      method: data.method as string,
      endpoint: data.endpoint as string,
      statusCode: data.statusCode as number,
      requestBody: data.requestBody as object | undefined,
      responseTime: data.responseTime as number,
      ipAddress: data.ipAddress as string | undefined,
      userAgent: data.userAgent as string | undefined,
      error: data.error as string | undefined,
    },
  });
  return NextResponse.json(log, { status: 201 });
}

// External Integration functions
async function getIntegrations() {
  const integrations = await prisma.externalIntegration.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(integrations);
}

async function createIntegration(data: Record<string, unknown>) {
  const integration = await prisma.externalIntegration.create({
    data: {
      name: data.name as string,
      type: data.type as string,
      config: data.config as object,
      isActive: true,
    },
  });
  return NextResponse.json(integration, { status: 201 });
}

async function updateIntegration(id: string, data: Record<string, unknown>) {
  const integration = await prisma.externalIntegration.update({
    where: { id },
    data: {
      name: data.name as string | undefined,
      config: data.config as object | undefined,
      isActive: data.isActive as boolean | undefined,
      lastSyncAt: data.lastSyncAt ? new Date(data.lastSyncAt as string) : undefined,
      syncStatus: data.syncStatus as string | undefined,
    },
  });
  return NextResponse.json(integration);
}
