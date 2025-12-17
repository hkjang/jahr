// AI Provider Base Class
// OpenAI Compatible API 기반 추상화

import {
  AIProviderError,
  type AIProviderType,
  type AIProviderConfig,
  type AIProviderInterface,
  type AIConnectionTestResult,
  type AIModelInfo,
  type AICompletionRequest,
  type AICompletionResponse,
  type AIStreamChunk,
  type AIChatMessage,
  type AIErrorCode,
} from '@/types/ai-provider';

// ========================================
// OpenAI Compatible API Types
// ========================================

interface OpenAIModel {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
}

interface OpenAIModelsResponse {
  object: string;
  data: OpenAIModel[];
}

interface OpenAIChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenAIChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

// ========================================
// Base Provider Class
// ========================================

export abstract class BaseAIProvider implements AIProviderInterface {
  abstract readonly type: AIProviderType;
  
  constructor(public readonly config: AIProviderConfig) {}

  /**
   * 기본 HTTP 헤더
   */
  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    
    return headers;
  }

  /**
   * API 엔드포인트 URL 생성
   */
  protected getEndpoint(path: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    return `${baseUrl}${path}`;
  }

  /**
   * HTTP 요청 with timeout
   */
  protected async fetch<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(this.getEndpoint(path), {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers as Record<string, string>),
        },
        signal: controller.signal,
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw this.createError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status === 401 ? 'AUTHENTICATION_FAILED' :
          response.status === 429 ? 'RATE_LIMITED' :
          response.status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN',
          new Error(errorText)
        );
      }
      
      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createError('Request timeout', 'TIMEOUT');
      }
      if (this.isAIProviderError(error)) {
        throw error;
      }
      throw this.createError(
        `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CONNECTION_FAILED',
        error instanceof Error ? error : undefined
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 연결 테스트
   */
  async testConnection(): Promise<AIConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      const models = await this.listModels();
      const latencyMs = Date.now() - startTime;
      
      return {
        success: true,
        message: `연결 성공 (${models.length}개 모델 발견)`,
        latencyMs,
        modelCount: models.length,
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
   * 모델 목록 조회
   */
  async listModels(): Promise<AIModelInfo[]> {
    const response = await this.fetch<OpenAIModelsResponse>('/v1/models');
    
    return response.data.map(model => ({
      id: model.id,
      modelId: model.id,
      displayName: model.id,
      description: model.owned_by ? `Owner: ${model.owned_by}` : undefined,
      capabilities: ['chat', 'completion'],
      isAvailable: true,
    }));
  }

  /**
   * 채팅 완성
   */
  async chat(request: AICompletionRequest): Promise<AICompletionResponse> {
    const startTime = Date.now();
    
    const model = request.model || this.config.defaultModel;
    if (!model) {
      throw this.createError('모델이 지정되지 않았습니다', 'INVALID_REQUEST');
    }
    
    const openaiRequest: OpenAIChatCompletionRequest = {
      model,
      messages: request.messages,
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens ?? this.config.maxTokens,
      stream: false,
    };
    
    const response = await this.fetch<OpenAIChatCompletionResponse>(
      '/v1/chat/completions',
      {
        method: 'POST',
        body: JSON.stringify(openaiRequest),
      }
    );
    
    const latencyMs = Date.now() - startTime;
    const choice = response.choices[0];
    
    if (!choice) {
      throw this.createError('응답에 선택지가 없습니다', 'SERVER_ERROR');
    }
    
    return {
      id: response.id,
      content: choice.message.content,
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
      finishReason: this.mapFinishReason(choice.finish_reason),
      latencyMs,
    };
  }

  /**
   * 스트리밍 채팅
   */
  async *chatStream(
    request: AICompletionRequest
  ): AsyncGenerator<AIStreamChunk, void, unknown> {
    const model = request.model || this.config.defaultModel;
    if (!model) {
      yield { content: '', done: true, error: '모델이 지정되지 않았습니다' };
      return;
    }
    
    const openaiRequest: OpenAIChatCompletionRequest = {
      model,
      messages: request.messages,
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens ?? this.config.maxTokens,
      stream: true,
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(this.getEndpoint('/v1/chat/completions'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(openaiRequest),
        signal: controller.signal,
      });
      
      if (!response.ok) {
        yield {
          content: '',
          done: true,
          error: `API 오류: ${response.status} ${response.statusText}`,
        };
        return;
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        yield { content: '', done: true, error: '스트림을 읽을 수 없습니다' };
        return;
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }
          
          try {
            const chunk = JSON.parse(data) as OpenAIStreamChunk;
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) {
              yield { content: delta.content, done: false };
            }
            if (chunk.choices[0]?.finish_reason) {
              yield { content: '', done: true };
              return;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
      
      yield { content: '', done: true };
    } catch (error) {
      yield {
        content: '',
        done: true,
        error: error instanceof Error ? error.message : '스트리밍 오류',
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 에러 생성 헬퍼
   */
  protected createError(
    message: string,
    code: AIErrorCode,
    cause?: Error
  ): AIProviderError {
    return new AIProviderError(message, code, this.type, cause);
  }

  /**
   * AIProviderError 타입 가드
   */
  protected isAIProviderError(error: unknown): error is AIProviderError {
    return (
      error instanceof Error &&
      'code' in error &&
      typeof (error as AIProviderError).code === 'string'
    );
  }

  /**
   * finish_reason 매핑
   */
  protected mapFinishReason(reason: string): 'stop' | 'length' | 'error' {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
      case 'max_tokens':
        return 'length';
      default:
        return 'error';
    }
  }
}

// ========================================
// Utility Functions
// ========================================

/**
 * 메시지를 프롬프트 형식으로 변환
 */
export function formatMessages(messages: AIChatMessage[]): string {
  return messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n\n');
}

/**
 * 토큰 수 추정 (간단한 휴리스틱)
 * 실제 토큰 수는 모델마다 다름
 */
export function estimateTokenCount(text: string): number {
  // 영어: 약 4글자당 1토큰
  // 한글: 약 2글자당 1토큰
  const koreanChars = (text.match(/[\uAC00-\uD7AF]/g) || []).length;
  const otherChars = text.length - koreanChars;
  
  return Math.ceil(koreanChars / 2) + Math.ceil(otherChars / 4);
}
