import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔥 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCe86GSmNHntr_QkAOBZQQXfk1-ZQ6PR1k",
  authDomain: "caderno-estudos.firebaseapp.com",
  projectId: "caderno-estudos",
  storageBucket: "caderno-estudos.firebasestorage.app",
  messagingSenderId: "1085872839107",
  appId: "1:1085872839107:web:abc3bacde269b4ffc5c576",
  measurementId: "G-Y0F6Q8P5T0"
};

// ⚠️ IMPORTANTE: Configure também no Firebase Console:
// 1. Authentication > Sign-in method > Ative "Email/Senha"
// 2. Firestore Database > Crie o banco de dados

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 