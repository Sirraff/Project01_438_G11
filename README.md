# 🍓 Seasonal Bites  

Seasonal Bites is a simple React Native app that helps users track their favorite fruits and veggies check if they are in season based on their region.  

## 🚀 Features  

- **User Authentication**: Secure login and registration using Firebase Authentication.  
- **Produce Search**: Query a database of fruits and vegetables stored in our in-house Firestore API.  
- **Tracker System**: Users can add fruits to their tracker and get real-time updates on seasonal availability.  
- **Region-Based Availability**: The app determines if a fruit is in season based on the user's selected region.  
- **Local Storage**: User preferences and tracked fruits are stored locally for quick access.  

## 🛠 Tech Stack  

- **Framework**: React Native (Expo)  
- **Navigation**: React Navigation  
- **Backend & Database**: Firebase Firestore  
- **Authentication**: Firebase Auth  
- **State Management**: React Context API (or Redux if needed)  
- **Local Storage**: AsyncStorage and SQLite(for user preferences and tracked fruits)  

---

## 📥 Installation & Setup

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/yourusername/seasonal-bites.git
   cd seasonal-bites
   ```
2. **Install Dependencies**
   ```bash
   npm install
   # If you encounter peer dependency issues, try:
   npm install --legacy-peer-deps
   ```
3. **Configure Firebase**
  - Create a Firebase project at Firebase Console.
  - Enable Firebase Authentication & Firestore.
  - Copy your Firebase configuration into a file (e.g., FirebaseConfig.ts) in your project. For example:
  ```bash
  // FirebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(app);
export const FIRESTORE_DB = getFirestore(app);
```
4. **Run the App**
```bash
npx expo start
```

## 🤝 Contributing
- Fork this repository.
- Create a feature branch (git checkout -b feature/awesome-feature).
- Commit your changes.
- Push to the branch.
- Create a new Pull Request.
   
   
