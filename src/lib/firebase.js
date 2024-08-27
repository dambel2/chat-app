import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import {getFirestore} from "firebase/firestore"
import {getStorage} from "firebase/storage"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "safeline-8e758.firebaseapp.com",
  projectId: "safeline-8e758",
  storageBucket: "safeline-8e758.appspot.com",
  messagingSenderId: "573915409354",
  appId: "1:573915409354:web:b71ae982eb5f5c5372bd33"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()