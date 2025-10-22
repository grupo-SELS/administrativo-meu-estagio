import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_AUTHDOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_PROJECTID || 'registro-itec-dcbc4',
  storageBucket: import.meta.env.VITE_STORAGEBUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID || '123456789',
  appId: import.meta.env.VITE_APPID || 'demo-app-id'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

auth.languageCode = 'pt-BR';

export default app;

