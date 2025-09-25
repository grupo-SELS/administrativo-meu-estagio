"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUploads = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../public/uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = path_1.default.extname(file.originalname);
        const filename = `img_${timestamp}_${randomString}${extension}`;
        cb(null, filename);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
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
        const imageUrls = files.map(file => `/uploads/${file.filename}`);
        console.log('✅ URLs das imagens geradas:', imageUrls);
        req.body.imagens = imageUrls;
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
