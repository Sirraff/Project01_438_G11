// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: ["${env:API_KEY}"],
    authDomain: ["${env:AUTH_DOMAIN}"],
    databaseURL: ["${env:DATABASE_URL}"],
    projectId: ["${env:PROJECT_ID}"],
    storageBucket: ["${env:STORAGE_BUCKET}"],
    messagingSenderId: ["${env:MESSAGING_SENDER_ID}"],
    appId: ["${env:APP_ID}"],
    measurementId: ["${env:MEASUREMENT_ID}"]
  };


// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Firebase API copy pasta goes here(scrubbed for safety)


// Initialize Firebase

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

