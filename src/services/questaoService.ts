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
import { Questao } from '../types';

export const questaoService = {
  async criarQuestao(questao: Omit<Questao, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'questoes'), {
      ...questao,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async atualizarQuestao(id: string, dados: Partial<Questao>): Promise<void> {
    const docRef = doc(db, 'questoes', id);
    await updateDoc(docRef, {
      ...dados,
      updatedAt: serverTimestamp()
    });
  },

  async deletarQuestao(id: string): Promise<void> {
    const docRef = doc(db, 'questoes', id);
    await deleteDoc(docRef);
  },

  async buscarQuestoesPorEstudo(estudoId: string): Promise<Questao[]> {
    const q = query(
      collection(db, 'questoes'),
      where('estudoId', '==', estudoId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Questao[];
  },

  async buscarQuestoesPorUsuario(userId: string): Promise<Questao[]> {
    const q = query(
      collection(db, 'questoes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Questao[];
  },

  async marcarQuestao(questaoId: string, acertou: boolean): Promise<void> {
    await this.atualizarQuestao(questaoId, { acertou });
  }
}; 