import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let serviceAccount: any;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require('./serviceAccountKey.json');
  }
} catch (error) {
  console.error('⚠️  Service Account Key não encontrado. Configure FIREBASE_SERVICE_ACCOUNT ou adicione serviceAccountKey.json');
  console.log('📖 Instruções: https://firebase.google.com/docs/admin/setup#initialize-sdk');
}

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
    });
    console.log('🔥 Firebase Admin SDK inicializado com sucesso');
    console.log(`📦 Storage Bucket: ${process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`}`);
  } catch (error: any) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
  }
} else if (!serviceAccount) {
  console.warn('⚠️ Firebase não inicializado - Service Account não configurado');
}

export const db = getFirestore();
export const storage = getStorage();
export const auth = admin.auth();
export { admin };
