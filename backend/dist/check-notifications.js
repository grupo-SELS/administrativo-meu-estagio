"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("./config/firebase-admin");
async function checkNotifications() {
    try {
        const snapshot = await firebase_admin_1.db.collection('notifications').get();
        let index = 0;
        snapshot.forEach((doc) => {
            const data = doc.data();
            index++;
        });
        const comunicadosSnapshot = await firebase_admin_1.db.collection('notifications')
            .where('tipo', '==', 'comunicado')
            .get();
    }
    catch (error) {
        console.error('❌ Erro ao verificar notifications:', error);
    }
}
checkNotifications()
    .then(() => {
    console.log('\n✅ Verificação concluída');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});
//# sourceMappingURL=check-notifications.js.map