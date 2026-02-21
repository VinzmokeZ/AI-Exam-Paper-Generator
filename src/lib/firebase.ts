import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAb8C1FoPk7ciSt7L_X6y_73jEQmnN-WTA",
    authDomain: "ai-exam-paper-generator-3f43f.firebaseapp.com",
    projectId: "ai-exam-paper-generator-3f43f",
    storageBucket: "ai-exam-paper-generator-3f43f.firebasestorage.app",
    messagingSenderId: "856605617543",
    appId: "1:856605617543:web:745fb8c5061eff7a49f722",
    measurementId: "G-K156NN9CLW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
