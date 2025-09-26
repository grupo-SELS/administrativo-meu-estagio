import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID
};

console.log('🔥 Inicializando Firebase App...');

if (firebaseConfig.apiKey === import.meta.env.VITE_APIKEY) {
  console.error('❌ ERRO: Configurações do Firebase não foram definidas!');
  console.log('📖 Siga as instruções no código para obter as configurações');
}


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

auth.languageCode = 'pt-BR'; 

console.log('✅ Firebase inicializado');
console.log('📋 Project ID:', firebaseConfig.projectId);

export default app;