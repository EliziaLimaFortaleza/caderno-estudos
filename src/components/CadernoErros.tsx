import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Estudo, Questao } from '../types';
import { questaoService } from '../services/questaoService';
import { usuarioService } from '../services/usuarioService';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface CadernoErrosProps {
  estudos: Estudo[];
}

export function CadernoErros({ estudos }: CadernoErrosProps) {
  const { currentUser } = useAuth();
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [questoesParceiro, setQuestoesParceiro] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    estudoId: '',
    enunciado: '',
    comentario: '',
    acertou: undefined as boolean | undefined
  });
  const [parceiro, setParceiro] = useState<any>(null);
  const [visualizandoParceiro, setVisualizandoParceiro] = useState(false);
  const [comentarioParaQuestao, setComentarioParaQuestao] = useState('');
  const [questaoParaComentar, setQuestaoParaComentar] = useState<string | null>(null);
  const [meuApelido, setMeuApelido] = useState('');
  const [apelidoParceiro, setApelidoParceiro] = useState('');

  useEffect(() => {
    if (currentUser) {
      carregarQuestoes();
      carregarParceiro();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      // Buscar config do usuário logado
      const minhaConfig = await usuarioService.obterConfiguracao(currentUser.uid);
      if (minhaConfig?.meuApelido) setMeuApelido(minhaConfig.meuApelido);
      // Buscar config do parceiro, se houver
      if (minhaConfig?.parceiroEmail) {
        const parceiroConfig = await usuarioService.buscarUsuarioPorEmail(minhaConfig.parceiroEmail);
        if (parceiroConfig?.meuApelido) setApelidoParceiro(parceiroConfig.meuApelido);
        setParceiro(parceiroConfig);
        // Carregar questões do parceiro
        if (parceiroConfig) {
          const questoesParceiroData = await questaoService.buscarQuestoesPorUsuario(parceiroConfig.userId);
          setQuestoesParceiro(questoesParceiroData);
        }
      }
      await carregarQuestoes();
    })();
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

  async function carregarParceiro() {
    if (!currentUser) return;

    try {
      console.log('Carregando parceiro para usuário:', currentUser.uid);
      const config = await usuarioService.obterConfiguracao(currentUser.uid);
      console.log('Configuração carregada:', config);
      
      // Carregar o próprio apelido do usuário
      if (config?.meuApelido) {
        setMeuApelido(config.meuApelido);
        console.log('Meu apelido carregado:', config.meuApelido);
      }
      
      if (config?.parceiroEmail) {
        console.log('Email do parceiro encontrado:', config.parceiroEmail);
        const parceiroData = await usuarioService.buscarUsuarioPorEmail(config.parceiroEmail);
        console.log('Dados do parceiro:', parceiroData);
        setParceiro(parceiroData);
        setApelidoParceiro(config.apelidoParceiro || '');
        
        // Carregar questões do parceiro
        if (parceiroData) {
          console.log('Carregando questões do parceiro com userId:', parceiroData.userId);
          const questoesParceiroData = await questaoService.buscarQuestoesPorUsuario(parceiroData.userId);
          console.log('Questões do parceiro carregadas:', questoesParceiroData);
          setQuestoesParceiro(questoesParceiroData);
        }
      } else {
        console.log('Nenhum parceiro configurado');
      }
    } catch (error) {
      console.error('Erro ao carregar parceiro:', error);
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
        const questaoData = {
          estudoId: formData.estudoId,
          enunciado: formData.enunciado,
          comentario: formData.comentario,
          userId: currentUser.uid
        };
        
        await questaoService.criarQuestao(questaoData);
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
    if (!currentUser) return;
    try {
      await questaoService.marcarQuestao(id, acertou, currentUser.uid);
      await carregarQuestoes();
      if (parceiro) {
        await carregarParceiro(); // Recarregar questões do parceiro
      }
    } catch (error) {
      console.error('Erro ao marcar questão:', error);
      alert('Erro ao marcar questão');
    }
  }

  const adicionarComentario = async (questaoId: string) => {
    if (!comentarioParaQuestao.trim() || !currentUser) return;
    try {
      // Buscar config do autor do comentário
      let apelidoAutor = '';
      const minhaConfig = await usuarioService.obterConfiguracao(currentUser.uid);
      if (minhaConfig?.meuApelido) {
        apelidoAutor = minhaConfig.meuApelido;
      } else {
        apelidoAutor = currentUser.email?.split('@')[0] || 'Usuário';
      }
      const questaoRef = doc(db, 'questoes', questaoId);
      const questaoDoc = await getDoc(questaoRef);
      if (!questaoDoc.exists()) {
        alert('Questão não encontrada');
        return;
      }
      const questaoData = questaoDoc.data();
      const comentariosExistentes = questaoData.comentarios || [];
      const novoComentarioObj = {
        id: Date.now().toString(),
        autor: currentUser.email,
        apelido: apelidoAutor,
        texto: comentarioParaQuestao,
        data: new Date().toISOString()
      };
      const comentariosAtualizados = [...comentariosExistentes, novoComentarioObj];
      await updateDoc(questaoRef, { comentarios: comentariosAtualizados });
      setComentarioParaQuestao('');
      setQuestaoParaComentar(null);
      await carregarQuestoes();
      if (parceiro) {
        const questoesParceiroData = await questaoService.buscarQuestoesPorUsuario(parceiro.userId);
        setQuestoesParceiro(questoesParceiroData);
      }
      alert('Comentário adicionado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      alert(`Erro ao adicionar comentário: ${error.message}`);
    }
  };

  function iniciarEdicao(questao: Questao) {
    setEditandoId(questao.id);
    setFormData({
      estudoId: questao.estudoId,
      enunciado: questao.enunciado,
      comentario: questao.comentario || '',
      acertou: questao.acertou,
    });
    setMostrarFormulario(true);
  }

  function limparFormulario() {
    setFormData({
      estudoId: '',
      enunciado: '',
      comentario: '',
      acertou: undefined,
    });
    setEditandoId(null);
    setMostrarFormulario(false);
  }

  function obterEstudo(questao: Questao): Estudo | undefined {
    return estudos.find(estudo => estudo.id === questao.estudoId);
  }

  const questoesAtuais = visualizandoParceiro ? questoesParceiro : questoes;
  const tituloSecao = visualizandoParceiro ? `Questões do ${apelidoParceiro || 'Parceiro'} (${questoesParceiro.length})` : `Minhas Questões (${questoes.length})`;

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
        <div className="flex space-x-2">
          {parceiro && (
            <button
              onClick={() => setVisualizandoParceiro(!visualizandoParceiro)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
            >
              {visualizandoParceiro ? 'Ver Minhas Questões' : `Ver questões de ${apelidoParceiro || 'Parceiro'}`}
            </button>
          )}
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            {mostrarFormulario ? 'Cancelar' : 'Nova Questão'}
          </button>
        </div>
      </div>

      {/* Informações do parceiro quando visualizando suas questões */}
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
                Questões de {apelidoParceiro || 'Parceiro'}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Formulário */}
      {mostrarFormulario && !visualizandoParceiro && (
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
        <h3 className="text-lg font-semibold text-gray-900">{tituloSecao}</h3>
        
        {questoesAtuais.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {visualizandoParceiro ? `${apelidoParceiro || 'Seu parceiro'} ainda não criou questões.` : 'Nenhuma questão cadastrada ainda.'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {visualizandoParceiro ? 'Peça para ele criar algumas questões!' : 'Comece criando sua primeira questão!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questoesAtuais.map((questao) => {
              const estudo = obterEstudo(questao);
              const isQuestaoParceiro = visualizandoParceiro;
              
              return (
                <div key={questao.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      {estudo && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Assunto:</span> {estudo.materia} - {estudo.assunto}
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 mb-2">Enunciado:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{questao.enunciado}</p>
                      </div>

                      {questao.comentario && (
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {isQuestaoParceiro ? `Comentário do ${apelidoParceiro || 'Parceiro'}:` : 'Meu Comentário:'}
                          </h4>
                          <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded">{questao.comentario}</p>
                        </div>
                      )}

                      {/* Sistema de Fórum - Comentários */}
                      {questao.comentarios && (
                        <div className="mt-4 space-y-2">
                          <h4 className="font-semibold text-gray-700">Comentários:</h4>
                          {Array.isArray(questao.comentarios) ? (
                            // Nova estrutura: array de comentários
                            questao.comentarios.map((comentario: any, index: number) => (
                              <div key={comentario.id || index} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-blue-600">
                                    {comentario.apelido || comentario.autor || 'Usuário'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {comentario.data ? new Date(comentario.data).toLocaleDateString('pt-BR') : 'Data não disponível'}
                                  </span>
                                </div>
                                <p className="text-gray-700">{comentario.texto}</p>
                              </div>
                            ))
                          ) : (
                            // Estrutura antiga: objeto com userId como chave
                            Object.entries(questao.comentarios).map(([userId, comentario]: [string, any]) => (
                              <div key={userId} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-blue-600">
                                    {comentario.autor || 'Usuário'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {comentario.data instanceof Date 
                                      ? comentario.data.toLocaleDateString('pt-BR')
                                      : comentario.data?.seconds 
                                        ? new Date(comentario.data.seconds * 1000).toLocaleDateString('pt-BR')
                                        : 'Data não disponível'}
                                  </span>
                                </div>
                                <p className="text-gray-700">{comentario.texto}</p>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* Campo para adicionar comentário */}
                      <div className="mt-4">
                        {questaoParaComentar === questao.id ? (
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium text-gray-700">Adicionar comentário:</h5>
                            <textarea
                              value={comentarioParaQuestao}
                              onChange={(e) => setComentarioParaQuestao(e.target.value)}
                              placeholder="Digite seu comentário sobre esta questão..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows={3}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => adicionarComentario(questao.id)}
                                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
                              >
                                Comentar
                              </button>
                              <button
                                onClick={() => {
                                  setQuestaoParaComentar(null);
                                  setComentarioParaQuestao('');
                                }}
                                className="bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setQuestaoParaComentar(questao.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
                          >
                            💬 Comentar
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {!isQuestaoParceiro && (
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
                    )}
                  </div>

                  {/* Controles de acerto/erro */}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">Resultado:</span>
                    <button
                      onClick={() => handleMarcarQuestao(questao.id, true)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        questao.resultados?.[currentUser?.uid || '']?.acertou === true
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      ✓ Acertou
                    </button>
                    <button
                      onClick={() => handleMarcarQuestao(questao.id, false)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        questao.resultados?.[currentUser?.uid || '']?.acertou === false
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                      }`}
                    >
                      ✗ Errou
                    </button>
                    {questao.resultados?.[currentUser?.uid || '']?.acertou !== undefined && (
                      <span className="text-sm text-gray-500">
                        {questao.resultados[currentUser?.uid || ''].acertou ? '✓ Acertou' : '✗ Errou'}
                      </span>
                    )}
                  </div>

                  {/* Mostrar resultados do parceiro se visualizando questões dele */}
                  {visualizandoParceiro && parceiro && questao.resultados?.[parceiro.userId] && (
                    <div className="mt-2 p-2 bg-purple-50 rounded">
                      <span className="text-sm text-purple-700">
                        Resultado do {apelidoParceiro || 'Parceiro'}: 
                        {questao.resultados[parceiro.userId].acertou ? ' ✓ Acertou' : ' ✗ Errou'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 