import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE as string,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID as string,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const authService = auth();
const firestoreService = firestore();

export { app, authService, firebaseConfig, firestoreService };
export default app;

