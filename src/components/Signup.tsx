import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { validatePassword, validateEmail, sanitizeInput, RateLimiter } from '../utils/validation';

interface SignupProps {
  onToggleMode: () => void;
}

// Instância global do rate limiter
const rateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 tentativas em 15 minutos

export function Signup({ onToggleMode }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<any>(null);
  const { signup } = useAuth();

  // Validar senha em tempo real
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (newPassword.length > 0) {
      const validation = validatePassword(newPassword);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  };

  // Validar email em tempo real
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = sanitizeInput(e.target.value);
    setEmail(newEmail);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Sanitizar inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = password; // Senha não deve ser sanitizada

    // Validações
    if (!validateEmail(sanitizedEmail)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
      return;
    }

    // Rate limiting
    const clientKey = `signup_${sanitizedEmail}`;
    if (!rateLimiter.isAllowed(clientKey)) {
      const remainingAttempts = rateLimiter.getRemainingAttempts(clientKey);
      setError(`Muitas tentativas. Tente novamente em alguns minutos. Tentativas restantes: ${remainingAttempts}`);
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signup(sanitizedEmail, sanitizedPassword);
      rateLimiter.reset(clientKey); // Reset rate limiter em caso de sucesso
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      // Mensagens de erro mais específicas sem revelar informações sensíveis
      if (error.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso. Tente fazer login ou use outro email.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email inválido. Verifique o formato do email.');
      } else if (error.code === 'auth/weak-password') {
        setError('Senha muito fraca. Use uma senha mais forte.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else {
        setError('Erro ao criar conta. Verifique seus dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  // Função para obter a cor da força da senha
  const getPasswordStrengthColor = () => {
    if (!passwordValidation) return 'bg-gray-200';
    switch (passwordValidation.score) {
      case 0: case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  // Função para obter o texto da força da senha
  const getPasswordStrengthText = () => {
    if (!passwordValidation) return '';
    switch (passwordValidation.score) {
      case 0: case 1: return 'Muito fraca';
      case 2: return 'Fraca';
      case 3: return 'Média';
      case 4: return 'Forte';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Criar Conta
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
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirmar Senha
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirmar Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Indicador de força da senha */}
          {passwordValidation && password.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordValidation.score / 4) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{getPasswordStrengthText()}</span>
              </div>
              {passwordValidation.errors.length > 0 && (
                <div className="text-xs text-red-600 space-y-1">
                  {passwordValidation.errors.map((error: string, index: number) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || (passwordValidation && !passwordValidation.isValid)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Já tem uma conta? Entre aqui
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 