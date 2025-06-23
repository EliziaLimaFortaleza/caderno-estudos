import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Estudo, Revisao, Questao, ConfiguracaoUsuario } from '../types';
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
  const [configuracao, setConfiguracao] = useState<{
    concurso: string;
    cargo: string;
    parceiroEmail: string;
    apelidoParceiro: string;
    meuApelido: string;
  }>({
    concurso: '',
    cargo: '',
    parceiroEmail: '',
    apelidoParceiro: '',
    meuApelido: ''
  });
  const [parceiro, setParceiro] = useState<any>(null);
  const [visualizandoParceiro, setVisualizandoParceiro] = useState(false);
  const [emailParceiroInput, setEmailParceiroInput] = useState('');
  const [carregandoParceiro, setCarregandoParceiro] = useState(false);

  useEffect(() => {
    if (currentUser) {
      carregarDados();
      carregarConfiguracao();
    }
  }, [currentUser]);

  async function carregarDados(parceiroId?: string) {
    if (!currentUser && !parceiroId) return;
    const uid = parceiroId || currentUser?.uid;
    if (!uid) return;
    
    console.log('Carregando dados para usuário:', uid, 'É parceiro?', !!parceiroId);
    
    try {
      setLoading(true);
      const [revisoesData, questoesData] = await Promise.all([
        revisaoService.buscarRevisoesPorUsuario(uid),
        questaoService.buscarQuestoesPorUsuario(uid)
      ]);
      
      console.log('Dados carregados - Revisões:', revisoesData.length, 'Questões:', questoesData.length);
      console.log('Revisões:', revisoesData);
      console.log('Questões:', questoesData);
      
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
      const config = await usuarioService.obterConfiguracao(currentUser.uid) as any;
      if (config) {
        setConfiguracao({
          concurso: config.concurso || '',
          cargo: config.cargo || '',
          parceiroEmail: config.parceiroEmail || '',
          apelidoParceiro: config.apelidoParceiro || '',
          meuApelido: config.meuApelido || ''
        });
        if (config.parceiroEmail) {
          await carregarParceiro(config.parceiroEmail);
        }
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
        configuracao.cargo,
        currentUser.email || undefined
      );
      setEditandoConfig(false);
      alert('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração');
    }
  }

  async function salvarApelidoParceiro() {
    if (!currentUser || !configuracao.apelidoParceiro.trim()) return;
    try {
      await usuarioService.salvarApelidoParceiro(currentUser.uid, configuracao.apelidoParceiro);
      alert('Apelido salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar apelido:', error);
      alert('Erro ao salvar apelido');
    }
  }

  async function salvarMeuApelido() {
    if (!currentUser || !configuracao.meuApelido.trim()) return;
    try {
      await usuarioService.salvarMeuApelido(currentUser.uid, configuracao.meuApelido);
      alert('Seu apelido salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar seu apelido:', error);
      alert('Erro ao salvar seu apelido');
    }
  }

  async function adicionarParceiro() {
    if (!currentUser || !emailParceiroInput) return;
    setCarregandoParceiro(true);
    try {
      // Primeiro, limpar usuários artificiais
      await usuarioService.limparUsuariosArtificiais();
      
      const parceiroData = await usuarioService.buscarUsuarioPorEmail(emailParceiroInput);
      if (!parceiroData) {
        alert(`Usuário com email ${emailParceiroInput} não encontrado!\n\nPara adicionar um parceiro, ele precisa:\n1. Ter uma conta no sistema\n2. Ter feito login pelo menos uma vez\n3. Ter salvo suas configurações (concurso/cargo)\n\nPeça para seu parceiro fazer login e salvar suas configurações primeiro.`);
        setCarregandoParceiro(false);
        return;
      }
      
      // Verificar se o parceiro tem configurações básicas
      if (!parceiroData.concurso || !parceiroData.cargo) {
        alert(`Parceiro encontrado, mas ele ainda não configurou seu concurso e cargo.\n\nPeça para ${emailParceiroInput} fazer login e configurar suas informações primeiro.`);
        setCarregandoParceiro(false);
        return;
      }
      
      await usuarioService.salvarParceiro(currentUser.uid, emailParceiroInput);
      setConfiguracao((prev) => ({ ...prev, parceiroEmail: emailParceiroInput }));
      setParceiro(parceiroData);
      setEmailParceiroInput('');
      alert('Parceiro adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar parceiro:', error);
      alert('Erro ao adicionar parceiro');
    } finally {
      setCarregandoParceiro(false);
    }
  }

  async function removerParceiro() {
    if (!currentUser) return;
    setCarregandoParceiro(true);
    try {
      await usuarioService.removerParceiro(currentUser.uid);
      setConfiguracao((prev) => ({ ...prev, parceiroEmail: '' }));
      setParceiro(null);
      setVisualizandoParceiro(false);
      alert('Parceiro removido!');
    } catch (error) {
      alert('Erro ao remover parceiro');
    } finally {
      setCarregandoParceiro(false);
    }
  }

  async function carregarParceiro(email: string) {
    setCarregandoParceiro(true);
    try {
      console.log('Carregando parceiro com email:', email);
      const parceiroData = await usuarioService.buscarUsuarioPorEmail(email);
      console.log('Dados do parceiro carregados:', parceiroData);
      setParceiro(parceiroData);
    } catch (error) {
      console.error('Erro ao carregar parceiro:', error);
      setParceiro(null);
    } finally {
      setCarregandoParceiro(false);
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
      {/* Cabeçalho com Concurso, Cargo e Parceiro */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Painel de Desempenho</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Meu Apelido:</label>
              <input
                type="text"
                value={configuracao.meuApelido}
                onChange={(e) => setConfiguracao({...configuracao, meuApelido: e.target.value})}
                className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Ex: João"
                style={{ width: 100 }}
              />
              <button
                onClick={salvarMeuApelido}
                className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-green-700"
              >
                Salvar
              </button>
            </div>
            <button
              onClick={() => setEditandoConfig(!editandoConfig)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              {editandoConfig ? 'Cancelar' : 'Editar'}
            </button>
          </div>
        </div>
        {/* PARCEIRO DE ESTUDOS */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Parceiro de estudos</h4>
          {configuracao.parceiroEmail && parceiro ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800 font-medium">
                      {configuracao.apelidoParceiro || 'Sem apelido'}
                    </span>
                    <button
                      onClick={() => {
                        const novoApelido = prompt('Digite o apelido do seu parceiro:', configuracao.apelidoParceiro);
                        if (novoApelido !== null) {
                          setConfiguracao(prev => ({ ...prev, apelidoParceiro: novoApelido }));
                          usuarioService.salvarApelidoParceiro(currentUser!.uid, novoApelido);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium p-1 rounded hover:bg-blue-50"
                      title="Editar apelido"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
                <button
                  onClick={removerParceiro}
                  className="text-red-600 hover:text-red-800 text-xs font-medium border border-red-200 rounded px-2 py-1"
                  disabled={carregandoParceiro}
                >
                  Remover
                </button>
                <button
                  onClick={() => {
                    setVisualizandoParceiro((v) => !v);
                    carregarDados(visualizandoParceiro ? undefined : parceiro.userId);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-medium border border-indigo-200 rounded px-2 py-1"
                >
                  {visualizandoParceiro ? 'Ver meu desempenho' : 'Ver desempenho do parceiro'}
                </button>
              </div>
              
              {/* Mostrar informações do parceiro quando visualizando */}
              {visualizandoParceiro && parceiro && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-purple-900">
                        {parceiro.concurso || 'Concurso não definido'}
                      </h4>
                      <p className="text-xs text-purple-700">
                        {parceiro.cargo || 'Cargo não definido'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="E-mail do parceiro"
                value={emailParceiroInput}
                onChange={(e) => setEmailParceiroInput(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded"
                disabled={carregandoParceiro}
              />
              <button
                onClick={adicionarParceiro}
                className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-indigo-700"
                disabled={carregandoParceiro}
              >
                {carregandoParceiro ? 'Adicionando...' : 'Adicionar'}
              </button>
              <button
                onClick={async () => {
                  try {
                    await usuarioService.limparUsuariosArtificiais();
                    alert('Usuários artificiais removidos! Tente adicionar o parceiro novamente.');
                  } catch (error) {
                    alert('Erro ao limpar usuários artificiais');
                  }
                }}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-yellow-700"
                title="Limpar usuários artificiais"
              >
                🔧 Limpar
              </button>
            </div>
          )}
        </div>
        {/* ...restante do cabeçalho concurso/cargo... */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meu Apelido
                </label>
                <input
                  type="text"
                  value={configuracao.meuApelido}
                  onChange={(e) => setConfiguracao({...configuracao, meuApelido: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: João"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={salvarMeuApelido}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Salvar Apelido
                </button>
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
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Frequência</p>
              <p className="text-2xl font-semibold text-gray-900">{totalQuestoes} questões</p>
            </div>
          </div>
        </div>
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