import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAwZJRBIEUVzZa54-CV1XwuusWaSa-iYrk",
    authDomain: "infinite-mind-8f29c.firebaseapp.com",
    projectId: "infinite-mind-8f29c",
    storageBucket: "infinite-mind-8f29c.firebasestorage.app",
    messagingSenderId: "292561651156",
    appId: "1:292561651156:web:a7321c9d0051193006c241",
    measurementId: "G-PTNSKQM72B"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service (for Phase 3)
export const firestore = getFirestore(app);

// Initialize Cloud Storage
import { getStorage } from 'firebase/storage';
export const storage = getStorage(app);
