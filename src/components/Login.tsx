import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, sanitizeInput, RateLimiter } from '../utils/validation';

interface LoginProps {
  onToggleMode: () => void;
}

// Instância global do rate limiter
const rateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 tentativas em 15 minutos

export function Login({ onToggleMode }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Validar e sanitizar email em tempo real
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = sanitizeInput(e.target.value);
    setEmail(newEmail);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Sanitizar inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = password; // Senha não deve ser sanitizada

    // Validações básicas
    if (!validateEmail(sanitizedEmail)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    if (!sanitizedPassword || sanitizedPassword.length < 1) {
      setError('Por favor, insira sua senha.');
      return;
    }

    // Rate limiting
    const clientKey = `login_${sanitizedEmail}`;
    if (!rateLimiter.isAllowed(clientKey)) {
      const remainingAttempts = rateLimiter.getRemainingAttempts(clientKey);
      setError(`Muitas tentativas de login. Tente novamente em alguns minutos. Tentativas restantes: ${remainingAttempts}`);
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(sanitizedEmail, sanitizedPassword);
      rateLimiter.reset(clientKey); // Reset rate limiter em caso de sucesso
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Mensagens de erro mais específicas sem revelar informações sensíveis
      if (error.code === 'auth/user-not-found') {
        setError('Email ou senha incorretos.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Email ou senha incorretos.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email inválido. Verifique o formato do email.');
      } else if (error.code === 'auth/user-disabled') {
        setError('Esta conta foi desabilitada. Entre em contato com o suporte.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError('Erro ao fazer login. Verifique suas credenciais e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Entrar no Caderno de Estudos
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Não tem uma conta? Cadastre-se
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 