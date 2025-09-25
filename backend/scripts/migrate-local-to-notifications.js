const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const serviceAccount = require('../config/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
}

const db = admin.firestore();

async function migrate() {
  try {
    const filePath = path.join(__dirname, '..', 'public', 'notifications', 'comunicados', '2025-09', '9Zl1WTjl6AXfEQ.json');
    if (!fs.existsSync(filePath)) {
      console.error('Arquivo local não encontrado:', filePath);
      process.exit(1);
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const obj = JSON.parse(raw);

    const incomingPolos = obj.polo ? (Array.isArray(obj.polo) ? obj.polo : [obj.polo]) : [];
    const normalize = (s) => (s ? String(s).toLowerCase().trim().replace(/\s+/g, '') : '');

    const doc = {
      title: obj.titulo || obj.title || '',
      message: obj.conteudo || obj.message || '',
      type: 'comunicado',
      senderId: obj.autor || 'admin',
      autor: obj.autor || 'Admin',
      autorEmail: obj.autorEmail || '',
      categoria: obj.categoria || 'geral',
      polo: incomingPolos.length > 0 ? incomingPolos[0] : (obj.polo || ''),
      targetPolos: incomingPolos,
      targetPolosNormalized: incomingPolos.map(normalize),
      tags: obj.tags || obj.palavrasChave ? [obj.palavrasChave] : [],
      imagens: obj.imagens && obj.imagens.length > 0 ? obj.imagens : [],
      imageUrl: obj.imagens && obj.imagens.length > 0 ? obj.imagens[0] : null,
      status: obj.status || 'ativo',
      ativo: obj.ativo !== undefined ? obj.ativo : true,
      dataPublicacao: obj.dataPublicacao || new Date().toISOString(),
      timestamp: obj.timestamp || Date.now(),
      visualizacoes: obj.visualizacoes || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      origem: obj.origem || 'local-migration'
    };

    const ref = await db.collection('notifications').add(doc);
    console.log('Documento migrado com id:', ref.id);

    process.exit(0);
  } catch (err) {
    console.error('Erro durante migração:', err);
    process.exit(1);
  }
}

migrate();
