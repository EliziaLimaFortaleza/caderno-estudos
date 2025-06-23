import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Estudo } from '../types';
import { estudoService } from '../services/estudoService';
import { usuarioService } from '../services/usuarioService';
import { ListaEstudos } from './ListaEstudos';
import { PainelDesempenho } from './PainelDesempenho';
import { ListaRevisoes } from './ListaRevisoes';
import { CadernoErros } from './CadernoErros';

type TabType = 'estudos' | 'revisoes' | 'desempenho' | 'caderno-erros';

export function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('desempenho');
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [configuracao, setConfiguracao] = useState<any>({ meuApelido: '' });

  useEffect(() => {
    if (currentUser) {
      carregarEstudos();
      carregarConfiguracao();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function carregarEstudos() {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      console.log('Carregando estudos para usuário:', currentUser.uid);
      const estudosData = await estudoService.buscarEstudosPorUsuario(currentUser.uid);
      console.log('Estudos carregados:', estudosData);
      setEstudos(estudosData);
    } catch (error) {
      console.error('Erro ao carregar estudos:', error);
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
          meuApelido: config.meuApelido || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  }

  function atualizarApelido(apelido: string) {
    setConfiguracao((prev: any) => ({ ...prev, meuApelido: apelido }));
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  const tabs = [
    { id: 'desempenho', label: 'Desempenho', icon: '📊' },
    { id: 'estudos', label: 'Matérias', icon: '📚' },
    { id: 'caderno-erros', label: 'Caderno de Erros', icon: '❌' },
    { id: 'revisoes', label: 'Revisões', icon: '🔄' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Progress!
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Olá, {configuracao.meuApelido || currentUser?.email?.split('@')[0] || 'Usuário'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'desempenho' && (
                <PainelDesempenho estudos={estudos} onApelidoAtualizado={atualizarApelido} />
              )}
              {activeTab === 'estudos' && (
                <ListaEstudos 
                  estudos={estudos} 
                  onEstudoAtualizado={carregarEstudos} 
                />
              )}
              {activeTab === 'revisoes' && (
                <ListaRevisoes />
              )}
              {activeTab === 'caderno-erros' && (
                <CadernoErros estudos={estudos} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
} 