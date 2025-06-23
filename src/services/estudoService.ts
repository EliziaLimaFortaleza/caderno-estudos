import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Estudo } from '../types';

export const estudoService = {
  async criarEstudo(estudo: Omit<Estudo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'estudos'), {
        ...estudo,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error: any) {
      console.error('Erro ao criar estudo:', error);
      
      // Mensagens de erro mais específicas
      if (error.code === 'permission-denied') {
        throw new Error('Permissão negada. Verifique se o Firestore está configurado corretamente.');
      } else if (error.code === 'unavailable') {
        throw new Error('Serviço indisponível. Verifique sua conexão com a internet.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      } else {
        throw new Error(`Erro ao criar estudo: ${error.message || 'Erro desconhecido'}`);
      }
    }
  },

  async atualizarEstudo(id: string, dados: Partial<Estudo>): Promise<void> {
    try {
      const docRef = doc(db, 'estudos', id);
      await updateDoc(docRef, {
        ...dados,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Erro ao atualizar estudo:', error);
      throw new Error(`Erro ao atualizar estudo: ${error.message || 'Erro desconhecido'}`);
    }
  },

  async deletarEstudo(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'estudos', id);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error('Erro ao deletar estudo:', error);
      throw new Error(`Erro ao deletar estudo: ${error.message || 'Erro desconhecido'}`);
    }
  },

  async buscarEstudosPorUsuario(userId: string): Promise<Estudo[]> {
    try {
      const q = query(
        collection(db, 'estudos'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Estudo[];
    } catch (error: any) {
      console.error('Erro ao buscar estudos:', error);
      throw new Error(`Erro ao buscar estudos: ${error.message || 'Erro desconhecido'}`);
    }
  },

  async buscarEstudoPorId(id: string): Promise<Estudo | null> {
    try {
      const docRef = doc(db, 'estudos', id);
      const docSnap = await getDocs(collection(db, 'estudos'));
      
      const estudo = docSnap.docs.find(doc => doc.id === id);
      if (estudo) {
        return { id: estudo.id, ...estudo.data() } as Estudo;
      }
      return null;
    } catch (error: any) {
      console.error('Erro ao buscar estudo por ID:', error);
      throw new Error(`Erro ao buscar estudo: ${error.message || 'Erro desconhecido'}`);
    }
  }
}; 