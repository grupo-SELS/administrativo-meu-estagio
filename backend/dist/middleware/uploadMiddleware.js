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
        if (uploadError) {
            req.body.imagens = [];
            return next();
        }
        if (!files || files.length === 0) {
            req.body.imagens = [];
            return next();
        }
        const fs = require('fs');
        const path = require('path');
        const crypto = require('crypto');
        const uploadDir = __dirname.includes('dist')
            ? path.join(__dirname, '../../public/uploads')
            : path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const imagePaths = [];
        for (const file of files) {
            const randomName = crypto.randomBytes(8).toString('hex');
            const ext = path.extname(file.originalname);
            const filename = `img_${Date.now()}_${randomName}${ext}`;
            const filePath = path.join(uploadDir, filename);
            fs.writeFileSync(filePath, file.buffer);
            imagePaths.push(`/uploads/${filename}`);
        }
        req.body.imagens = imagePaths;
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
//# sourceMappingURL=uploadMiddleware.js.map