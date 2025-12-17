// AI Provider Module Exports
// 오프라인망 AI 연동 (vLLM, Ollama)

// Base
export { BaseAIProvider, formatMessages, estimateTokenCount } from './base';

// Providers
export { VLLMProvider, VLLM_DEFAULT_CONFIG } from './vllm-provider';
export { OllamaProvider, OLLAMA_DEFAULT_CONFIG } from './ollama-provider';

// Factory
export { 
  AIProviderFactory, 
  checkProviderHealth, 
  checkMultipleProviders,
  PROVIDER_CAPABILITIES,
  PROVIDER_DESCRIPTIONS,
} from './factory';

// Re-export types
export type {
  AIProviderType,
  AIProviderStatus,
  AIFeatureType,
  AIProviderConfig,
  AIProviderConfigInput,
  AIProviderInterface,
  AIModelInfo,
  AIModelSyncResult,
  AIChatMessage,
  AICompletionRequest,
  AICompletionResponse,
  AITokenUsage,
  AIStreamChunk,
  AIConnectionTestResult,
  AIFeatureModelMapping,
  AIFeatureMappingInput,
  AIPromptTemplate,
  AIPromptTemplateInput,
  AIAccessPolicy,
  AICallLogEntry,
  AICallStatus,
  AICallLogFilter,
  AIProviderError,
  AIErrorCode,
} from '@/types/ai-provider';

export {
  AI_FEATURE_LABELS,
  AI_PROVIDER_LABELS,
  AI_STATUS_LABELS,
} from '@/types/ai-provider';
