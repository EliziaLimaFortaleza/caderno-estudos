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
    const docRef = await addDoc(collection(db, 'estudos'), {
      ...estudo,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async atualizarEstudo(id: string, dados: Partial<Estudo>): Promise<void> {
    const docRef = doc(db, 'estudos', id);
    await updateDoc(docRef, {
      ...dados,
      updatedAt: serverTimestamp()
    });
  },

  async deletarEstudo(id: string): Promise<void> {
    const docRef = doc(db, 'estudos', id);
    await deleteDoc(docRef);
  },

  async buscarEstudosPorUsuario(userId: string): Promise<Estudo[]> {
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
  },

  async buscarEstudoPorId(id: string): Promise<Estudo | null> {
    const docRef = doc(db, 'estudos', id);
    const docSnap = await getDocs(collection(db, 'estudos'));
    
    const estudo = docSnap.docs.find(doc => doc.id === id);
    if (estudo) {
      return { id: estudo.id, ...estudo.data() } as Estudo;
    }
    return null;
  }
}; 