// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDDuDNNGIXTPovZo-sJvzEc2T3UyrTev2s",
    authDomain: "seasonalbites-c7d26.firebaseapp.com",
    databaseURL: "https://seasonalbites-c7d26-default-rtdb.firebaseio.com",
    projectId: "seasonalbites-c7d26",
    storageBucket: "seasonalbites-c7d26.firebasestorage.app",
    messagingSenderId: "701729845184",
    appId: "1:701729845184:web:015a8ad1013ac2dbf52225",
    measurementId: "G-4WD6F8F0BJ"
  };

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Firebase API copy pasta goes here(scrubbed for safety)

// Initialize Firebase

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);