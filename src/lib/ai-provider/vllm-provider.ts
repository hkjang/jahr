// vLLM Provider Implementation
// OpenAI Compatible API for vLLM Server

import { BaseAIProvider } from './base';
import type { AIProviderType, AIModelInfo } from '@/types/ai-provider';

// vLLM specific model info response
interface VLLMModelInfo {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
  max_model_len?: number;
}

interface VLLMModelsResponse {
  object: string;
  data: VLLMModelInfo[];
}

/**
 * vLLM Provider
 * 
 * vLLM 서버와의 OpenAI Compatible API 연동
 * 기본 엔드포인트: http://localhost:8000
 */
export class VLLMProvider extends BaseAIProvider {
  readonly type: AIProviderType = 'VLLM';

  /**
   * vLLM 모델 목록 조회
   * vLLM은 max_model_len 정보를 제공함
   */
  async listModels(): Promise<AIModelInfo[]> {
    const response = await this.fetch<VLLMModelsResponse>('/v1/models');
    
    return response.data.map(model => ({
      id: model.id,
      modelId: model.id,
      displayName: this.formatModelName(model.id),
      description: model.owned_by ? `Owner: ${model.owned_by}` : undefined,
      contextLength: model.max_model_len,
      capabilities: ['chat', 'completion'],
      isAvailable: true,
    }));
  }

  /**
   * 모델 이름 포맷팅
   * 예: "Qwen/Qwen2.5-7B-Instruct" -> "Qwen2.5-7B-Instruct"
   */
  private formatModelName(modelId: string): string {
    // Remove organization prefix if present
    if (modelId.includes('/')) {
      return modelId.split('/').pop() || modelId;
    }
    return modelId;
  }
}

/**
 * vLLM Provider 기본 설정
 */
export const VLLM_DEFAULT_CONFIG = {
  baseUrl: 'http://localhost:8000',
  timeout: 60000, // vLLM은 모델 로딩에 시간이 걸릴 수 있음
  maxTokens: 2048,
  temperature: 0.7,
  streamingEnabled: true,
  rateLimitPerMinute: 60,
  rateLimitPerHour: 1000,
};
