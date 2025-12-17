// AI Configuration Service
// Provider 설정 관리, 모델 동기화, 연결 테스트

import { prisma } from './prisma';
import { 
  AIProviderFactory,
  type AIProviderConfig,
  type AIProviderConfigInput,
  type AIModelInfo,
  type AIModelSyncResult,
  type AIFeatureType,
} from './ai-provider';
import {
  encryptApiKey,
  decryptApiKey,
  maskApiKey,
  validateOfflineUrl,
} from './ai-security';
import type { AIProviderType, AIProviderStatus } from '@/types/ai-provider';

// ========================================
// Provider Configuration Service
// ========================================

/**
 * 모든 Provider 설정 조회
 */
export async function getAllProviders(): Promise<AIProviderConfig[]> {
  const providers = await prisma.aIProviderConfig.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return providers.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type as AIProviderType,
    baseUrl: p.baseUrl,
    apiKey: undefined, // API Key는 복호화하지 않음 (보안)
    isDefault: p.isDefault,
    status: p.status as AIProviderStatus,
    defaultModel: p.defaultModel || undefined,
    timeout: p.timeout,
    maxTokens: p.maxTokens,
    temperature: p.temperature,
    streamingEnabled: p.streamingEnabled,
    rateLimitPerMinute: p.rateLimitPerMinute,
    rateLimitPerHour: p.rateLimitPerHour,
    lastHealthCheck: p.lastHealthCheck || undefined,
    lastError: p.lastError || undefined,
  }));
}

/**
 * 특정 Provider 설정 조회
 */
export async function getProviderById(id: string): Promise<AIProviderConfig | null> {
  const provider = await prisma.aIProviderConfig.findUnique({
    where: { id },
  });

  if (!provider) return null;

  return {
    id: provider.id,
    name: provider.name,
    type: provider.type as AIProviderType,
    baseUrl: provider.baseUrl,
    apiKey: undefined,
    isDefault: provider.isDefault,
    status: provider.status as AIProviderStatus,
    defaultModel: provider.defaultModel || undefined,
    timeout: provider.timeout,
    maxTokens: provider.maxTokens,
    temperature: provider.temperature,
    streamingEnabled: provider.streamingEnabled,
    rateLimitPerMinute: provider.rateLimitPerMinute,
    rateLimitPerHour: provider.rateLimitPerHour,
    lastHealthCheck: provider.lastHealthCheck || undefined,
    lastError: provider.lastError || undefined,
  };
}

/**
 * 기본 Provider 조회
 */
export async function getDefaultProvider(): Promise<AIProviderConfig | null> {
  const provider = await prisma.aIProviderConfig.findFirst({
    where: { isDefault: true, status: 'ACTIVE' },
  });

  if (!provider) return null;

  return {
    id: provider.id,
    name: provider.name,
    type: provider.type as AIProviderType,
    baseUrl: provider.baseUrl,
    apiKey: provider.apiKeyEncrypted ? decryptApiKey(provider.apiKeyEncrypted) : undefined,
    isDefault: provider.isDefault,
    status: provider.status as AIProviderStatus,
    defaultModel: provider.defaultModel || undefined,
    timeout: provider.timeout,
    maxTokens: provider.maxTokens,
    temperature: provider.temperature,
    streamingEnabled: provider.streamingEnabled,
    rateLimitPerMinute: provider.rateLimitPerMinute,
    rateLimitPerHour: provider.rateLimitPerHour,
    lastHealthCheck: provider.lastHealthCheck || undefined,
    lastError: provider.lastError || undefined,
  };
}

/**
 * Provider 설정 생성
 */
export async function createProvider(
  input: AIProviderConfigInput,
  createdBy: string
): Promise<AIProviderConfig> {
  // 오프라인망 URL 검증
  const urlValidation = validateOfflineUrl(input.baseUrl);
  if (!urlValidation.valid) {
    throw new Error(urlValidation.message);
  }

  // API Key 암호화
  const apiKeyEncrypted = input.apiKey ? encryptApiKey(input.apiKey) : null;

  // 기본 설정 가져오기
  const defaults = AIProviderFactory.getDefaultConfig(input.type);

  const provider = await prisma.aIProviderConfig.create({
    data: {
      name: input.name,
      type: input.type,
      baseUrl: input.baseUrl,
      apiKeyEncrypted,
      isDefault: false,
      status: 'INACTIVE',
      defaultModel: input.defaultModel,
      timeout: input.timeout ?? defaults.timeout ?? 30000,
      maxTokens: input.maxTokens ?? defaults.maxTokens ?? 2048,
      temperature: input.temperature ?? defaults.temperature ?? 0.7,
      streamingEnabled: input.streamingEnabled ?? defaults.streamingEnabled ?? true,
      rateLimitPerMinute: input.rateLimitPerMinute ?? defaults.rateLimitPerMinute ?? 60,
      rateLimitPerHour: input.rateLimitPerHour ?? defaults.rateLimitPerHour ?? 1000,
      createdBy,
    },
  });

  return {
    id: provider.id,
    name: provider.name,
    type: provider.type as AIProviderType,
    baseUrl: provider.baseUrl,
    apiKey: undefined,
    isDefault: provider.isDefault,
    status: provider.status as AIProviderStatus,
    defaultModel: provider.defaultModel || undefined,
    timeout: provider.timeout,
    maxTokens: provider.maxTokens,
    temperature: provider.temperature,
    streamingEnabled: provider.streamingEnabled,
    rateLimitPerMinute: provider.rateLimitPerMinute,
    rateLimitPerHour: provider.rateLimitPerHour,
  };
}

/**
 * Provider 설정 업데이트
 */
export async function updateProvider(
  id: string,
  input: Partial<AIProviderConfigInput>
): Promise<AIProviderConfig> {
  // 오프라인망 URL 검증
  if (input.baseUrl) {
    const urlValidation = validateOfflineUrl(input.baseUrl);
    if (!urlValidation.valid) {
      throw new Error(urlValidation.message);
    }
  }

  // API Key 암호화
  const apiKeyEncrypted = input.apiKey !== undefined
    ? (input.apiKey ? encryptApiKey(input.apiKey) : null)
    : undefined;

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.baseUrl !== undefined) updateData.baseUrl = input.baseUrl;
  if (apiKeyEncrypted !== undefined) updateData.apiKeyEncrypted = apiKeyEncrypted;
  if (input.defaultModel !== undefined) updateData.defaultModel = input.defaultModel;
  if (input.timeout !== undefined) updateData.timeout = input.timeout;
  if (input.maxTokens !== undefined) updateData.maxTokens = input.maxTokens;
  if (input.temperature !== undefined) updateData.temperature = input.temperature;
  if (input.streamingEnabled !== undefined) updateData.streamingEnabled = input.streamingEnabled;
  if (input.rateLimitPerMinute !== undefined) updateData.rateLimitPerMinute = input.rateLimitPerMinute;
  if (input.rateLimitPerHour !== undefined) updateData.rateLimitPerHour = input.rateLimitPerHour;

  // 캐시 무효화
  AIProviderFactory.invalidate(id);

  const provider = await prisma.aIProviderConfig.update({
    where: { id },
    data: updateData,
  });

  return {
    id: provider.id,
    name: provider.name,
    type: provider.type as AIProviderType,
    baseUrl: provider.baseUrl,
    apiKey: undefined,
    isDefault: provider.isDefault,
    status: provider.status as AIProviderStatus,
    defaultModel: provider.defaultModel || undefined,
    timeout: provider.timeout,
    maxTokens: provider.maxTokens,
    temperature: provider.temperature,
    streamingEnabled: provider.streamingEnabled,
    rateLimitPerMinute: provider.rateLimitPerMinute,
    rateLimitPerHour: provider.rateLimitPerHour,
  };
}

/**
 * Provider 삭제
 */
export async function deleteProvider(id: string): Promise<void> {
  // 캐시 무효화
  AIProviderFactory.invalidate(id);

  await prisma.aIProviderConfig.delete({
    where: { id },
  });
}

/**
 * 기본 Provider 설정
 */
export async function setDefaultProvider(id: string): Promise<void> {
  await prisma.$transaction([
    // 기존 기본 해제
    prisma.aIProviderConfig.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    }),
    // 새 기본 설정
    prisma.aIProviderConfig.update({
      where: { id },
      data: { isDefault: true },
    }),
  ]);
}

// ========================================
// Connection Test Service
// ========================================

/**
 * Provider 연결 테스트
 */
export async function testProviderConnection(
  id: string
): Promise<{ success: boolean; message: string; latencyMs?: number; modelCount?: number }> {
  const provider = await prisma.aIProviderConfig.findUnique({
    where: { id },
  });

  if (!provider) {
    return { success: false, message: 'Provider를 찾을 수 없습니다' };
  }

  const config: AIProviderConfig = {
    id: provider.id,
    name: provider.name,
    type: provider.type as AIProviderType,
    baseUrl: provider.baseUrl,
    apiKey: provider.apiKeyEncrypted ? decryptApiKey(provider.apiKeyEncrypted) : undefined,
    isDefault: provider.isDefault,
    status: provider.status as AIProviderStatus,
    defaultModel: provider.defaultModel || undefined,
    timeout: provider.timeout,
    maxTokens: provider.maxTokens,
    temperature: provider.temperature,
    streamingEnabled: provider.streamingEnabled,
    rateLimitPerMinute: provider.rateLimitPerMinute,
    rateLimitPerHour: provider.rateLimitPerHour,
  };

  try {
    const providerInstance = AIProviderFactory.create(config);
    const result = await providerInstance.testConnection();

    // 결과 저장
    await prisma.aIProviderConfig.update({
      where: { id },
      data: {
        lastHealthCheck: new Date(),
        status: result.success ? 'ACTIVE' : 'ERROR',
        lastError: result.success ? null : result.message,
      },
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    await prisma.aIProviderConfig.update({
      where: { id },
      data: {
        lastHealthCheck: new Date(),
        status: 'ERROR',
        lastError: errorMessage,
      },
    });

    return { success: false, message: errorMessage };
  }
}

// ========================================
// Model Sync Service
// ========================================

/**
 * Provider 모델 동기화
 */
export async function syncProviderModels(id: string): Promise<AIModelSyncResult> {
  const provider = await prisma.aIProviderConfig.findUnique({
    where: { id },
    include: { models: true },
  });

  if (!provider) {
    throw new Error('Provider를 찾을 수 없습니다');
  }

  const config: AIProviderConfig = {
    id: provider.id,
    name: provider.name,
    type: provider.type as AIProviderType,
    baseUrl: provider.baseUrl,
    apiKey: provider.apiKeyEncrypted ? decryptApiKey(provider.apiKeyEncrypted) : undefined,
    isDefault: provider.isDefault,
    status: provider.status as AIProviderStatus,
    defaultModel: provider.defaultModel || undefined,
    timeout: provider.timeout,
    maxTokens: provider.maxTokens,
    temperature: provider.temperature,
    streamingEnabled: provider.streamingEnabled,
    rateLimitPerMinute: provider.rateLimitPerMinute,
    rateLimitPerHour: provider.rateLimitPerHour,
  };

  const providerInstance = AIProviderFactory.create(config);
  const remoteModels = await providerInstance.listModels();

  const result: AIModelSyncResult = {
    added: [],
    updated: [],
    removed: [],
    errors: [],
  };

  const existingModelIds = new Set(provider.models.map(m => m.modelId));
  const remoteModelIds = new Set(remoteModels.map(m => m.modelId));

  // 새 모델 추가
  for (const model of remoteModels) {
    if (!existingModelIds.has(model.modelId)) {
      try {
        await prisma.aIProviderModel.create({
          data: {
            providerId: id,
            modelId: model.modelId,
            displayName: model.displayName,
            description: model.description,
            contextLength: model.contextLength,
            isAvailable: true,
            capabilities: model.capabilities,
          },
        });
        result.added.push(model);
      } catch (error) {
        result.errors.push(`모델 추가 실패: ${model.modelId}`);
      }
    }
  }

  // 기존 모델 업데이트
  for (const existingModel of provider.models) {
    const remoteModel = remoteModels.find(m => m.modelId === existingModel.modelId);
    if (remoteModel) {
      try {
        await prisma.aIProviderModel.update({
          where: { id: existingModel.id },
          data: {
            displayName: remoteModel.displayName,
            description: remoteModel.description,
            contextLength: remoteModel.contextLength,
            isAvailable: true,
            capabilities: remoteModel.capabilities,
          },
        });
        result.updated.push(remoteModel);
      } catch (error) {
        result.errors.push(`모델 업데이트 실패: ${existingModel.modelId}`);
      }
    }
  }

  // 삭제된 모델 비활성화
  for (const existingModel of provider.models) {
    if (!remoteModelIds.has(existingModel.modelId)) {
      try {
        await prisma.aIProviderModel.update({
          where: { id: existingModel.id },
          data: { isAvailable: false },
        });
        result.removed.push(existingModel.modelId);
      } catch (error) {
        result.errors.push(`모델 비활성화 실패: ${existingModel.modelId}`);
      }
    }
  }

  return result;
}

/**
 * Provider 모델 목록 조회
 */
export async function getProviderModels(providerId: string): Promise<AIModelInfo[]> {
  const models = await prisma.aIProviderModel.findMany({
    where: { providerId, isAvailable: true },
    orderBy: { displayName: 'asc' },
  });

  return models.map(m => ({
    id: m.id,
    modelId: m.modelId,
    displayName: m.displayName,
    description: m.description || undefined,
    contextLength: m.contextLength || undefined,
    capabilities: m.capabilities,
    isAvailable: m.isAvailable,
  }));
}

// ========================================
// Feature Mapping Service
// ========================================

/**
 * 기능별 모델 매핑 조회
 */
export async function getFeatureModelMappings() {
  const mappings = await prisma.aIFeatureModelMapping.findMany({
    include: {
      model: {
        include: { provider: true },
      },
    },
    orderBy: [{ featureType: 'asc' }, { priority: 'desc' }],
  });

  return mappings.map(m => ({
    id: m.id,
    featureType: m.featureType as AIFeatureType,
    modelId: m.modelId,
    model: {
      id: m.model.id,
      modelId: m.model.modelId,
      displayName: m.model.displayName,
      description: m.model.description || undefined,
      contextLength: m.model.contextLength || undefined,
      capabilities: m.model.capabilities,
      isAvailable: m.model.isAvailable,
      provider: {
        id: m.model.provider.id,
        name: m.model.provider.name,
        type: m.model.provider.type,
      },
    },
    isDefault: m.isDefault,
    priority: m.priority,
    maxTokensOverride: m.maxTokensOverride || undefined,
    temperatureOverride: m.temperatureOverride || undefined,
    systemPrompt: m.systemPrompt || undefined,
  }));
}

/**
 * 기능별 기본 모델 조회
 */
export async function getDefaultModelForFeature(
  featureType: AIFeatureType
): Promise<{
  config: AIProviderConfig;
  modelId: string;
  systemPrompt?: string;
} | null> {
  // 먼저 기능별 매핑 확인
  const mapping = await prisma.aIFeatureModelMapping.findFirst({
    where: { featureType, isDefault: true },
    include: {
      model: {
        include: { provider: true },
      },
    },
  });

  if (mapping) {
    const provider = mapping.model.provider;
    return {
      config: {
        id: provider.id,
        name: provider.name,
        type: provider.type as AIProviderType,
        baseUrl: provider.baseUrl,
        apiKey: provider.apiKeyEncrypted ? decryptApiKey(provider.apiKeyEncrypted) : undefined,
        isDefault: provider.isDefault,
        status: provider.status as AIProviderStatus,
        defaultModel: mapping.model.modelId,
        timeout: provider.timeout,
        maxTokens: mapping.maxTokensOverride || provider.maxTokens,
        temperature: mapping.temperatureOverride || provider.temperature,
        streamingEnabled: provider.streamingEnabled,
        rateLimitPerMinute: provider.rateLimitPerMinute,
        rateLimitPerHour: provider.rateLimitPerHour,
      },
      modelId: mapping.model.modelId,
      systemPrompt: mapping.systemPrompt || undefined,
    };
  }

  // 기본 Provider 사용
  const defaultConfig = await getDefaultProvider();
  if (defaultConfig) {
    return {
      config: defaultConfig,
      modelId: defaultConfig.defaultModel || '',
    };
  }

  return null;
}

/**
 * 기능-모델 매핑 설정
 */
export async function setFeatureModelMapping(
  featureType: AIFeatureType,
  modelId: string,
  options?: {
    isDefault?: boolean;
    priority?: number;
    maxTokensOverride?: number;
    temperatureOverride?: number;
    systemPrompt?: string;
  }
): Promise<void> {
  // 기존 기본 매핑 해제 (필요시)
  if (options?.isDefault) {
    await prisma.aIFeatureModelMapping.updateMany({
      where: { featureType, isDefault: true },
      data: { isDefault: false },
    });
  }

  await prisma.aIFeatureModelMapping.upsert({
    where: {
      featureType_modelId: { featureType, modelId },
    },
    update: {
      isDefault: options?.isDefault ?? false,
      priority: options?.priority ?? 0,
      maxTokensOverride: options?.maxTokensOverride,
      temperatureOverride: options?.temperatureOverride,
      systemPrompt: options?.systemPrompt,
    },
    create: {
      featureType,
      modelId,
      isDefault: options?.isDefault ?? false,
      priority: options?.priority ?? 0,
      maxTokensOverride: options?.maxTokensOverride,
      temperatureOverride: options?.temperatureOverride,
      systemPrompt: options?.systemPrompt,
    },
  });
}

// ========================================
// Utility Exports
// ========================================

export { maskApiKey };
