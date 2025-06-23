import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Estudo } from '../types';
import { estudoService } from '../services/estudoService';
import { revisaoService } from '../services/revisaoService';

interface ListaEstudosProps {
  estudos: Estudo[];
  onEstudoAtualizado: () => void;
}

export function ListaEstudos({ estudos, onEstudoAtualizado }: ListaEstudosProps) {
  const { currentUser } = useAuth();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editandoEstudo, setEditandoEstudo] = useState<Partial<Estudo>>({});
  const [mostrarModalRevisao, setMostrarModalRevisao] = useState(false);
  const [estudoParaRevisao, setEstudoParaRevisao] = useState<string | null>(null);
  const [dataRevisao, setDataRevisao] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoEstudo, setNovoEstudo] = useState({
    materia: '',
    assunto: ''
  });
  const [criandoEstudo, setCriandoEstudo] = useState(false);

  async function handleCriarEstudo(e: React.FormEvent) {
    e.preventDefault();
    
    if (!currentUser) return;

    if (!novoEstudo.materia || !novoEstudo.assunto) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      setCriandoEstudo(true);
      await estudoService.criarEstudo({
        ...novoEstudo,
        userId: currentUser.uid
      });

      setNovoEstudo({ materia: '', assunto: '' });
      setMostrarFormulario(false);
      onEstudoAtualizado();
      alert('Estudo criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar estudo:', error);
      alert('Erro ao criar estudo. Tente novamente.');
    } finally {
      setCriandoEstudo(false);
    }
  }

  async function handleDeletar(id: string) {
    if (!currentUser) return;
    
    if (window.confirm('Tem certeza que deseja deletar este estudo?')) {
      try {
        await estudoService.deletarEstudo(id);
        onEstudoAtualizado();
      } catch (error) {
        console.error('Erro ao deletar estudo:', error);
        alert('Erro ao deletar estudo');
      }
    }
  }

  async function handleEditar(id: string) {
    if (!currentUser) return;
    
    try {
      await estudoService.atualizarEstudo(id, editandoEstudo);
      setEditandoId(null);
      setEditandoEstudo({});
      onEstudoAtualizado();
    } catch (error) {
      console.error('Erro ao atualizar estudo:', error);
      alert('Erro ao atualizar estudo');
    }
  }

  function abrirModalRevisao(estudoId: string) {
    setEstudoParaRevisao(estudoId);
    // Definir data padrão (7 dias a partir de hoje)
    const dataPadrao = new Date();
    dataPadrao.setDate(dataPadrao.getDate() + 7);
    setDataRevisao(dataPadrao.toISOString().split('T')[0]);
    setMostrarModalRevisao(true);
  }

  async function handleMarcarParaRevisao() {
    if (!currentUser || !estudoParaRevisao || !dataRevisao) return;
    
    try {
      const dataRevisaoObj = new Date(dataRevisao);
      await revisaoService.marcarParaRevisao(estudoParaRevisao, currentUser.uid, dataRevisaoObj);
      alert(`Estudo marcado para revisão em ${dataRevisaoObj.toLocaleDateString()}`);
      fecharModalRevisao();
    } catch (error) {
      console.error('Erro ao marcar para revisão:', error);
      alert('Erro ao marcar para revisão');
    }
  }

  function fecharModalRevisao() {
    setMostrarModalRevisao(false);
    setEstudoParaRevisao(null);
    setDataRevisao('');
  }

  function iniciarEdicao(estudo: Estudo) {
    setEditandoId(estudo.id);
    setEditandoEstudo({
      concurso: estudo.concurso,
      cargo: estudo.cargo,
      materia: estudo.materia,
      assunto: estudo.assunto
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setEditandoEstudo({});
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Meus Estudos</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Total: {estudos.length} estudos
          </div>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            {mostrarFormulario ? 'Cancelar' : 'Novo Estudo'}
          </button>
        </div>
      </div>

      {/* Formulário de novo estudo */}
      {mostrarFormulario && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Estudo</h3>
          
          <form onSubmit={handleCriarEstudo} className="space-y-4">
            <div>
              <label htmlFor="materia" className="block text-sm font-medium text-gray-700 mb-2">
                Matéria *
              </label>
              <input
                type="text"
                id="materia"
                value={novoEstudo.materia}
                onChange={(e) => setNovoEstudo({...novoEstudo, materia: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                value={novoEstudo.assunto}
                onChange={(e) => setNovoEstudo({...novoEstudo, assunto: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Princípios fundamentais da Constituição Federal"
                required
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={criandoEstudo}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {criandoEstudo ? 'Criando...' : 'Criar Estudo'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNovoEstudo({ materia: '', assunto: '' });
                  setMostrarFormulario(false);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {estudos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum estudo cadastrado ainda.</p>
          <p className="text-gray-400 text-sm mt-2">Comece criando seu primeiro estudo!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {estudos.map((estudo) => (
            <div key={estudo.id} className="bg-white rounded-lg shadow-md p-6">
              {editandoId === estudo.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editandoEstudo.concurso || ''}
                    onChange={(e) => setEditandoEstudo({...editandoEstudo, concurso: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Concurso"
                  />
                  <input
                    type="text"
                    value={editandoEstudo.cargo || ''}
                    onChange={(e) => setEditandoEstudo({...editandoEstudo, cargo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Cargo"
                  />
                  <input
                    type="text"
                    value={editandoEstudo.materia || ''}
                    onChange={(e) => setEditandoEstudo({...editandoEstudo, materia: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Matéria"
                  />
                  <input
                    type="text"
                    value={editandoEstudo.assunto || ''}
                    onChange={(e) => setEditandoEstudo({...editandoEstudo, assunto: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Assunto"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditar(estudo.id)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={cancelarEdicao}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">{estudo.materia}</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Assunto:</span> {estudo.assunto}
                    </p>
                    <p className="text-xs text-gray-400">
                      Criado em: {estudo.createdAt instanceof Date ? estudo.createdAt.toLocaleDateString() : 'Data não disponível'}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => abrirModalRevisao(estudo.id)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Marcar para Revisar
                    </button>
                    <button
                      onClick={() => iniciarEdicao(estudo)}
                      className="bg-yellow-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletar(estudo.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                    >
                      Deletar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para definir data da revisão */}
      {mostrarModalRevisao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Definir Data da Revisão
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="dataRevisao" className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Revisão
                </label>
                <input
                  type="date"
                  id="dataRevisao"
                  value={dataRevisao}
                  onChange={(e) => setDataRevisao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleMarcarParaRevisao}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Confirmar
                </button>
                <button
                  onClick={fecharModalRevisao}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 