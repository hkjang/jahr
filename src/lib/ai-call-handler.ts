// AI Call Handler
// 통합 AI 호출 처리기 - 로깅, 재시도, PII 마스킹

import { prisma } from './prisma';
import { 
  AIProviderFactory,
  type AIProviderInterface,
  type AICompletionRequest,
  type AICompletionResponse,
  type AIStreamChunk,
  type AIFeatureType,
  type AIProviderConfig,
} from './ai-provider';
import {
  maskPII,
  checkRateLimit,
  generateRequestId,
} from './ai-security';
import { getDefaultModelForFeature, getDefaultProvider } from './ai-config-service';

// ========================================
// Types
// ========================================

export interface AICallOptions {
  featureType: AIFeatureType;
  userId: string;
  systemPrompt?: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  context?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AICallResult {
  success: boolean;
  requestId: string;
  content?: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs?: number;
  error?: string;
  errorCode?: string;
}

// ========================================
// Retry Configuration
// ========================================

const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['TIMEOUT', 'SERVER_ERROR', 'CONNECTION_FAILED'],
};

// ========================================
// AI Call Handler Class
// ========================================

export class AICallHandler {
  private requestId: string;
  private startTime: number = 0;

  constructor() {
    this.requestId = generateRequestId();
  }

  /**
   * AI 호출 실행
   */
  async call(options: AICallOptions): Promise<AICallResult> {
    this.startTime = Date.now();

    try {
      // 1. Rate Limit 체크
      const rateLimitResult = await this.checkRateLimit(options);
      if (!rateLimitResult.allowed) {
        return this.createErrorResult(
          '호출 제한 초과. 잠시 후 다시 시도해주세요.',
          'RATE_LIMITED'
        );
      }

      // 2. Provider 및 모델 설정 가져오기
      const modelConfig = await getDefaultModelForFeature(options.featureType);
      if (!modelConfig) {
        return this.createErrorResult(
          'AI Provider가 설정되지 않았습니다. 관리자에게 문의하세요.',
          'PROVIDER_NOT_CONFIGURED'
        );
      }

      // 3. Provider 인스턴스 생성
      const provider = AIProviderFactory.create(modelConfig.config);

      // 4. 요청 구성
      const request = this.buildRequest(options, modelConfig);

      // 5. 재시도 로직과 함께 호출
      const response = await this.executeWithRetry(provider, request);

      // 6. 로그 기록
      await this.logCall(options, modelConfig.config, response, null);

      return {
        success: true,
        requestId: this.requestId,
        content: response.content,
        model: response.model,
        usage: response.usage,
        latencyMs: response.latencyMs,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorCode = this.getErrorCode(error);

      // 에러 로그 기록
      try {
        const config = await getDefaultProvider();
        if (config) {
          await this.logCall(options, config, null, { message: errorMessage, code: errorCode });
        }
      } catch {
        // 로깅 실패는 무시
      }

      return this.createErrorResult(errorMessage, errorCode);
    }
  }

  /**
   * 스트리밍 AI 호출
   */
  async *callStream(options: AICallOptions): AsyncGenerator<AIStreamChunk, void, unknown> {
    this.startTime = Date.now();

    try {
      // Rate Limit 체크
      const rateLimitResult = await this.checkRateLimit(options);
      if (!rateLimitResult.allowed) {
        yield { content: '', done: true, error: '호출 제한 초과' };
        return;
      }

      // Provider 설정 가져오기
      const modelConfig = await getDefaultModelForFeature(options.featureType);
      if (!modelConfig) {
        yield { content: '', done: true, error: 'AI Provider가 설정되지 않았습니다' };
        return;
      }

      const provider = AIProviderFactory.create(modelConfig.config);
      const request = this.buildRequest(options, modelConfig);
      request.stream = true;

      // 스트리밍 호출
      let fullContent = '';
      for await (const chunk of provider.chatStream(request)) {
        fullContent += chunk.content;
        yield chunk;
      }

      // 로그 기록
      const latencyMs = Date.now() - this.startTime;
      await this.logStreamCall(options, modelConfig.config, fullContent, latencyMs);
    } catch (error) {
      yield {
        content: '',
        done: true,
        error: error instanceof Error ? error.message : '스트리밍 오류',
      };
    }
  }

  /**
   * Rate Limit 체크
   */
  private async checkRateLimit(
    options: AICallOptions
  ): Promise<{ allowed: boolean; remaining?: number }> {
    // Provider 설정에서 Rate Limit 가져오기
    const config = await getDefaultProvider();
    if (!config) {
      return { allowed: true }; // Provider가 없으면 일단 허용
    }

    return checkRateLimit(
      options.userId,
      config.rateLimitPerMinute,
      config.rateLimitPerHour
    );
  }

  /**
   * 요청 빌드
   */
  private buildRequest(
    options: AICallOptions,
    modelConfig: { modelId: string; systemPrompt?: string; config: AIProviderConfig }
  ): AICompletionRequest {
    const messages: AICompletionRequest['messages'] = [];

    // System prompt
    const systemPrompt = options.systemPrompt || modelConfig.systemPrompt;
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    // User message
    messages.push({ role: 'user', content: options.userMessage });

    return {
      messages,
      model: modelConfig.modelId,
      temperature: options.temperature ?? modelConfig.config.temperature,
      maxTokens: options.maxTokens ?? modelConfig.config.maxTokens,
      stream: options.stream ?? false,
      featureType: options.featureType,
    };
  }

  /**
   * 재시도 로직과 함께 실행
   */
  private async executeWithRetry(
    provider: AIProviderInterface,
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    let lastError: Error | null = null;
    let delay = DEFAULT_RETRY_CONFIG.initialDelayMs;

    for (let attempt = 0; attempt <= DEFAULT_RETRY_CONFIG.maxRetries; attempt++) {
      try {
        return await provider.chat(request);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        const errorCode = this.getErrorCode(error);

        // 재시도 가능한 에러인지 확인
        if (
          attempt < DEFAULT_RETRY_CONFIG.maxRetries &&
          DEFAULT_RETRY_CONFIG.retryableErrors.includes(errorCode)
        ) {
          await this.sleep(delay);
          delay = Math.min(
            delay * DEFAULT_RETRY_CONFIG.backoffMultiplier,
            DEFAULT_RETRY_CONFIG.maxDelayMs
          );
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Maximum retries exceeded');
  }

  /**
   * 호출 로그 기록
   */
  private async logCall(
    options: AICallOptions,
    config: AIProviderConfig,
    response: AICompletionResponse | null,
    error: { message: string; code: string } | null
  ): Promise<void> {
    try {
      const latencyMs = Date.now() - this.startTime;

      await prisma.aICallLog.create({
        data: {
          providerId: config.id,
          userId: options.userId,
          featureType: options.featureType,
          modelId: response?.model || config.defaultModel || 'unknown',
          requestSummary: maskPII(options.userMessage).slice(0, 500),
          responseLength: response?.content?.length,
          latencyMs,
          tokenUsage: response?.usage ? {
            promptTokens: response.usage.promptTokens,
            completionTokens: response.usage.completionTokens,
            totalTokens: response.usage.totalTokens,
          } : undefined,
          status: error ? (error.code === 'RATE_LIMITED' ? 'RATE_LIMITED' : 
                         error.code === 'TIMEOUT' ? 'TIMEOUT' : 'ERROR') : 'SUCCESS',
          errorMessage: error?.message,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
        },
      });
    } catch (logError) {
      console.error('Failed to log AI call:', logError);
    }
  }

  /**
   * 스트리밍 호출 로그 기록
   */
  private async logStreamCall(
    options: AICallOptions,
    config: AIProviderConfig,
    fullContent: string,
    latencyMs: number
  ): Promise<void> {
    try {
      await prisma.aICallLog.create({
        data: {
          providerId: config.id,
          userId: options.userId,
          featureType: options.featureType,
          modelId: config.defaultModel || 'unknown',
          requestSummary: maskPII(options.userMessage).slice(0, 500),
          responseLength: fullContent.length,
          latencyMs,
          status: 'SUCCESS',
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
        },
      });
    } catch (logError) {
      console.error('Failed to log AI stream call:', logError);
    }
  }

  /**
   * 에러 코드 추출
   */
  private getErrorCode(error: unknown): string {
    if (error && typeof error === 'object' && 'code' in error) {
      return String((error as { code: unknown }).code);
    }
    if (error instanceof Error) {
      if (error.message.includes('timeout')) return 'TIMEOUT';
      if (error.message.includes('rate')) return 'RATE_LIMITED';
      if (error.message.includes('connection')) return 'CONNECTION_FAILED';
    }
    return 'UNKNOWN';
  }

  /**
   * 에러 결과 생성
   */
  private createErrorResult(message: string, code: string): AICallResult {
    return {
      success: false,
      requestId: this.requestId,
      error: message,
      errorCode: code,
      latencyMs: Date.now() - this.startTime,
    };
  }

  /**
   * Sleep 유틸리티
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ========================================
// Convenience Functions
// ========================================

/**
 * 간단한 AI 호출
 */
export async function callAI(options: AICallOptions): Promise<AICallResult> {
  const handler = new AICallHandler();
  return handler.call(options);
}

/**
 * 스트리밍 AI 호출
 */
export function callAIStream(options: AICallOptions): AsyncGenerator<AIStreamChunk, void, unknown> {
  const handler = new AICallHandler();
  return handler.callStream(options);
}

/**
 * 기능별 프롬프트 적용 AI 호출
 */
export async function callAIWithFeature(
  featureType: AIFeatureType,
  userMessage: string,
  userId: string,
  options?: Partial<AICallOptions>
): Promise<AICallResult> {
  return callAI({
    featureType,
    userMessage,
    userId,
    ...options,
  });
}

// ========================================
// Feature-specific Helpers
// ========================================

/**
 * HR 요약 생성
 */
export async function generateHRSummary(
  content: string,
  userId: string
): Promise<AICallResult> {
  return callAI({
    featureType: 'HR_SUMMARY',
    userId,
    systemPrompt: '당신은 HR 전문가입니다. 주어진 인사 데이터를 간결하고 명확하게 요약해주세요.',
    userMessage: `다음 내용을 요약해주세요:\n\n${content}`,
  });
}

/**
 * AI 추천 생성
 */
export async function generateAIRecommendation(
  context: string,
  userId: string
): Promise<AICallResult> {
  return callAI({
    featureType: 'AI_RECOMMENDATION',
    userId,
    systemPrompt: '당신은 HR 분석 전문가입니다. 데이터를 기반으로 합리적인 추천을 제공해주세요.',
    userMessage: context,
  });
}

/**
 * 규정 QA
 */
export async function answerRegulationQuestion(
  question: string,
  userId: string
): Promise<AICallResult> {
  return callAI({
    featureType: 'REGULATION_QA',
    userId,
    systemPrompt: '당신은 HR 규정 전문가입니다. 인사 규정에 대한 질문에 정확하게 답변해주세요.',
    userMessage: question,
  });
}

/**
 * 문서 생성
 */
export async function generateDocument(
  template: string,
  variables: Record<string, string>,
  userId: string
): Promise<AICallResult> {
  const prompt = Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replace(`{{${key}}}`, value),
    template
  );

  return callAI({
    featureType: 'DOCUMENT_GENERATION',
    userId,
    systemPrompt: '당신은 HR 문서 작성 전문가입니다. 주어진 템플릿을 바탕으로 전문적인 문서를 작성해주세요.',
    userMessage: prompt,
  });
}

/**
 * 감정 분석
 */
export async function analyzeSentiment(
  text: string,
  userId: string
): Promise<AICallResult> {
  return callAI({
    featureType: 'SENTIMENT_ANALYSIS',
    userId,
    systemPrompt: '당신은 감정 분석 전문가입니다. 텍스트의 감정을 분석하고 긍정/부정/중립으로 분류해주세요.',
    userMessage: text,
  });
}
