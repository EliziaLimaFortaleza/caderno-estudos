import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Estudo, Questao } from '../types';
import { questaoService } from '../services/questaoService';

interface CadernoErrosProps {
  estudos: Estudo[];
}

export function CadernoErros({ estudos }: CadernoErrosProps) {
  const { currentUser } = useAuth();
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    estudoId: '',
    enunciado: '',
    comentario: '',
    acertou: undefined as boolean | undefined
  });

  useEffect(() => {
    if (currentUser) {
      carregarQuestoes();
    }
  }, [currentUser]);

  async function carregarQuestoes() {
    if (!currentUser) return;

    try {
      setLoading(true);
      const questoesData = await questaoService.buscarQuestoesPorUsuario(currentUser.uid);
      setQuestoes(questoesData);
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!currentUser) return;

    if (!formData.estudoId || !formData.enunciado) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editandoId) {
        await questaoService.atualizarQuestao(editandoId, formData);
        alert('Questão atualizada com sucesso!');
      } else {
        await questaoService.criarQuestao({
          ...formData,
          userId: currentUser.uid
        });
        alert('Questão criada com sucesso!');
      }

      limparFormulario();
      await carregarQuestoes();
    } catch (error) {
      console.error('Erro ao salvar questão:', error);
      alert('Erro ao salvar questão');
    }
  }

  async function handleDeletar(id: string) {
    if (window.confirm('Tem certeza que deseja deletar esta questão?')) {
      try {
        await questaoService.deletarQuestao(id);
        await carregarQuestoes();
      } catch (error) {
        console.error('Erro ao deletar questão:', error);
        alert('Erro ao deletar questão');
      }
    }
  }

  async function handleMarcarQuestao(id: string, acertou: boolean) {
    try {
      await questaoService.marcarQuestao(id, acertou);
      await carregarQuestoes();
    } catch (error) {
      console.error('Erro ao marcar questão:', error);
      alert('Erro ao marcar questão');
    }
  }

  function iniciarEdicao(questao: Questao) {
    setEditandoId(questao.id);
    setFormData({
      estudoId: questao.estudoId,
      enunciado: questao.enunciado,
      comentario: questao.comentario,
      acertou: questao.acertou
    });
    setMostrarFormulario(true);
  }

  function limparFormulario() {
    setFormData({
      estudoId: '',
      enunciado: '',
      comentario: '',
      acertou: undefined
    });
    setEditandoId(null);
    setMostrarFormulario(false);
  }

  function obterEstudo(questao: Questao): Estudo | undefined {
    return estudos.find(estudo => estudo.id === questao.estudoId);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Caderno de Erros</h2>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          {mostrarFormulario ? 'Cancelar' : 'Nova Questão'}
        </button>
      </div>

      {/* Formulário */}
      {mostrarFormulario && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editandoId ? 'Editar Questão' : 'Nova Questão'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="estudoId" className="block text-sm font-medium text-gray-700 mb-2">
                Assunto *
              </label>
              <select
                id="estudoId"
                name="estudoId"
                value={formData.estudoId}
                onChange={(e) => setFormData({...formData, estudoId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Selecione um assunto</option>
                {estudos.map((estudo) => (
                  <option key={estudo.id} value={estudo.id}>
                    {estudo.materia} - {estudo.assunto}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="enunciado" className="block text-sm font-medium text-gray-700 mb-2">
                Enunciado da Questão *
              </label>
              <textarea
                id="enunciado"
                name="enunciado"
                value={formData.enunciado}
                onChange={(e) => setFormData({...formData, enunciado: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Digite o enunciado da questão..."
                required
              />
            </div>

            <div>
              <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-2">
                Comentário Pessoal
              </label>
              <textarea
                id="comentario"
                name="comentario"
                value={formData.comentario}
                onChange={(e) => setFormData({...formData, comentario: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Seus comentários sobre a questão, explicações, etc..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                {editandoId ? 'Atualizar' : 'Criar'} Questão
              </button>
              <button
                type="button"
                onClick={limparFormulario}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de questões */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Minhas Questões ({questoes.length})</h3>
        
        {questoes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhuma questão cadastrada ainda.</p>
            <p className="text-gray-400 text-sm mt-2">Comece criando sua primeira questão!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questoes.map((questao) => {
              const estudo = obterEstudo(questao);
              
              return (
                <div key={questao.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      {estudo && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Assunto:</span> {estudo.materia} - {estudo.assunto}
                        </div>
                      )}
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {questao.enunciado}
                      </h4>
                      {questao.comentario && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          <span className="font-medium">Comentário:</span> {questao.comentario}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => iniciarEdicao(questao)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-yellow-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletar(questao.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>

                  {/* Controles de acerto/erro */}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">Resultado:</span>
                    <button
                      onClick={() => handleMarcarQuestao(questao.id, true)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        questao.acertou === true
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      ✓ Acertou
                    </button>
                    <button
                      onClick={() => handleMarcarQuestao(questao.id, false)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        questao.acertou === false
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                      }`}
                    >
                      ✗ Errou
                    </button>
                    {questao.acertou !== undefined && (
                      <span className="text-sm text-gray-500">
                        {questao.acertou ? '✓ Acertou' : '✗ Errou'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 