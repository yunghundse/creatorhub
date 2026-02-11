import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDMHZMVx3AYoL-Fy4u5CuIeHYbp4PvB9cw",
  authDomain: "project-9fc351c3-e213-4686-b5d.firebaseapp.com",
  projectId: "project-9fc351c3-e213-4686-b5d",
  storageBucket: "project-9fc351c3-e213-4686-b5d.firebasestorage.app",
  messagingSenderId: "459275533289",
  appId: "1:459275533289:web:7a63efcacd0a41c07d6978",
  measurementId: "G-LVGT20EQ4T"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
export default app
