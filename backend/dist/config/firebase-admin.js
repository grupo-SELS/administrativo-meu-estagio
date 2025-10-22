"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.storage = exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
let serviceAccount;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log('✅ Usando FIREBASE_SERVICE_ACCOUNT do .env');
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    else {
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
}
catch (error) {
    console.error('❌ Erro ao carregar Service Account Key:', error.message);
}
if (!firebase_admin_1.default.apps.length && serviceAccount) {
    try {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
        });
    }
    catch (error) {
        console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
    }
}
else if (!serviceAccount) {
    console.error('❌ Firebase não inicializado - Service Account não configurado');
}
exports.db = (0, firestore_1.getFirestore)();
exports.storage = (0, storage_1.getStorage)();
exports.auth = firebase_admin_1.default.auth();
exports.default = firebase_admin_1.default;
//# sourceMappingURL=firebase-admin.js.map