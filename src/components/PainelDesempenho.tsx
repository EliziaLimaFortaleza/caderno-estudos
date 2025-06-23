import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Estudo, Revisao, Questao } from '../types';
import { revisaoService } from '../services/revisaoService';
import { questaoService } from '../services/questaoService';
import { usuarioService } from '../services/usuarioService';

interface PainelDesempenhoProps {
  estudos: Estudo[];
}

export function PainelDesempenho({ estudos }: PainelDesempenhoProps) {
  const { currentUser } = useAuth();
  const [revisoes, setRevisoes] = useState<Revisao[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoConfig, setEditandoConfig] = useState(false);
  const [configuracao, setConfiguracao] = useState({
    concurso: '',
    cargo: ''
  });

  useEffect(() => {
    if (currentUser) {
      carregarDados();
      carregarConfiguracao();
    }
  }, [currentUser]);

  async function carregarDados() {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [revisoesData, questoesData] = await Promise.all([
        revisaoService.buscarRevisoesPorUsuario(currentUser.uid),
        questaoService.buscarQuestoesPorUsuario(currentUser.uid)
      ]);
      
      setRevisoes(revisoesData);
      setQuestoes(questoesData);
    } catch (error) {
      console.error('Erro ao carregar dados do desempenho:', error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarConfiguracao() {
    if (!currentUser) return;

    try {
      const config = await usuarioService.obterConfiguracao(currentUser.uid);
      if (config) {
        setConfiguracao({
          concurso: config.concurso || '',
          cargo: config.cargo || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  }

  async function salvarConfiguracao() {
    if (!currentUser) return;

    try {
      await usuarioService.salvarConfiguracao(
        currentUser.uid,
        configuracao.concurso,
        configuracao.cargo
      );
      setEditandoConfig(false);
      alert('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração');
    }
  }

  // Calcular estatísticas
  const totalAssuntos = estudos.length;
  const totalRevisoes = revisoes.length;
  const revisoesConcluidas = revisoes.filter(r => r.status === 'concluida').length;
  const revisoesPendentes = revisoes.filter(r => r.status === 'pendente').length;

  // Estatísticas por matéria
  const questoesPorMateria = questoes.reduce((acc, questao) => {
    const estudo = estudos.find(e => e.id === questao.estudoId);
    if (estudo) {
      if (!acc[estudo.materia]) {
        acc[estudo.materia] = { acertadas: 0, erradas: 0 };
      }
      if (questao.acertou === true) {
        acc[estudo.materia].acertadas++;
      } else if (questao.acertou === false) {
        acc[estudo.materia].erradas++;
      }
    }
    return acc;
  }, {} as Record<string, { acertadas: number; erradas: number }>);

  const totalQuestoes = questoes.length;
  const questoesAcertadas = questoes.filter(q => q.acertou === true).length;
  const questoesErradas = questoes.filter(q => q.acertou === false).length;
  const taxaAcerto = totalQuestoes > 0 ? ((questoesAcertadas / totalQuestoes) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Concurso e Cargo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Painel de Desempenho</h2>
          <button
            onClick={() => setEditandoConfig(!editandoConfig)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            {editandoConfig ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {editandoConfig ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Concurso
                </label>
                <input
                  type="text"
                  value={configuracao.concurso}
                  onChange={(e) => setConfiguracao({...configuracao, concurso: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Banco do Brasil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  value={configuracao.cargo}
                  onChange={(e) => setConfiguracao({...configuracao, cargo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Agente de Tecnologia"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={salvarConfiguracao}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Salvar
              </button>
              <button
                onClick={() => setEditandoConfig(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-indigo-100 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {configuracao.concurso || 'Concurso não definido'}
                </h3>
                <p className="text-sm text-gray-600">
                  {configuracao.cargo || 'Cargo não definido'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cards de estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Assuntos</p>
              <p className="text-2xl font-semibold text-gray-900">{totalAssuntos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revisões Concluídas</p>
              <p className="text-2xl font-semibold text-gray-900">{revisoesConcluidas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revisões Pendentes</p>
              <p className="text-2xl font-semibold text-gray-900">{revisoesPendentes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Taxa de Acerto</p>
              <p className="text-2xl font-semibold text-gray-900">{taxaAcerto}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas de questões */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas de Questões</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{questoesAcertadas}</p>
            <p className="text-sm text-gray-500">Acertadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{questoesErradas}</p>
            <p className="text-sm text-gray-500">Erradas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{totalQuestoes}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </div>

        {/* Barra de progresso */}
        {totalQuestoes > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${(questoesAcertadas / totalQuestoes) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Desempenho por matéria */}
      {Object.keys(questoesPorMateria).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Desempenho por Matéria</h3>
          
          <div className="space-y-4">
            {Object.entries(questoesPorMateria).map(([materia, stats]) => {
              const total = stats.acertadas + stats.erradas;
              const taxaAcertoMateria = total > 0 ? ((stats.acertadas / total) * 100).toFixed(1) : '0';
              
              return (
                <div key={materia} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{materia}</h4>
                    <span className="text-sm text-gray-500">{taxaAcertoMateria}%</span>
                  </div>
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>✓ {stats.acertadas} acertadas</span>
                    <span>✗ {stats.erradas} erradas</span>
                    <span>Total: {total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div 
                      className="bg-green-600 h-1 rounded-full" 
                      style={{ width: `${(stats.acertadas / total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 