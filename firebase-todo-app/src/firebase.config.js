import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC01QaQ_cPlb1zOxPVnKNdNe33ce4gMiJw",
  authDomain: "todo-app1-9d58d.firebaseapp.com",
  projectId: "todo-app1-9d58d",
  storageBucket: "todo-app1-9d58d.firebasestorage.app",
  messagingSenderId: "735407436500",
  appId: "1:735407436500:web:6740262e29625ace9b4141",
  measurementId: "G-8NG2ZZSW5H"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);