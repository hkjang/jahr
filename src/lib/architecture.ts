// 아키텍처 패턴 및 확장성 유틸리티
// Phase 8: 모듈 구조, 플러그인, 이벤트 기반, 캐시, 멀티 테넌시

// ========================================
// 타입 정의
// ========================================

export interface HRModule {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  dependencies?: string[];
  initialize: () => Promise<void>;
  shutdown: () => Promise<void>;
}

export interface HRPlugin {
  id: string;
  name: string;
  version: string;
  type: "integration" | "extension" | "custom";
  hooks: PluginHook[];
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
}

export interface PluginHook {
  event: string;
  handler: (data: unknown) => Promise<unknown>;
  priority?: number;
}

export interface HREvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  source: string;
  userId?: string;
}

export type EventHandler = (event: HREvent) => Promise<void>;

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: Date;
  tags?: string[];
}

// ========================================
// 모듈 관리 서비스
// ========================================

export class ModuleRegistry {
  private static modules = new Map<string, HRModule>();

  /**
   * 모듈 등록
   */
  static register(module: HRModule): void {
    this.modules.set(module.id, module);
    console.log(`[ModuleRegistry] Registered: ${module.name} v${module.version}`);
  }

  /**
   * 모듈 초기화
   */
  static async initialize(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) throw new Error(`Module not found: ${moduleId}`);

    // 의존성 확인
    if (module.dependencies) {
      for (const depId of module.dependencies) {
        const dep = this.modules.get(depId);
        if (!dep?.enabled) {
          throw new Error(`Dependency not met: ${depId}`);
        }
      }
    }

    await module.initialize();
    module.enabled = true;
    console.log(`[ModuleRegistry] Initialized: ${module.name}`);
  }

  /**
   * 전체 모듈 초기화
   */
  static async initializeAll(): Promise<void> {
    for (const module of this.modules.values()) {
      if (!module.enabled) {
        try {
          await this.initialize(module.id);
        } catch (error) {
          console.error(`[ModuleRegistry] Failed to initialize ${module.name}:`, error);
        }
      }
    }
  }

  /**
   * 모듈 종료
   */
  static async shutdown(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) return;

    await module.shutdown();
    module.enabled = false;
    console.log(`[ModuleRegistry] Shutdown: ${module.name}`);
  }

  /**
   * 등록된 모듈 목록
   */
  static getModules(): HRModule[] {
    return Array.from(this.modules.values());
  }
}

// ========================================
// 플러그인 시스템
// ========================================

export class PluginManager {
  private static plugins = new Map<string, HRPlugin>();
  private static hooks = new Map<string, PluginHook[]>();

  /**
   * 플러그인 설치
   */
  static async install(plugin: HRPlugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin already installed: ${plugin.id}`);
    }

    // 설치 콜백
    if (plugin.onInstall) {
      await plugin.onInstall();
    }

    // 훅 등록
    for (const hook of plugin.hooks) {
      if (!this.hooks.has(hook.event)) {
        this.hooks.set(hook.event, []);
      }
      this.hooks.get(hook.event)!.push(hook);
      this.hooks.get(hook.event)!.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }

    this.plugins.set(plugin.id, plugin);
    console.log(`[PluginManager] Installed: ${plugin.name} v${plugin.version}`);
  }

  /**
   * 플러그인 제거
   */
  static async uninstall(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    // 제거 콜백
    if (plugin.onUninstall) {
      await plugin.onUninstall();
    }

    // 훅 제거
    for (const hook of plugin.hooks) {
      const eventHooks = this.hooks.get(hook.event);
      if (eventHooks) {
        const index = eventHooks.indexOf(hook);
        if (index > -1) eventHooks.splice(index, 1);
      }
    }

    this.plugins.delete(pluginId);
    console.log(`[PluginManager] Uninstalled: ${plugin.name}`);
  }

  /**
   * 훅 실행
   */
  static async executeHooks<T>(event: string, data: T): Promise<T> {
    const hooks = this.hooks.get(event) || [];
    let result: unknown = data;

    for (const hook of hooks) {
      result = await hook.handler(result);
    }

    return result as T;
  }

  /**
   * 설치된 플러그인 목록
   */
  static getPlugins(): HRPlugin[] {
    return Array.from(this.plugins.values());
  }
}

// ========================================
// 이벤트 버스
// ========================================

export class EventBus {
  private static handlers = new Map<string, Set<EventHandler>>();
  private static history: HREvent[] = [];

  /**
   * 이벤트 구독
   */
  static subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // 구독 해제 함수 반환
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * 이벤트 발행
   */
  static async publish(
    eventType: string,
    payload: Record<string, unknown>,
    source: string = "system"
  ): Promise<void> {
    const event: HREvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: eventType,
      payload,
      timestamp: new Date(),
      source,
    };

    // 히스토리 기록
    this.history.unshift(event);
    if (this.history.length > 1000) {
      this.history = this.history.slice(0, 1000);
    }

    // 핸들러 실행
    const handlers = this.handlers.get(eventType) || new Set();
    const wildcardHandlers = this.handlers.get("*") || new Set();

    const allHandlers = [...handlers, ...wildcardHandlers];

    await Promise.allSettled(
      allHandlers.map((handler) => handler(event))
    );

    console.log(`[EventBus] Published: ${eventType}`);
  }

  /**
   * 이벤트 히스토리 조회
   */
  static getHistory(eventType?: string, limit: number = 100): HREvent[] {
    let filtered = this.history;
    if (eventType) {
      filtered = filtered.filter((e) => e.type === eventType);
    }
    return filtered.slice(0, limit);
  }
}

// 주요 HR 이벤트 타입
export const HR_EVENTS = {
  // 직원 관련
  EMPLOYEE_CREATED: "employee.created",
  EMPLOYEE_UPDATED: "employee.updated",
  EMPLOYEE_TERMINATED: "employee.terminated",

  // 근태 관련
  ATTENDANCE_CHECKED_IN: "attendance.checked_in",
  ATTENDANCE_CHECKED_OUT: "attendance.checked_out",
  ATTENDANCE_ANOMALY: "attendance.anomaly",

  // 휴가 관련
  LEAVE_REQUESTED: "leave.requested",
  LEAVE_APPROVED: "leave.approved",
  LEAVE_REJECTED: "leave.rejected",

  // 평가 관련
  EVALUATION_STARTED: "evaluation.started",
  EVALUATION_COMPLETED: "evaluation.completed",

  // 급여 관련
  SALARY_CALCULATED: "salary.calculated",
  SALARY_PAID: "salary.paid",

  // 발령 관련
  APPOINTMENT_SCHEDULED: "appointment.scheduled",
  APPOINTMENT_EXECUTED: "appointment.executed",
};

// ========================================
// 캐시 서비스
// ========================================

export class CacheService {
  private static cache = new Map<string, CacheEntry<unknown>>();
  private static cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * 초기화 (자동 정리 시작)
   */
  static initialize(): void {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // 1분마다 정리
  }

  /**
   * 캐시 설정
   */
  static set<T>(key: string, value: T, ttlSeconds: number = 300, tags?: string[]): void {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    this.cache.set(key, { key, value, expiresAt, tags });
  }

  /**
   * 캐시 조회
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  /**
   * 캐시 또는 조회
   */
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const value = await fetcher();
    this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * 캐시 삭제
   */
  static delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 태그별 캐시 삭제
   */
  static deleteByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * 전체 캐시 삭제
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * 만료된 캐시 정리
   */
  private static cleanup(): void {
    const now = new Date();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 캐시 통계
   */
  static getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// ========================================
// 멀티 테넌시 컨텍스트
// ========================================

export class TenantContext {
  private static currentTenantId: string | null = null;
  private static tenantData = new Map<string, Record<string, unknown>>();

  /**
   * 현재 테넌트 설정
   */
  static set(tenantId: string): void {
    this.currentTenantId = tenantId;
  }

  /**
   * 현재 테넌트 조회
   */
  static get(): string | null {
    return this.currentTenantId;
  }

  /**
   * 테넌트 데이터 저장
   */
  static setData(key: string, value: unknown): void {
    if (!this.currentTenantId) return;
    
    if (!this.tenantData.has(this.currentTenantId)) {
      this.tenantData.set(this.currentTenantId, {});
    }
    this.tenantData.get(this.currentTenantId)![key] = value;
  }

  /**
   * 테넌트 데이터 조회
   */
  static getData<T>(key: string): T | undefined {
    if (!this.currentTenantId) return undefined;
    return this.tenantData.get(this.currentTenantId)?.[key] as T;
  }

  /**
   * 컨텍스트 초기화
   */
  static clear(): void {
    this.currentTenantId = null;
  }
}

// 초기화
CacheService.initialize();
