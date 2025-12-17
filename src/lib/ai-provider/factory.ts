// AI Provider Factory
// 런타임 Provider 생성 및 관리

import { VLLMProvider, VLLM_DEFAULT_CONFIG } from './vllm-provider';
import { OllamaProvider, OLLAMA_DEFAULT_CONFIG } from './ollama-provider';
import { BaseAIProvider } from './base';
import type { 
  AIProviderType, 
  AIProviderConfig, 
  AIProviderInterface,
  AIProviderConfigInput,
} from '@/types/ai-provider';

// ========================================
// Provider Factory
// ========================================

/**
 * AI Provider Factory
 * 
 * 설정에 따라 적절한 Provider 인스턴스를 생성
 */
export class AIProviderFactory {
  private static instances: Map<string, AIProviderInterface> = new Map();

  /**
   * Provider 인스턴스 생성
   */
  static create(config: AIProviderConfig): AIProviderInterface {
    switch (config.type) {
      case 'VLLM':
        return new VLLMProvider(config);
      case 'OLLAMA':
        return new OllamaProvider(config);
      case 'OPENAI_COMPATIBLE':
        // OpenAI Compatible은 BaseAIProvider의 기본 동작 사용
        return new GenericOpenAIProvider(config);
      default:
        throw new Error(`지원하지 않는 Provider 타입: ${config.type}`);
    }
  }

  /**
   * 캐시된 Provider 인스턴스 가져오기 (싱글톤 패턴)
   */
  static getInstance(config: AIProviderConfig): AIProviderInterface {
    const key = config.id;
    
    if (!this.instances.has(key)) {
      this.instances.set(key, this.create(config));
    }
    
    return this.instances.get(key)!;
  }

  /**
   * 캐시된 인스턴스 무효화
   */
  static invalidate(configId: string): void {
    this.instances.delete(configId);
  }

  /**
   * 모든 캐시 초기화
   */
  static clearCache(): void {
    this.instances.clear();
  }

  /**
   * 기본 설정 가져오기
   */
  static getDefaultConfig(type: AIProviderType): Partial<AIProviderConfigInput> {
    switch (type) {
      case 'VLLM':
        return VLLM_DEFAULT_CONFIG;
      case 'OLLAMA':
        return OLLAMA_DEFAULT_CONFIG;
      case 'OPENAI_COMPATIBLE':
        return {
          baseUrl: 'http://localhost:8080',
          timeout: 30000,
          maxTokens: 2048,
          temperature: 0.7,
          streamingEnabled: true,
          rateLimitPerMinute: 60,
          rateLimitPerHour: 1000,
        };
      default:
        return {};
    }
  }
}

// ========================================
// Generic OpenAI Compatible Provider
// ========================================

/**
 * Generic OpenAI Compatible Provider
 * 
 * vLLM, Ollama 이외의 OpenAI Compatible 서버용
 */
class GenericOpenAIProvider extends BaseAIProvider {
  readonly type: AIProviderType = 'OPENAI_COMPATIBLE';
}

// ========================================
// Utility Functions
// ========================================

/**
 * Provider 연결 상태 확인
 */
export async function checkProviderHealth(
  config: AIProviderConfig
): Promise<{ healthy: boolean; message: string; latencyMs?: number }> {
  try {
    const provider = AIProviderFactory.create(config);
    const result = await provider.testConnection();
    
    return {
      healthy: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
    };
  } catch (error) {
    return {
      healthy: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 여러 Provider 일괄 연결 테스트
 */
export async function checkMultipleProviders(
  configs: AIProviderConfig[]
): Promise<Map<string, { healthy: boolean; message: string }>> {
  const results = new Map<string, { healthy: boolean; message: string }>();
  
  await Promise.all(
    configs.map(async config => {
      const result = await checkProviderHealth(config);
      results.set(config.id, result);
    })
  );
  
  return results;
}

/**
 * Provider 타입별 지원 기능 목록
 */
export const PROVIDER_CAPABILITIES: Record<AIProviderType, string[]> = {
  VLLM: ['chat', 'completion', 'streaming', 'batching'],
  OLLAMA: ['chat', 'completion', 'streaming', 'embedding', 'vision'],
  OPENAI_COMPATIBLE: ['chat', 'completion', 'streaming'],
};

/**
 * Provider 타입별 설명
 */
export const PROVIDER_DESCRIPTIONS: Record<AIProviderType, string> = {
  VLLM: 'vLLM - 고성능 LLM 추론 서버 (배치 처리에 최적화)',
  OLLAMA: 'Ollama - 로컬 LLM 실행 환경 (사용 편의성)',
  OPENAI_COMPATIBLE: 'OpenAI Compatible - 표준 API 지원 서버',
};
