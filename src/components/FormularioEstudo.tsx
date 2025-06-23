import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { estudoService } from '../services/estudoService';
import { sanitizeInput } from '../utils/validation';

interface FormularioEstudoProps {
  onEstudoCriado: () => void;
}

export function FormularioEstudo({ onEstudoCriado }: FormularioEstudoProps) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    materia: '',
    assunto: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!currentUser) return;

    // Sanitizar inputs
    const sanitizedMateria = sanitizeInput(formData.materia);
    const sanitizedAssunto = sanitizeInput(formData.assunto);

    // Validação básica
    if (!sanitizedMateria || !sanitizedAssunto) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    // Validação de comprimento
    if (sanitizedMateria.length < 2) {
      setError('A matéria deve ter pelo menos 2 caracteres');
      return;
    }

    if (sanitizedAssunto.length < 5) {
      setError('O assunto deve ter pelo menos 5 caracteres');
      return;
    }

    if (sanitizedMateria.length > 100) {
      setError('A matéria deve ter no máximo 100 caracteres');
      return;
    }

    if (sanitizedAssunto.length > 1000) {
      setError('O assunto deve ter no máximo 1000 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await estudoService.criarEstudo({
        materia: sanitizedMateria,
        assunto: sanitizedAssunto,
        userId: currentUser.uid
      });

      // Limpar formulário
      setFormData({
        materia: '',
        assunto: ''
      });

      onEstudoCriado();
      alert('Estudo criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar estudo:', error);
      setError('Erro ao criar estudo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Novo Estudo</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="materia" className="block text-sm font-medium text-gray-700 mb-2">
              Matéria * (2-100 caracteres)
            </label>
            <input
              type="text"
              id="materia"
              name="materia"
              value={formData.materia}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Direito Constitucional"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="assunto" className="block text-sm font-medium text-gray-700 mb-2">
              Assunto * (5-1000 caracteres)
            </label>
            <textarea
              id="assunto"
              name="assunto"
              value={formData.assunto}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Princípios fundamentais da Constituição Federal"
              required
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.assunto.length}/1000 caracteres
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Estudo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 