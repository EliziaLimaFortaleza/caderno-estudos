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
      where('userId', '==', userId),
      orderBy('dataRevisao', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Revisao[];
  },

  async buscarRevisoesPendentes(userId: string): Promise<Revisao[]> {
    const q = query(
      collection(db, 'revisoes'),
      where('userId', '==', userId),
      where('status', '==', 'pendente'),
      orderBy('dataRevisao', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Revisao[];
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