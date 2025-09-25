"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
exports.uploadToFirebaseStorage = uploadToFirebaseStorage;
exports.processUploads = processUploads;
exports.deleteFromFirebaseStorage = deleteFromFirebaseStorage;
exports.saveComunicadoToFirebaseStorage = saveComunicadoToFirebaseStorage;
exports.getComunicadosFromFirebaseStorage = getComunicadosFromFirebaseStorage;
exports.getComunicadoByIdFromFirebaseStorage = getComunicadoByIdFromFirebaseStorage;
exports.deleteComunicadoFromFirebaseStorage = deleteComunicadoFromFirebaseStorage;
const multer_1 = __importDefault(require("multer"));
const _Retornar_URL_p_blica_1 = require("../config/fi    // Retornar URL p\u00FAblica");
const publicUrl = `/notifications/images/${fileName}`;
console.log(`🔗 URL pública gerada: ${publicUrl}`);
ase - admin;
';;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Apenas arquivos de imagem são permitidos (jpg, jpeg, png, gif, webp)'));
        }
    }
});
exports.uploadMiddleware = upload.array('imagens', 5);
const notificationsDir = path_1.default.resolve(__dirname, '..', 'public', 'notifications');
console.log(`📁 Caminho de notifications: ${notificationsDir}`);
if (!fs_1.default.existsSync(notificationsDir)) {
    fs_1.default.mkdirSync(notificationsDir, { recursive: true });
    console.log(`📁 Diretório de notifications criado: ${notificationsDir}`);
}
else {
    console.log(`📁 Diretório de notifications já existe: ${notificationsDir}`);
}
async function saveImageLocally(file) {
    try {
        const baseDir = path_1.default.resolve(__dirname, '..', 'public', 'notifications', 'images');
        if (!fs_1.default.existsSync(baseDir)) {
            fs_1.default.mkdirSync(baseDir, { recursive: true });
            console.log(`📁 Diretório criado: ${baseDir}`);
        }
        const timestamp = Date.now();
        const randomString = crypto_1.default.randomBytes(8).toString('hex');
        const fileExtension = path_1.default.extname(file.originalname);
        const fileName = `img_${timestamp}_${randomString}${fileExtension}`;
        const filePath = path_1.default.join(baseDir, fileName);
        console.log(`💾 Salvando arquivo: ${file.originalname} → ${fileName}`);
        console.log(`📁 Caminho completo: ${filePath}`);
        await fs_1.default.promises.writeFile(filePath, file.buffer);
        const exists = fs_1.default.existsSync(filePath);
        console.log(`✅ Arquivo salvo: ${exists ? 'SIM' : 'NÃO'}`);
        const publicUrl = `/uploads/${fileName}`;
        console.log(`� URL pública gerada: ${publicUrl}`);
        return publicUrl;
    }
    catch (error) {
        console.error('❌ Erro ao salvar imagem localmente:', error);
        throw new Error(`Falha ao salvar imagem: ${error.message}`);
    }
}
async function testFirebaseStorage() {
    try {
        const bucket = _Retornar_URL_p_blica_1.storage.bucket();
        console.log(`🔍 Testando bucket: ${bucket.name}`);
        const [exists] = await bucket.exists();
        if (!exists) {
            console.error(`❌ Bucket ${bucket.name} não existe`);
            return false;
        }
        console.log(`✅ Bucket ${bucket.name} acessível`);
        return true;
    }
    catch (error) {
        console.error('❌ Erro ao testar Firebase Storage:', error.message);
        return false;
    }
}
async function uploadToFirebaseStorage(files) {
    try {
        console.log(`📁 Iniciando upload de ${files.length} arquivo(s)...`);
        const isStorageAvailable = await testFirebaseStorage();
        if (!isStorageAvailable) {
            throw new Error('Firebase Storage não está acessível');
        }
        const bucket = _Retornar_URL_p_blica_1.storage.bucket();
        console.log(`📦 Usando bucket: ${bucket.name}`);
        const uploadPromises = files.map(async (file, index) => {
            console.log(`📸 Processando arquivo ${index + 1}/${files.length}: ${file.originalname} (${(file.size / 1024).toFixed(1)}KB)`);
            const timestamp = Date.now();
            const randomString = crypto_1.default.randomBytes(8).toString('hex');
            const fileExtension = path_1.default.extname(file.originalname);
            const fileName = `artifacts/registro-itec-dcbc4/public/data/notifications/images/img_${timestamp}_${randomString}${fileExtension}`;
            const fileUpload = bucket.file(fileName);
            await fileUpload.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                    metadata: {
                        uploadedAt: new Date().toISOString(),
                        originalName: file.originalname,
                        size: file.size.toString()
                    }
                },
                public: true
            });
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            console.log(`✅ Upload concluído: ${fileName} → ${publicUrl}`);
            return publicUrl;
        });
        const results = await Promise.all(uploadPromises);
        console.log(`🎉 Todos os uploads concluídos com sucesso! ${results.length} arquivo(s)`);
        return results;
    }
    catch (error) {
        console.error('❌ Erro detalhado no upload:', error);
        if (error.code) {
            console.error(`📋 Código do erro: ${error.code}`);
        }
        if (error.details) {
            console.error(`📋 Detalhes: ${error.details}`);
        }
        throw new Error(`Falha no upload para Firebase Storage: ${error.message}`);
    }
}
async function processUploads(req, res, next) {
    try {
        console.log('🔄 Processando uploads...');
        console.log(`📊 Files recebidos:`, req.files ? req.files.length : 0);
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            console.log(`📁 Processando ${req.files.length} arquivo(s)...`);
            req.files.forEach((file, index) => {
                console.log(`📷 Arquivo ${index + 1}: ${file.originalname} (${file.mimetype}, ${(file.size / 1024).toFixed(1)}KB)`);
            });
            try {
                console.log('☁️ Tentando Firebase Storage...');
                const imageUrls = await uploadToFirebaseStorage(req.files);
                req.body.imagens = imageUrls;
                console.log(`✅ Upload para Firebase concluído: ${imageUrls.length} arquivo(s)`);
                console.log(`🔗 URLs do Firebase:`, imageUrls);
            }
            catch (storageError) {
                console.error('⚠️ Erro no Firebase Storage:', storageError.message);
                console.log('💾 Tentando salvar localmente como fallback...');
                try {
                    const localUrls = await Promise.all(req.files.map(async (file) => {
                        return await saveImageLocally(file);
                    }));
                    req.body.imagens = localUrls;
                    console.log(`✅ Imagens salvas localmente com sucesso: ${localUrls.length} arquivo(s)`);
                    console.log(`🔗 URLs locais geradas:`, localUrls);
                }
                catch (localError) {
                    console.error('⚠️ Erro no armazenamento local:', localError.message);
                    console.log('📝 Gerando URLs de demonstração...');
                    const demoUrls = req.files.map((file, index) => {
                        const imageIds = [100, 200, 300, 400, 500];
                        const imageId = imageIds[index % imageIds.length];
                        return `https://picsum.photos/800/600?random=${imageId}`;
                    });
                    req.body.imagens = demoUrls;
                    req.body.uploadError = `Armazenamento local e Firebase Storage não disponíveis. Usando imagens de demonstração.`;
                    console.log(`🔗 URLs de demonstração geradas:`, demoUrls);
                }
            }
        }
        else {
            console.log('📝 Nenhum arquivo recebido, continuando...');
            req.body.imagens = [];
        }
        next();
    }
    catch (error) {
        console.error('❌ Erro crítico no processamento de uploads:', error);
        req.body.imagens = [];
        req.body.uploadError = error.message;
        next();
    }
}
async function deleteFromFirebaseStorage(imageUrls) {
    try {
        const bucket = _Retornar_URL_p_blica_1.storage.bucket();
        const deletePromises = imageUrls.map(async (url) => {
            if (url.startsWith('/uploads/')) {
                const fileName = path_1.default.basename(url);
                const filePath = path_1.default.join(uploadsDir, fileName);
                try {
                    await fs_1.default.promises.unlink(filePath);
                    console.log(`🗑️ Imagem local deletada: ${fileName}`);
                }
                catch (error) {
                    console.error(`❌ Erro ao deletar imagem local ${fileName}:`, error.message);
                }
            }
            else if (url.includes(bucket.name)) {
                const fileName = url.split(`${bucket.name}/`)[1];
                if (fileName) {
                    const file = bucket.file(fileName);
                    await file.delete();
                    console.log(`🗑️ Imagem do Firebase deletada: ${fileName}`);
                }
            }
        });
        await Promise.all(deletePromises);
    }
    catch (error) {
        console.error('Erro ao deletar imagens:', error);
    }
}
async function saveComunicadoToFirebaseStorage(comunicado) {
    try {
        const bucket = _Retornar_URL_p_blica_1.storage.bucket();
        const fileName = `artifacts/registro-itec-dcbc4/public/data/notifications/comunicados/${comunicado.id}.json`;
        const file = bucket.file(fileName);
        await file.save(JSON.stringify(comunicado, null, 2), {
            metadata: {
                contentType: 'application/json',
                metadata: {
                    uploadedAt: new Date().toISOString(),
                    comunicadoId: comunicado.id
                }
            },
            public: true
        });
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        console.log(`✅ Comunicado salvo no Firebase Storage: ${fileName}`);
        return publicUrl;
    }
    catch (error) {
        console.error('❌ Erro ao salvar comunicado no Firebase Storage:', error);
        console.log('🔄 Tentando fallback para armazenamento local...');
        try {
            const localDir = path_1.default.join(uploadsDir, 'comunicados');
            await fs_1.default.promises.mkdir(localDir, { recursive: true });
            const localFilePath = path_1.default.join(localDir, `${comunicado.id}.json`);
            await fs_1.default.promises.writeFile(localFilePath, JSON.stringify(comunicado, null, 2));
            const localUrl = `/uploads/comunicados/${comunicado.id}.json`;
            console.log(`✅ Comunicado salvo localmente: ${localFilePath}`);
            return localUrl;
        }
        catch (localError) {
            console.error('❌ Erro também no armazenamento local:', localError);
            throw new Error(`Firebase Storage e armazenamento local falharam: ${error.message}`);
        }
    }
}
async function getComunicadosFromFirebaseStorage() {
    try {
        const bucket = _Retornar_URL_p_blica_1.storage.bucket();
        const prefix = 'artifacts/registro-itec-dcbc4/public/data/notifications/';
        const [files] = await bucket.getFiles({ prefix });
        const comunicados = [];
        for (const file of files) {
            if (file.name.endsWith('.json')) {
                try {
                    const [content] = await file.download();
                    const comunicado = JSON.parse(content.toString());
                    comunicados.push(comunicado);
                }
                catch (error) {
                    console.error(`❌ Erro ao ler comunicado ${file.name}:`, error);
                }
            }
        }
        comunicados.sort((a, b) => b.timestamp - a.timestamp);
        console.log(`📋 ${comunicados.length} comunicados carregados do Firebase Storage`);
        return comunicados;
    }
    catch (error) {
        console.error('❌ Erro ao buscar comunicados do Firebase Storage:', error);
        console.log('🔄 Tentando fallback para armazenamento local...');
        try {
            const localDir = path_1.default.join(uploadsDir, 'comunicados');
            const comunicados = [];
            if (await fs_1.default.promises.access(localDir).then(() => true).catch(() => false)) {
                const files = await fs_1.default.promises.readdir(localDir);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        try {
                            const filePath = path_1.default.join(localDir, file);
                            const content = await fs_1.default.promises.readFile(filePath, 'utf-8');
                            const comunicado = JSON.parse(content);
                            comunicados.push(comunicado);
                        }
                        catch (error) {
                            console.error(`❌ Erro ao ler comunicado local ${file}:`, error);
                        }
                    }
                }
            }
            comunicados.sort((a, b) => b.timestamp - a.timestamp);
            console.log(`📋 ${comunicados.length} comunicados carregados do armazenamento local`);
            return comunicados;
        }
        catch (localError) {
            console.error('❌ Erro também no armazenamento local:', localError);
            return [];
        }
    }
}
async function getComunicadoByIdFromFirebaseStorage(id) {
    try {
        const bucket = _Retornar_URL_p_blica_1.storage.bucket();
        const fileName = `artifacts/registro-itec-dcbc4/public/data/notifications/comunicados/${id}.json`;
        const file = bucket.file(fileName);
        const [exists] = await file.exists();
        if (!exists) {
            return null;
        }
        const [content] = await file.download();
        const comunicado = JSON.parse(content.toString());
        console.log(`📋 Comunicado ${id} carregado do Firebase Storage`);
        return comunicado;
    }
    catch (error) {
        console.error(`❌ Erro ao buscar comunicado ${id} do Firebase Storage:`, error);
        console.log('🔄 Tentando fallback para armazenamento local...');
        try {
            const localDir = path_1.default.join(uploadsDir, 'comunicados');
            const localFilePath = path_1.default.join(localDir, `${id}.json`);
            if (await fs_1.default.promises.access(localFilePath).then(() => true).catch(() => false)) {
                const content = await fs_1.default.promises.readFile(localFilePath, 'utf-8');
                const comunicado = JSON.parse(content);
                console.log(`📋 Comunicado ${id} carregado do armazenamento local`);
                return comunicado;
            }
            return null;
        }
        catch (localError) {
            console.error(`❌ Erro também no armazenamento local para ${id}:`, localError);
            return null;
        }
    }
}
async function deleteComunicadoFromFirebaseStorage(id) {
    try {
        const bucket = _Retornar_URL_p_blica_1.storage.bucket();
        const fileName = `artifacts/registro-itec-dcbc4/public/data/notifications/comunicados/${id}.json`;
        const file = bucket.file(fileName);
        await file.delete();
        console.log(`🗑️ Comunicado ${id} deletado do Firebase Storage`);
    }
    catch (error) {
        console.error(`❌ Erro ao deletar comunicado ${id} do Firebase Storage:`, error);
        console.log('🔄 Tentando fallback para armazenamento local...');
        try {
            const localDir = path_1.default.join(uploadsDir, 'comunicados');
            const localFilePath = path_1.default.join(localDir, `${id}.json`);
            if (await fs_1.default.promises.access(localFilePath).then(() => true).catch(() => false)) {
                await fs_1.default.promises.unlink(localFilePath);
                console.log(`🗑️ Comunicado ${id} deletado do armazenamento local`);
            }
        }
        catch (localError) {
            console.error(`❌ Erro também no armazenamento local para deletar ${id}:`, localError);
            throw new Error(`Firebase Storage e armazenamento local falharam: ${error.message}`);
        }
    }
}
