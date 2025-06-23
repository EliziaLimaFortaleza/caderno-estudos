// Configurações de segurança da aplicação

export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutos
    LOGIN_MAX_ATTEMPTS: 5,
    SIGNUP_MAX_ATTEMPTS: 3,
  },

  // Validação de senha
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    MAX_LENGTH: 128,
  },

  // Validação de inputs
  INPUT_VALIDATION: {
    EMAIL_MAX_LENGTH: 254,
    MATERIA_MIN_LENGTH: 2,
    MATERIA_MAX_LENGTH: 100,
    ASSUNTO_MIN_LENGTH: 5,
    ASSUNTO_MAX_LENGTH: 1000,
    ENUNCIADO_MIN_LENGTH: 10,
    ENUNCIADO_MAX_LENGTH: 2000,
    COMENTARIO_MAX_LENGTH: 500,
  },

  // Timeouts
  TIMEOUTS: {
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
    REQUEST_TIMEOUT: 10000, // 10 segundos
  },

  // Configurações de CSP (Content Security Policy)
  CSP: {
    DEFAULT_SRC: ["'self'"],
    SCRIPT_SRC: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.gstatic.com", "https://www.googleapis.com"],
    STYLE_SRC: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    FONT_SRC: ["'self'", "https://fonts.gstatic.com"],
    IMG_SRC: ["'self'", "data:", "https:"],
    CONNECT_SRC: [
      "'self'",
      "https://firestore.googleapis.com",
      "https://identitytoolkit.googleapis.com",
      "https://securetoken.googleapis.com",
      "wss://s-usc1c-nss-2001.firebaseio.com"
    ],
  },
};

// Lista de senhas comuns que devem ser bloqueadas
export const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123',
  'password123', 'admin', 'letmein', 'welcome', 'monkey',
  'senha', '12345678', '1234', '12345', '1234567', '1234567890',
  'password1', 'password123', 'admin123', 'root', 'toor',
  'test', 'guest', 'user', 'demo', 'sample', 'example',
  '123123', '111111', '000000', '123321', '654321',
  'qwerty123', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  'iloveyou', 'princess', 'rockyou', 'master', 'hello',
  'freedom', 'whatever', 'trustno1', 'dragon', 'baseball',
  'superman', 'batman', 'shadow', 'michael', 'football',
  'mustang', 'access', 'flower', 'hello123', 'letmein123',
  'welcome123', 'monkey123', 'dragon123', 'master123',
];

// Configurações de logging de segurança
export const SECURITY_LOGGING = {
  ENABLED: true,
  LOG_LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
  },
  EVENTS_TO_LOG: [
    'login_attempt',
    'login_success',
    'login_failure',
    'signup_attempt',
    'signup_success',
    'signup_failure',
    'rate_limit_exceeded',
    'invalid_input',
    'xss_attempt',
    'sql_injection_attempt',
  ],
};

// Função para verificar se a aplicação está em modo de desenvolvimento
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// Função para verificar se a aplicação está em modo de produção
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

// Função para obter configurações baseadas no ambiente
export const getSecurityConfig = () => {
  if (isProduction()) {
    return {
      ...SECURITY_CONFIG,
      RATE_LIMIT: {
        ...SECURITY_CONFIG.RATE_LIMIT,
        MAX_ATTEMPTS: 3, // Mais restritivo em produção
      },
    };
  }
  return SECURITY_CONFIG;
}; 