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

  async function handleMarcarParaRevisao(estudoId: string) {
    if (!currentUser) return;
    
    try {
      // Marcar para revisar em 7 dias
      const dataRevisao = new Date();
      dataRevisao.setDate(dataRevisao.getDate() + 7);
      
      await revisaoService.marcarParaRevisao(estudoId, currentUser.uid, dataRevisao);
      alert('Estudo marcado para revisão em 7 dias!');
    } catch (error) {
      console.error('Erro ao marcar para revisão:', error);
      alert('Erro ao marcar para revisão');
    }
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
        <div className="text-sm text-gray-500">
          Total: {estudos.length} estudos
        </div>
      </div>

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
                    <h3 className="text-lg font-semibold text-gray-900">{estudo.concurso}</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Cargo:</span> {estudo.cargo}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Matéria:</span> {estudo.materia}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Assunto:</span> {estudo.assunto}
                    </p>
                    <p className="text-xs text-gray-400">
                      Criado em: {estudo.createdAt instanceof Date ? estudo.createdAt.toLocaleDateString() : 'Data não disponível'}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleMarcarParaRevisao(estudo.id)}
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
    </div>
  );
} 