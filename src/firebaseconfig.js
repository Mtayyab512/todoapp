import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCOdngNxO0ZybHaRCHjc6Y74wnRyejRKfI",
    authDomain: "todo-app-3e5ca.firebaseapp.com",
    projectId: "todo-app-3e5ca",
    storageBucket: "todo-app-3e5ca.appspot.com",
    messagingSenderId: "901886488525",
    appId: "1:901886488525:web:d23c7226166770c0559e84",
    measurementId: "G-D7Z7RKSPMS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };