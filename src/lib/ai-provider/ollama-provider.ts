// Ollama Provider Implementation
// OpenAI Compatible API for Ollama Server

import { BaseAIProvider } from './base';
import type { 
  AIProviderType, 
  AIModelInfo, 
  AIConnectionTestResult 
} from '@/types/ai-provider';

// Ollama native API types (for additional features)
interface OllamaModelDetails {
  format: string;
  family: string;
  families?: string[];
  parameter_size: string;
  quantization_level: string;
}

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: OllamaModelDetails;
}

interface OllamaTagsResponse {
  models: OllamaModel[];
}

interface OllamaVersionResponse {
  version: string;
}

/**
 * Ollama Provider
 * 
 * Ollama 서버와의 OpenAI Compatible API 연동
 * 기본 엔드포인트: http://localhost:11434
 * 
 * Ollama는 OpenAI Compatible API (/v1/*)와 Native API (/api/*)를 모두 지원
 */
export class OllamaProvider extends BaseAIProvider {
  readonly type: AIProviderType = 'OLLAMA';

  /**
   * Ollama 연결 테스트
   * 버전 정보도 함께 조회
   */
  async testConnection(): Promise<AIConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      // Ollama native API로 버전 확인
      const version = await this.getVersion().catch(() => undefined);
      const models = await this.listModels();
      const latencyMs = Date.now() - startTime;
      
      return {
        success: true,
        message: `연결 성공 (${models.length}개 모델 발견)`,
        latencyMs,
        modelCount: models.length,
        serverVersion: version,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      return {
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        latencyMs,
      };
    }
  }

  /**
   * Ollama 버전 조회
   */
  async getVersion(): Promise<string> {
    const response = await this.fetch<OllamaVersionResponse>('/api/version');
    return response.version;
  }

  /**
   * Ollama 모델 목록 조회
   * Native API를 사용하여 더 상세한 정보 얻기
   */
  async listModels(): Promise<AIModelInfo[]> {
    try {
      // Ollama native API로 상세 정보 조회
      const response = await this.fetch<OllamaTagsResponse>('/api/tags');
      
      return response.models.map(model => ({
        id: model.name,
        modelId: model.name,
        displayName: this.formatModelName(model.name),
        description: this.formatModelDescription(model),
        contextLength: this.estimateContextLength(model.details.parameter_size),
        capabilities: this.getCapabilities(model),
        isAvailable: true,
      }));
    } catch {
      // Fallback to OpenAI compatible API
      return await super.listModels();
    }
  }

  /**
   * 모델 이름 포맷팅
   */
  private formatModelName(name: string): string {
    // Remove tag suffix if present (e.g., "llama3.2:latest" -> "llama3.2")
    const baseName = name.split(':')[0];
    return baseName;
  }

  /**
   * 모델 설명 생성
   */
  private formatModelDescription(model: OllamaModel): string {
    const parts: string[] = [];
    
    if (model.details.family) {
      parts.push(`Family: ${model.details.family}`);
    }
    if (model.details.parameter_size) {
      parts.push(`Size: ${model.details.parameter_size}`);
    }
    if (model.details.quantization_level) {
      parts.push(`Quant: ${model.details.quantization_level}`);
    }
    
    return parts.join(', ') || undefined as unknown as string;
  }

  /**
   * 파라미터 크기에서 컨텍스트 길이 추정
   */
  private estimateContextLength(paramSize: string): number | undefined {
    // 일반적인 휴리스틱
    const sizeMatch = paramSize.match(/(\d+(?:\.\d+)?)\s*(B|M|K)?/i);
    if (!sizeMatch) return undefined;
    
    const size = parseFloat(sizeMatch[1]);
    const unit = (sizeMatch[2] || 'B').toUpperCase();
    
    // 파라미터 수 (B 기준)
    let params = size;
    if (unit === 'M') params = size / 1000;
    if (unit === 'K') params = size / 1000000;
    
    // 큰 모델일수록 더 긴 컨텍스트 지원 경향
    if (params >= 70) return 128000;
    if (params >= 30) return 32768;
    if (params >= 7) return 8192;
    return 4096;
  }

  /**
   * 모델 기능 추정
   */
  private getCapabilities(model: OllamaModel): string[] {
    const caps = ['chat', 'completion'];
    
    const name = model.name.toLowerCase();
    
    // Vision 모델
    if (name.includes('vision') || name.includes('llava')) {
      caps.push('vision');
    }
    
    // Embedding 모델
    if (name.includes('embed') || name.includes('nomic-embed')) {
      caps.push('embedding');
    }
    
    // Code 모델
    if (name.includes('code') || name.includes('deepseek-coder') || name.includes('starcoder')) {
      caps.push('code');
    }
    
    return caps;
  }
}

/**
 * Ollama Provider 기본 설정
 */
export const OLLAMA_DEFAULT_CONFIG = {
  baseUrl: 'http://localhost:11434',
  timeout: 120000, // Ollama는 모델 로딩에 시간이 걸릴 수 있음
  maxTokens: 2048,
  temperature: 0.7,
  streamingEnabled: true,
  rateLimitPerMinute: 60,
  rateLimitPerHour: 1000,
};
