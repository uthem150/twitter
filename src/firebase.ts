import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC132Lyc05XtHEPOyqp_GMbWYLUTf--cvQ",
  authDomain: "twitter-51b11.firebaseapp.com",
  projectId: "twitter-51b11",
  storageBucket: "twitter-51b11.appspot.com",
  messagingSenderId: "694978790197",
  appId: "1:694978790197:web:27d870c83c0d1a208d827c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// app에 대해 인증을 사용하겠다 - 인증 인스턴스
export const auth = getAuth(app);
