"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUploads = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
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
            cb(new Error('Apenas arquivos de imagem são permitidos'));
        }
    }
});
exports.uploadMiddleware = upload.array('imagens', 5);
const processUploads = async (req, res, next) => {
    try {
        const files = req.files;
        const uploadError = req.body.uploadError;
        console.log(`📤 processUploads - ${files ? files.length : 0} arquivos recebidos`);
        if (uploadError) {
            console.log(`⚠️ Upload Error detectado: ${uploadError}`);
            req.body.imagens = [];
            return next();
        }
        if (!files || files.length === 0) {
            console.log('📷 Nenhum arquivo para processar');
            req.body.imagens = [];
            return next();
        }
        console.log('🔄 Processando arquivos recebidos pelo upload');
        req.body.imagens = [`/notifications/comunicados/imagem-placeholder.jpg`];
        next();
    }
    catch (error) {
        console.error('❌ Erro no processamento de uploads:', error);
        req.body.uploadError = error.message;
        req.body.imagens = [];
        next();
    }
};
exports.processUploads = processUploads;
//# sourceMappingURL=uploadMiddleware-backup.js.map