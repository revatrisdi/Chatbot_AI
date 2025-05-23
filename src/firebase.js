import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { collection, addDoc, getDocs } from "@firebase/firestore"; // Perbarui ini


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNPrl8gxGqfARXg5q87wY78-ZVyRXCGL0",
  authDomain: "desa-wonokerseo-website.firebaseapp.com",
  databaseURL: "https://desa-wonokerseo-website-default-rtdb.firebaseio.com/",
  projectId: "desa-wonokerseo-website",
  storageBucket: "desa-wonokerseo-website.firebasestorage.app",
  messagingSenderId: "1010620654476",
  appId: "1:1010620654476:web:12ed28bb67f9d581e32ca9",
  measurementId: "G-NNC8VS32ER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc };