import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Revisao } from '../types';

export const revisaoService = {
  async criarRevisao(revisao: Omit<Revisao, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'revisoes'), {
      ...revisao,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async atualizarRevisao(id: string, dados: Partial<Revisao>): Promise<void> {
    const docRef = doc(db, 'revisoes', id);
    await updateDoc(docRef, dados);
  },

  async deletarRevisao(id: string): Promise<void> {
    const docRef = doc(db, 'revisoes', id);
    await deleteDoc(docRef);
  },

  async buscarRevisoesPorUsuario(userId: string): Promise<Revisao[]> {
    const q = query(
      collection(db, 'revisoes'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const revisoes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Revisao[];
    
    revisoes.sort((a, b) => {
      const dateA = a.dataRevisao instanceof Date ? a.dataRevisao : 
        (a.dataRevisao && typeof a.dataRevisao === 'object' && 'seconds' in a.dataRevisao) 
          ? new Date((a.dataRevisao as any).seconds * 1000) 
          : new Date();
      const dateB = b.dataRevisao instanceof Date ? b.dataRevisao : 
        (b.dataRevisao && typeof b.dataRevisao === 'object' && 'seconds' in b.dataRevisao) 
          ? new Date((b.dataRevisao as any).seconds * 1000) 
          : new Date();
      return dateA.getTime() - dateB.getTime();
    });
    
    return revisoes;
  },

  async buscarRevisoesPendentes(userId: string): Promise<Revisao[]> {
    const q = query(
      collection(db, 'revisoes'),
      where('userId', '==', userId),
      where('status', '==', 'pendente')
    );
    
    const querySnapshot = await getDocs(q);
    const revisoes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Revisao[];
    
    revisoes.sort((a, b) => {
      const dateA = a.dataRevisao instanceof Date ? a.dataRevisao : 
        (a.dataRevisao && typeof a.dataRevisao === 'object' && 'seconds' in a.dataRevisao) 
          ? new Date((a.dataRevisao as any).seconds * 1000) 
          : new Date();
      const dateB = b.dataRevisao instanceof Date ? b.dataRevisao : 
        (b.dataRevisao && typeof b.dataRevisao === 'object' && 'seconds' in b.dataRevisao) 
          ? new Date((b.dataRevisao as any).seconds * 1000) 
          : new Date();
      return dateA.getTime() - dateB.getTime();
    });
    
    return revisoes;
  },

  async marcarParaRevisao(estudoId: string, userId: string, dataRevisao: Date): Promise<string> {
    const revisao = {
      estudoId,
      userId,
      dataUltimoEstudo: new Date(),
      dataRevisao,
      status: 'pendente' as const
    };
    
    return await this.criarRevisao(revisao);
  }
}; 