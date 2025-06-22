import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { estudoService } from '../services/estudoService';

interface FormularioEstudoProps {
  onEstudoCriado: () => void;
}

export function FormularioEstudo({ onEstudoCriado }: FormularioEstudoProps) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    concurso: '',
    cargo: '',
    materia: '',
    assunto: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!currentUser) return;

    // Validação básica
    if (!formData.concurso || !formData.cargo || !formData.materia || !formData.assunto) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await estudoService.criarEstudo({
        ...formData,
        userId: currentUser.uid
      });

      // Limpar formulário
      setFormData({
        concurso: '',
        cargo: '',
        materia: '',
        assunto: ''
      });

      onEstudoCriado();
      alert('Estudo criado com sucesso!');
    } catch (error) {
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
            <label htmlFor="concurso" className="block text-sm font-medium text-gray-700 mb-2">
              Concurso *
            </label>
            <input
              type="text"
              id="concurso"
              name="concurso"
              value={formData.concurso}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Concurso da Polícia Federal"
              required
            />
          </div>

          <div>
            <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-2">
              Cargo *
            </label>
            <input
              type="text"
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Delegado de Polícia Federal"
              required
            />
          </div>

          <div>
            <label htmlFor="materia" className="block text-sm font-medium text-gray-700 mb-2">
              Matéria *
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
            />
          </div>

          <div>
            <label htmlFor="assunto" className="block text-sm font-medium text-gray-700 mb-2">
              Assunto *
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
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  concurso: '',
                  cargo: '',
                  materia: '',
                  assunto: ''
                });
                setError('');
              }}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Limpar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Estudo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 