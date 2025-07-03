import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
	apiKey: "AIzaSyAVGcFO_uSQ55wOCC3zVXTHZ9Vv7QSXQCI",
	authDomain: "smart-farming-6d820.firebaseapp.com",
	projectId: "smart-farming-6d820",
	storageBucket: "smart-farming-6d820.firebasestorage.app",
	messagingSenderId: "867791902795",
	appId: "1:867791902795:web:b96b8763ef63a2b67f55ce",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth();
const db = getDatabase(app);

export { app, auth, db };
