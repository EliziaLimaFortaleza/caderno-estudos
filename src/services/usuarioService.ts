import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

interface ConfiguracaoUsuario {
  concurso: string;
  cargo: string;
  userId: string;
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
  }
}; 