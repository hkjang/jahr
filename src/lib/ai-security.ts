// AI Security Utilities
// API Key 암호화, PII 마스킹, Rate Limiting

import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// ========================================
// Constants
// ========================================

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

// Environment variable for encryption key
// In production, this should be stored securely (e.g., HSM, secret manager)
const getEncryptionKey = (): Buffer => {
  const key = process.env.AI_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'default-key-for-development-only';
  return createHash('sha256').update(key).digest();
};

// ========================================
// API Key Encryption
// ========================================

/**
 * API Key 암호화
 * AES-256-GCM 사용
 */
export function encryptApiKey(plainKey: string): string {
  if (!plainKey) return '';
  
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plainKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encryptedData (all hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * API Key 복호화
 */
export function decryptApiKey(encryptedKey: string): string {
  if (!encryptedKey) return '';
  
  try {
    const parts = encryptedKey.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted key format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const key = getEncryptionKey();
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    return '';
  }
}

/**
 * API Key 마스킹 (표시용)
 * 예: "sk-abc123xyz789" -> "sk-abc***789"
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '***';
  
  const prefix = key.slice(0, 6);
  const suffix = key.slice(-3);
  return `${prefix}***${suffix}`;
}

// ========================================
// PII Masking
// ========================================

/**
 * PII 패턴 정의
 */
const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // 주민등록번호 (한국)
  { pattern: /\d{6}[-\s]?\d{7}/g, replacement: '[주민등록번호]' },
  
  // 전화번호 (한국)
  { pattern: /01[0-9][-\s]?\d{3,4}[-\s]?\d{4}/g, replacement: '[전화번호]' },
  { pattern: /0[2-6][0-9][-\s]?\d{3,4}[-\s]?\d{4}/g, replacement: '[전화번호]' },
  
  // 이메일
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[이메일]' },
  
  // 계좌번호 (일반적인 패턴)
  { pattern: /\d{3,4}[-\s]?\d{2,6}[-\s]?\d{2,6}[-\s]?\d{2,4}/g, replacement: '[계좌번호]' },
  
  // 신용카드 번호
  { pattern: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g, replacement: '[카드번호]' },
  
  // 사번 (숫자 6-10자리)
  { pattern: /사번[:\s]*\d{6,10}/g, replacement: '사번: [사번]' },
  
  // 이름 패턴 (한글 2-4자) - 주의: 너무 광범위할 수 있음
  // { pattern: /[가-힣]{2,4}(님|씨|사원|대리|과장|차장|부장|이사|상무|전무|부사장|사장)/g, replacement: '[이름]$1' },
];

/**
 * 텍스트에서 PII 마스킹
 */
export function maskPII(text: string): string {
  if (!text) return '';
  
  let masked = text;
  for (const { pattern, replacement } of PII_PATTERNS) {
    masked = masked.replace(pattern, replacement);
  }
  
  return masked;
}

/**
 * 요청 데이터 마스킹 (로깅용)
 */
export function maskRequestForLogging(request: {
  messages?: Array<{ role: string; content: string }>;
  [key: string]: unknown;
}): object {
  const masked = { ...request };
  
  if (masked.messages && Array.isArray(masked.messages)) {
    masked.messages = masked.messages.map(msg => ({
      ...msg,
      content: maskPII(msg.content),
    }));
  }
  
  return masked;
}

// ========================================
// Rate Limiting
// ========================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory rate limit store (for development)
// In production, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate Limit 체크
 */
export function checkRateLimit(
  userId: string,
  limitPerMinute: number,
  limitPerHour: number
): { allowed: boolean; retryAfterMs?: number; remaining: number } {
  const now = Date.now();
  const minuteKey = `${userId}:minute`;
  const hourKey = `${userId}:hour`;
  
  // Minute limit
  const minuteEntry = rateLimitStore.get(minuteKey);
  if (minuteEntry) {
    if (now < minuteEntry.resetAt) {
      if (minuteEntry.count >= limitPerMinute) {
        return {
          allowed: false,
          retryAfterMs: minuteEntry.resetAt - now,
          remaining: 0,
        };
      }
      minuteEntry.count++;
    } else {
      rateLimitStore.set(minuteKey, { count: 1, resetAt: now + 60000 });
    }
  } else {
    rateLimitStore.set(minuteKey, { count: 1, resetAt: now + 60000 });
  }
  
  // Hour limit
  const hourEntry = rateLimitStore.get(hourKey);
  if (hourEntry) {
    if (now < hourEntry.resetAt) {
      if (hourEntry.count >= limitPerHour) {
        return {
          allowed: false,
          retryAfterMs: hourEntry.resetAt - now,
          remaining: 0,
        };
      }
      hourEntry.count++;
    } else {
      rateLimitStore.set(hourKey, { count: 1, resetAt: now + 3600000 });
    }
  } else {
    rateLimitStore.set(hourKey, { count: 1, resetAt: now + 3600000 });
  }
  
  const currentMinuteCount = rateLimitStore.get(minuteKey)?.count || 0;
  return {
    allowed: true,
    remaining: limitPerMinute - currentMinuteCount,
  };
}

/**
 * Rate Limit 초기화 (관리자용)
 */
export function resetRateLimit(userId: string): void {
  rateLimitStore.delete(`${userId}:minute`);
  rateLimitStore.delete(`${userId}:hour`);
}

// ========================================
// Offline Validation
// ========================================

/**
 * URL이 내부망 주소인지 확인
 */
export function isInternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    // 허용된 내부 주소 패턴
    const internalPatterns = [
      'localhost',
      '127.0.0.1',
      '::1',
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // 10.x.x.x
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/, // 172.16-31.x.x
      /^192\.168\.\d{1,3}\.\d{1,3}$/, // 192.168.x.x
      /\.local$/,
      /\.internal$/,
      /\.corp$/,
      /\.lan$/,
    ];
    
    for (const pattern of internalPatterns) {
      if (typeof pattern === 'string') {
        if (hostname === pattern) return true;
      } else {
        if (pattern.test(hostname)) return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * 외부 URL 차단 검증
 */
export function validateOfflineUrl(url: string): { valid: boolean; message: string } {
  if (!url) {
    return { valid: false, message: 'URL이 비어있습니다' };
  }
  
  if (!isInternalUrl(url)) {
    return { 
      valid: false, 
      message: '오프라인망 정책: 외부 URL은 허용되지 않습니다. 내부망 주소를 사용하세요.' 
    };
  }
  
  return { valid: true, message: 'OK' };
}

// ========================================
// Admin Access Check
// ========================================

/**
 * 관리자 권한 확인
 */
export function isAdminUser(userRoles: string[]): boolean {
  const adminRoles = ['admin', 'ADMIN', 'system_admin', 'hr_admin'];
  return userRoles.some(role => adminRoles.includes(role));
}

/**
 * AI 설정 접근 권한 확인
 */
export function canAccessAISettings(userRoles: string[]): boolean {
  // AI 설정은 관리자만 접근 가능
  return isAdminUser(userRoles);
}

// ========================================
// Hash Utilities
// ========================================

/**
 * 문자열 해시 생성 (로깅용 익명화)
 */
export function hashForLogging(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

/**
 * 요청 ID 생성
 */
export function generateRequestId(): string {
  return `req_${randomBytes(12).toString('hex')}`;
}
