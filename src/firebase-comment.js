import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { collection, addDoc } from "@firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyBNPrl8gxGqfARXg5q87wY78-ZVyRXCGL0",
    authDomain: "desa-wonokerseo-website.firebaseapp.com",
    projectId: "desa-wonokerseo-website",
    databaseURL: "https://desa-wonokerseo-website-default-rtdb.firebaseio.com/",
    storageBucket: "desa-wonokerseo-website.firebasestorage.app",
    messagingSenderId: "1010620654476",
    appId: "1:1010620654476:web:12ed28bb67f9d581e32ca9",
    measurementId: "G-NNC8VS32ER"
};

// Initialize with a unique name
const app = initializeApp(firebaseConfig, 'comments-app');
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, collection, addDoc };