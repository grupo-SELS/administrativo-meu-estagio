import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBEzMkuCK7jLhP1PNwq6S9r1q7mCKr_Y8I",
  authDomain: "registro-itec-dcbc4.firebaseapp.com",
  projectId: "registro-itec-dcbc4",
  storageBucket: "registro-itec-dcbc4.appspot.com",
  messagingSenderId: "432984556",
  appId: "1:432984556:web:abc123def456ghi789"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app