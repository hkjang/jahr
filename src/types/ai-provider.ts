// AI Provider 타입 정의
// 오프라인망 AI 연동 (vLLM, Ollama)

// ========================================
// Provider Types
// ========================================

export type AIProviderType = 'VLLM' | 'OLLAMA' | 'OPENAI_COMPATIBLE';

export type AIProviderStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';

export type AIFeatureType = 
  | 'HR_SUMMARY' 
  | 'AI_RECOMMENDATION' 
  | 'REGULATION_QA' 
  | 'DOCUMENT_GENERATION' 
  | 'SENTIMENT_ANALYSIS' 
  | 'CHATBOT';

// ========================================
// Provider Configuration
// ========================================

export interface AIProviderConfig {
  id: string;
  name: string;
  type: AIProviderType;
  baseUrl: string;
  apiKey?: string; // Decrypted at runtime
  isDefault: boolean;
  status: AIProviderStatus;
  
  // Settings
  defaultModel?: string;
  timeout: number; // ms
  maxTokens: number;
  temperature: number;
  streamingEnabled: boolean;
  
  // Rate Limiting
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  
  // Status
  lastHealthCheck?: Date;
  lastError?: string;
}

export interface AIProviderConfigInput {
  name: string;
  type: AIProviderType;
  baseUrl: string;
  apiKey?: string;
  defaultModel?: string;
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
  streamingEnabled?: boolean;
  rateLimitPerMinute?: number;
  rateLimitPerHour?: number;
}

// ========================================
// Model Information
// ========================================

export interface AIModelInfo {
  id: string;
  modelId: string;
  displayName: string;
  description?: string;
  contextLength?: number;
  capabilities: string[];
  isAvailable: boolean;
}

export interface AIModelSyncResult {
  added: AIModelInfo[];
  updated: AIModelInfo[];
  removed: string[];
  errors: string[];
}

// ========================================
// Chat Messages
// ========================================

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  featureType?: AIFeatureType;
}

export interface AICompletionResponse {
  id: string;
  content: string;
  model: string;
  usage: AITokenUsage;
  finishReason: 'stop' | 'length' | 'error';
  latencyMs: number;
}

export interface AITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// ========================================
// Streaming
// ========================================

export interface AIStreamChunk {
  content: string;
  done: boolean;
  error?: string;
}

// ========================================
// Provider Interface
// ========================================

export interface AIProviderInterface {
  readonly type: AIProviderType;
  readonly config: AIProviderConfig;
  
  /**
   * 연결 테스트
   */
  testConnection(): Promise<AIConnectionTestResult>;
  
  /**
   * 모델 목록 조회
   */
  listModels(): Promise<AIModelInfo[]>;
  
  /**
   * 채팅 완성 (Non-streaming)
   */
  chat(request: AICompletionRequest): Promise<AICompletionResponse>;
  
  /**
   * 스트리밍 채팅
   */
  chatStream(request: AICompletionRequest): AsyncGenerator<AIStreamChunk, void, unknown>;
}

export interface AIConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  modelCount?: number;
  serverVersion?: string;
}

// ========================================
// Feature Mapping
// ========================================

export interface AIFeatureModelMapping {
  id: string;
  featureType: AIFeatureType;
  modelId: string;
  model: AIModelInfo;
  isDefault: boolean;
  priority: number;
  maxTokensOverride?: number;
  temperatureOverride?: number;
  systemPrompt?: string;
}

export interface AIFeatureMappingInput {
  featureType: AIFeatureType;
  modelId: string;
  isDefault?: boolean;
  priority?: number;
  maxTokensOverride?: number;
  temperatureOverride?: number;
  systemPrompt?: string;
}

// ========================================
// Prompt Template
// ========================================

export interface AIPromptTemplate {
  id: string;
  name: string;
  featureType: AIFeatureType;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  version: number;
  isActive: boolean;
}

export interface AIPromptTemplateInput {
  name: string;
  featureType: AIFeatureType;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
}

// ========================================
// Access Policy
// ========================================

export interface AIAccessPolicy {
  id: string;
  name: string;
  description?: string;
  roleIds: string[];
  featureTypes: AIFeatureType[];
  dailyLimit?: number;
  monthlyLimit?: number;
  maxTokensPerCall?: number;
  isActive: boolean;
}

// ========================================
// Call Logging
// ========================================

export interface AICallLogEntry {
  id: string;
  providerId?: string;
  userId: string;
  featureType: AIFeatureType;
  modelId: string;
  requestSummary?: string;
  responseLength?: number;
  latencyMs?: number;
  tokenUsage?: AITokenUsage;
  status: AICallStatus;
  errorMessage?: string;
  ipAddress?: string;
  createdAt: Date;
}

export type AICallStatus = 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'RATE_LIMITED';

export interface AICallLogFilter {
  userId?: string;
  providerId?: string;
  featureType?: AIFeatureType;
  status?: AICallStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// ========================================
// Error Types
// ========================================

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code: AIErrorCode,
    public readonly provider?: AIProviderType,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export type AIErrorCode = 
  | 'CONNECTION_FAILED'
  | 'AUTHENTICATION_FAILED'
  | 'MODEL_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'INVALID_REQUEST'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

// ========================================
// Feature Labels (Korean)
// ========================================

export const AI_FEATURE_LABELS: Record<AIFeatureType, string> = {
  HR_SUMMARY: '인사 요약',
  AI_RECOMMENDATION: 'AI 추천',
  REGULATION_QA: '규정 QA',
  DOCUMENT_GENERATION: '문서 생성',
  SENTIMENT_ANALYSIS: '감정 분석',
  CHATBOT: 'HR 챗봇',
};

export const AI_PROVIDER_LABELS: Record<AIProviderType, string> = {
  VLLM: 'vLLM',
  OLLAMA: 'Ollama',
  OPENAI_COMPATIBLE: 'OpenAI Compatible',
};

export const AI_STATUS_LABELS: Record<AIProviderStatus, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  ERROR: '오류',
};
