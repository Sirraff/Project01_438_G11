# 🍓 🍑 🥝 Seasonal Bites  🌽 🥕 🥔

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


## 🎯 Introduction

* Communication was managed through Slack, in person meetings and Github issues/notifications.
* There were initially around 12 stories but we ended up completing 19, mainly due story splitting
* 19 issues were completed
* Repo: https://github.com/Sirraff/Project01_438_G11
* [Video Walkthrough](https://drive.google.com/file/d/1dS11fqcqXaI-1W1BZGK4fxTfXqf9eO5I/view?usp=sharing)

## 👥 Team Retrospective

### [Rafael L.S. Reis](https://github.com/Sirraff)

- [Pull Requests](https://github.com/Sirraff/Project01_438_G11/pulls?q=is%3Apr+is%3Aclosed+author%3ASirraff)
- [Issues Resolved](https://github.com/Sirraff/Project01_438_G11/issues?q=is%3Aissue%20state%3Aclosed%20assignee%3ASirraff)

#### What was your role / which stories did you work on?

Raf primarily handled project setup, user authentication, and enhancements to existing features like the Search functionality and styling.

- **What was the biggest challenge?**  
  The biggest challenge was ensuring dependency compatibility.

- **Why was it a challenge?**  
  Some dependencies worked with React 18, while others required React 19, so synchronizing everything to run properly was tricky.

- **How was the challenge addressed?**  
  Since AI wasn't very helpful for these newer technologies, we relied on extensive documentation and numerous StackOverflow posts for solutions.

- **Favorite / most interesting part of this project**  
  The most interesting part was working with Firebase and creating our own APIs.

- **If you could do it over, what would you change?**  
  We would choose dependencies that fully align with the selected React version and start our testing process earlier.

- **What is the most valuable thing you learned?**  
  We adopted a "move fast and break things" approach, which initially worked but resulted in setbacks such as inadequate modularization, poor code quality, and increased technical debt.


### [Roberto Palacios](https://github.com/RPalaciosDev)
+ [Pull Requests](https://github.com/Sirraff/Project01_438_G11/pulls?q=is%3Apr+is%3Aclosed+author%3ARPalaciosDev)

+ [Issues Resolved](https://github.com/Sirraff/Project01_438_G11/issues?q=is%3Aissue%20state%3Aclosed%20assignee%3ARPalaciosDev)

#### What was your role / which stories did you work on
My main job was database managment both of our local SQLite database and our Firebase Firestore. This included designing these systems and setting up the pages that made the most use of these resources. 

+ What was the biggest challenge? 
  + My biggest challenge was designing the databases and retrieving information.
+ Why was it a challenge?
  + We didn't have tools or tests to help us figure out what was going on with our databases. 
+ How was the challenge addressed?
  + We spammed console logs until we were able to find the source of our errors or we asked AI to point us in the right direction.
+ Favorite / most interesting part of this project
  + Before this, I was a bit scared of Firebase and now it's deeply integrated into our app.
+ If you could do it over, what would you change?
  + I would probably use a ready-made API and spend more time during our planing phases.
+ What is the most valuable thing you learned?
  + Git is your friend* when it comes to saving your hide when things go south. (*until it's not)
    
### [Ozzie Munoz](https://github.com/OzzieMunoz)

- [Pull Requests](https://github.com/Sirraff/Project01_438_G11/pulls?q=is%3Apr+is%3Aclosed+author%3AOzzieMunoz)
- [Issues Resolved](https://github.com/Sirraff/Project01_438_G11/issues?q=is%3Aissue%20state%3Aclosed%20assignee%3AOzzieMunoz)

#### What was your role / which stories did you work on?

Focused on building core functionality for the app like Create Account, Navigation, and User Settings. 

- **What was the biggest challenge?**  
  The biggest challenge was ensuring Dark Mode persisted globally and updated in real time across all screens.
  
- **Why was it a challenge?**
  Initially, each screen handled the theme independently, meaning when a user toggled dark mode in the Settings page, the change wasn't refeclted across other screens. 

- **How was the challenge addressed?**  
  It wasn't.

  At least not yet due to time constraints. 

- **Favorite / most interesting part of this project**
  The most interesting part was adding user preferences and making the app more interactive for the user. 

- **If you could do it over, what would you change?**
  Organize and clean up the styles earlier in the development process to avoid a major refactor at the end.
  
- **What is the most valuable thing you learned?**  
  The importance of setting up a clean and organized structure from the beginning to save time and prevent unnecessary rework.


### Chris Rensel-Smith

---
## ✨ Conclusion

- **How successful was the project?**  
  We set out to create a user-friendly app for tracking seasonal produce, delivering on key features like user authentication, region-based availability, local storage, and our own API. The only stretch goal not fully implemented was the user email notification system for produce going into season, though most of the groundwork is done aside from the cloud email integration. Overall, we went beoynd the essential scope.

- **What was the largest victory?**  
  Our biggest triumph was integrating Firebase smoothly amid complex dependencies, ensuring reliable user authentication and efficient data fetching.

- **Final assessment of the project**  
  The project effectively demonstrates the main functionality needed to track seasonal produce. As of now, it’s a solid MVP for Android. Additional testing, polish, and completion of the email notification system would be needed before a full deployment.

---

## 📥 Installation & Setup

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/Sirraff/Project01_438_G11.git
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
  - Copy your Firebase configuration into a file within the root(e.g., FirebaseConfig.ts) in your project. For example:
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
   
[MIT License](https://github.com/Sirraff/Project01_438_G11/edit/main/LICENSE)
