import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'node:fs';
import * as path from 'node:path';

let serviceAccount: any;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('✅ Usando FIREBASE_SERVICE_ACCOUNT do .env');
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Procura o arquivo em múltiplos locais possíveis
    const possiblePaths = [
      path.join(__dirname, 'serviceAccountKey.json'),
      path.join(process.cwd(), 'config', 'serviceAccountKey.json'),
      '/var/www/site-adm-app/backend/config/serviceAccountKey.json'
    ];
    
    let fileFound = false;
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        console.log(`✅ Service Account encontrado em: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        serviceAccount = JSON.parse(fileContent);
        fileFound = true;
        break;
      }
    }
    
    if (!fileFound) {
      console.error('❌ Service Account Key não encontrado em nenhum dos caminhos:');
      for (const p of possiblePaths) {
        console.error(`   - ${p}`);
      }
    }
  }
} catch (error: any) {
  console.error('❌ Erro ao carregar Service Account Key:', error.message);
}

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
    });
  } catch (error: any) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
  }
} else if (!serviceAccount) {
  console.error('❌ Firebase não inicializado - Service Account não configurado');
}

export const db = getFirestore();
export const storage = getStorage();
export const auth = admin.auth();
export default admin; // NOSONAR
