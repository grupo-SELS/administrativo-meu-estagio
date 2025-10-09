"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.auth = exports.storage = exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
let serviceAccount;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    else {
        serviceAccount = require('./serviceAccountKey.json');
    }
}
catch (error) {
    console.error('❌ Service Account Key não encontrado. Configure FIREBASE_SERVICE_ACCOUNT ou adicione serviceAccountKey.json');
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
//# sourceMappingURL=firebase-admin.js.map