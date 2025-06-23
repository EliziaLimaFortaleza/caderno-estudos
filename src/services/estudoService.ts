import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Estudo } from '../types';

export const estudoService = {
  async criarEstudo(estudo: Omit<Estudo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Criando estudo:', estudo);
      const docRef = await addDoc(collection(db, 'estudos'), {
        ...estudo,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('Estudo criado com ID:', docRef.id);
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
      console.log('Buscando estudos para usuário:', userId);
      const q = query(
        collection(db, 'estudos'),
        where('userId', '==', userId)
        // Removendo orderBy temporariamente para evitar problema de índice
        // orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const estudos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Estudo[];
      
      // Ordenar no JavaScript em vez de no Firestore
      estudos.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : 
          (a.createdAt && typeof a.createdAt === 'object' && 'seconds' in a.createdAt) 
            ? new Date((a.createdAt as any).seconds * 1000) 
            : new Date();
        const dateB = b.createdAt instanceof Date ? b.createdAt : 
          (b.createdAt && typeof b.createdAt === 'object' && 'seconds' in b.createdAt) 
            ? new Date((b.createdAt as any).seconds * 1000) 
            : new Date();
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('Estudos encontrados:', estudos);
      return estudos;
    } catch (error: any) {
      console.error('Erro ao buscar estudos:', error);
      throw new Error(`Erro ao buscar estudos: ${error.message || 'Erro desconhecido'}`);
    }
  },

  async buscarEstudoPorId(id: string): Promise<Estudo | null> {
    try {
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