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
  parceiroEmail?: string;
  parceiroId?: string;
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

  async salvarConfiguracao(userId: string, concurso: string, cargo: string): Promise<void> {
    try {
      const docRef = doc(db, 'usuarios', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Atualizar configuração existente
        await updateDoc(docRef, {
          concurso,
          cargo,
          updatedAt: serverTimestamp()
        });
      } else {
        // Criar nova configuração
        await setDoc(docRef, {
          concurso,
          cargo,
          userId,
          updatedAt: serverTimestamp()
        });
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

  async removerParceiro(userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'usuarios', userId);
      await updateDoc(docRef, {
        parceiroEmail: '',
        parceiroId: '',
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Erro ao remover parceiro:', error);
      throw new Error(`Erro ao remover parceiro: ${error.message || 'Erro desconhecido'}`);
    }
  },

  async buscarUsuarioPorEmail(email: string): Promise<ConfiguracaoUsuario | null> {
    try {
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as ConfiguracaoUsuario;
      }
      return null;
    } catch (error: any) {
      console.error('Erro ao buscar usuário por e-mail:', error);
      throw new Error(`Erro ao buscar usuário: ${error.message || 'Erro desconhecido'}`);
    }
  },
}; 