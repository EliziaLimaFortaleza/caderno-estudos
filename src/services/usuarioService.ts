import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

interface ConfiguracaoUsuario {
  concurso: string;
  cargo: string;
  userId: string;
  email?: string;
  parceiroEmail?: string;
  parceiroId?: string;
  apelidoParceiro?: string;
  updatedAt: any;
}

export const usuarioService = {
  async obterConfiguracao(userId: string): Promise<ConfiguracaoUsuario | null> {
    try {
      const docRef = doc(db, 'usuarios', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as ConfiguracaoUsuario;
      }
      return null;
    } catch (error: any) {
      console.error('Erro ao obter configuração:', error);
      throw new Error(`Erro ao obter configuração: ${error.message || 'Erro desconhecido'}`);
    }
  },

  async salvarConfiguracao(userId: string, concurso: string, cargo: string, email?: string): Promise<void> {
    try {
      const docRef = doc(db, 'usuarios', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Atualizar configuração existente
        const updateData: any = {
          concurso,
          cargo,
          updatedAt: serverTimestamp()
        };
        
        // Adicionar email se fornecido
        if (email) {
          updateData.email = email;
        }
        
        await updateDoc(docRef, updateData);
      } else {
        // Criar nova configuração
        const newData: any = {
          concurso,
          cargo,
          userId,
          updatedAt: serverTimestamp()
        };
        
        // Adicionar email se fornecido
        if (email) {
          newData.email = email;
        }
        
        await setDoc(docRef, newData);
      }
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      throw new Error(`Erro ao salvar configuração: ${error.message || 'Erro desconhecido'}`);
    }
  },

  async salvarParceiro(userId: string, parceiroEmail: string): Promise<void> {
    try {
      const docRef = doc(db, 'usuarios', userId);
      await updateDoc(docRef, {
        parceiroEmail,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Erro ao salvar parceiro:', error);
      throw new Error(`Erro ao salvar parceiro: ${error.message || 'Erro desconhecido'}`);
    }
  },

  async salvarApelidoParceiro(userId: string, apelido: string): Promise<void> {
    try {
      const docRef = doc(db, 'usuarios', userId);
      await updateDoc(docRef, {
        apelidoParceiro: apelido,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Erro ao salvar apelido do parceiro:', error);
      throw new Error(`Erro ao salvar apelido: ${error.message || 'Erro desconhecido'}`);
    }
  },

  async removerParceiro(userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'usuarios', userId);
      await updateDoc(docRef, {
        parceiroEmail: '',
        parceiroId: '',
        apelidoParceiro: '',
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Erro ao remover parceiro:', error);
      throw new Error(`Erro ao remover parceiro: ${error.message || 'Erro desconhecido'}`);
    }
  },

  async buscarUsuarioPorEmail(email: string): Promise<ConfiguracaoUsuario | null> {
    try {
      console.log('Buscando usuário por email:', email);
      
      // Primeiro, tentar buscar na coleção usuarios
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      console.log('Resultado da busca por email:', querySnapshot.size, 'documentos encontrados');
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data() as ConfiguracaoUsuario;
        const result = {
          ...userData,
          userId: querySnapshot.docs[0].id
        };
        console.log('Usuário encontrado:', result);
        return result;
      }

      console.log('Usuário não encontrado na coleção usuarios');
      
      // Se não encontrou, retornar null em vez de criar um usuário artificial
      // O parceiro precisa ter uma conta real no sistema
      return null;
    } catch (error: any) {
      console.error('Erro ao buscar usuário por e-mail:', error);
      throw new Error(`Erro ao buscar usuário: ${error.message || 'Erro desconhecido'}`);
    }
  },

  async buscarUsuarioPorEmailCompleto(email: string): Promise<ConfiguracaoUsuario | null> {
    try {
      console.log('Buscando usuário por email (busca completa):', email);
      
      // Primeiro, tentar buscar na coleção usuarios
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data() as ConfiguracaoUsuario;
        const result = {
          ...userData,
          userId: querySnapshot.docs[0].id
        };
        console.log('Usuário encontrado na coleção usuarios:', result);
        return result;
      }

      // Se não encontrou na coleção usuarios, tentar buscar por outros meios
      // Por exemplo, se o usuário tem uma conta mas não salvou configuração ainda
      console.log('Tentando buscar usuário por outros meios...');
      
      // Aqui você pode adicionar outras lógicas de busca se necessário
      // Por exemplo, buscar em outras coleções ou usar APIs do Firebase Auth
      
      return null;
    } catch (error: any) {
      console.error('Erro ao buscar usuário por e-mail (busca completa):', error);
      throw new Error(`Erro ao buscar usuário: ${error.message || 'Erro desconhecido'}`);
    }
  },
}; 