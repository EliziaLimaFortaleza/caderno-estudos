import DOMPurify from 'dompurify';
import { SECURITY_CONFIG, COMMON_PASSWORDS } from '../config/security';

// Validação de força da senha
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0-4 (muito fraco a muito forte)
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Verificar comprimento mínimo
  if (password.length < SECURITY_CONFIG.PASSWORD.MIN_LENGTH) {
    errors.push(`A senha deve ter pelo menos ${SECURITY_CONFIG.PASSWORD.MIN_LENGTH} caracteres`);
  } else {
    score += 1;
  }

  // Verificar se contém letra maiúscula
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  } else {
    score += 1;
  }

  // Verificar se contém letra minúscula
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  } else {
    score += 1;
  }

  // Verificar se contém número
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  } else {
    score += 1;
  }

  // Verificar se contém caractere especial
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  } else {
    score += 1;
  }

  // Verificar senhas comuns
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('A senha não pode ser uma senha comum');
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 4)
  };
}

// Sanitização de dados
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input.trim());
}

// Validação de email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= SECURITY_CONFIG.INPUT_VALIDATION.EMAIL_MAX_LENGTH;
}

// Rate limiting simples (para uso no frontend)
export class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = SECURITY_CONFIG.RATE_LIMIT.MAX_ATTEMPTS, windowMs: number = SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset se passou o tempo da janela
    if (now - attempt.lastAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Verificar se excedeu o limite
    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    // Incrementar contador
    attempt.count += 1;
    attempt.lastAttempt = now;
    return true;
  }

  getRemainingAttempts(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - attempt.count);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
} 