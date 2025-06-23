import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Revisao, Estudo } from '../types';
import { revisaoService } from '../services/revisaoService';
import { estudoService } from '../services/estudoService';

export function ListaRevisoes() {
  const { currentUser } = useAuth();
  const [revisoes, setRevisoes] = useState<Revisao[]>([]);
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'pendentes' | 'concluidas'>('todas');

  useEffect(() => {
    if (currentUser) {
      carregarDados();
    }
  }, [currentUser]);

  async function carregarDados() {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [revisoesData, estudosData] = await Promise.all([
        revisaoService.buscarRevisoesPorUsuario(currentUser.uid),
        estudoService.buscarEstudosPorUsuario(currentUser.uid)
      ]);
      
      setRevisoes(revisoesData);
      setEstudos(estudosData);
    } catch (error) {
      console.error('Erro ao carregar revisões:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConcluirRevisao(revisaoId: string) {
    if (!currentUser) return;

    try {
      await revisaoService.atualizarRevisao(revisaoId, { status: 'concluida' });
      await carregarDados();
      alert('Revisão concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao concluir revisão:', error);
      alert('Erro ao concluir revisão');
    }
  }

  async function handleDeletarRevisao(revisaoId: string) {
    if (!currentUser) return;

    if (window.confirm('Tem certeza que deseja deletar esta revisão?')) {
      try {
        await revisaoService.deletarRevisao(revisaoId);
        await carregarDados();
      } catch (error) {
        console.error('Erro ao deletar revisão:', error);
        alert('Erro ao deletar revisão');
      }
    }
  }

  function formatarData(data: Date | any): string {
    if (!data) return 'Data não disponível';
    
    const dataObj = data instanceof Date ? data : new Date(data.seconds * 1000);
    return dataObj.toLocaleDateString('pt-BR');
  }

  function calcularDiasAtraso(dataRevisao: Date | any): number {
    if (!dataRevisao) return 0;
    
    const dataRevisaoObj = dataRevisao instanceof Date ? dataRevisao : new Date(dataRevisao.seconds * 1000);
    const hoje = new Date();
    const diffTime = hoje.getTime() - dataRevisaoObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  function obterEstudo(revisao: Revisao): Estudo | undefined {
    return estudos.find(estudo => estudo.id === revisao.estudoId);
  }

  // Filtrar revisões baseado no filtro selecionado
  const revisoesFiltradas = revisoes.filter(revisao => {
    if (filtro === 'todas') return true;
    if (filtro === 'pendentes') return revisao.status === 'pendente';
    if (filtro === 'concluidas') return revisao.status === 'concluida';
    return true;
  });

  const revisoesPendentes = revisoes.filter(r => r.status === 'pendente').length;
  const revisoesConcluidas = revisoes.filter(r => r.status === 'concluida').length;

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
        <h2 className="text-2xl font-bold text-gray-900">Revisões</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {revisoesPendentes} pendentes • {revisoesConcluidas} concluídas
          </div>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todas">Todas</option>
            <option value="pendentes">Pendentes</option>
            <option value="concluidas">Concluídas</option>
          </select>
        </div>
      </div>

      {revisoesFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {filtro === 'todas' && 'Nenhuma revisão cadastrada.'}
            {filtro === 'pendentes' && 'Nenhuma revisão pendente.'}
            {filtro === 'concluidas' && 'Nenhuma revisão concluída.'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {filtro === 'todas' && 'Marque seus estudos para revisão para vê-los aqui!'}
            {filtro === 'pendentes' && 'Todas as suas revisões foram concluídas!'}
            {filtro === 'concluidas' && 'Conclua algumas revisões para vê-las aqui!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {revisoesFiltradas.map((revisao) => {
            const estudo = obterEstudo(revisao);
            const diasAtraso = calcularDiasAtraso(revisao.dataRevisao);
            const estaAtrasada = diasAtraso > 0 && revisao.status === 'pendente';
            const estaConcluida = revisao.status === 'concluida';

            return (
              <div 
                key={revisao.id} 
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  estaConcluida ? 'border-green-500' :
                  estaAtrasada ? 'border-red-500' : 'border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {estudo ? (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {estudo.materia}
                        </h3>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Assunto:</span> {estudo.assunto}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500">Estudo não encontrado</p>
                    )}
                    
                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Último estudo:</span> {formatarData(revisao.dataUltimoEstudo)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Data da revisão:</span> {formatarData(revisao.dataRevisao)}
                      </p>
                      {estaAtrasada && (
                        <p className="text-sm text-red-600 font-medium">
                          ⚠️ {diasAtraso} dia{diasAtraso > 1 ? 's' : ''} de atraso
                        </p>
                      )}
                      {estaConcluida && (
                        <p className="text-sm text-green-600 font-medium">
                          ✅ Revisão concluída
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    {!estaConcluida && (
                      <button
                        onClick={() => handleConcluirRevisao(revisao.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                      >
                        Concluir
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletarRevisao(revisao.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dicas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Dicas para revisão eficiente:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Revise os assuntos marcados com atraso primeiro</li>
          <li>• Use o caderno de erros para focar nos pontos mais difíceis</li>
          <li>• Estabeleça uma rotina de revisão regular</li>
          <li>• Teste seus conhecimentos com questões práticas</li>
        </ul>
      </div>
    </div>
  );
} 