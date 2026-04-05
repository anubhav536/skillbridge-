// ================= IMPORT =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


// ================= CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyAvT2lDQ8UFfe8iKdJ-SDnJi49H6OSUfxM",
  authDomain: "skill-bridge-f4316.firebaseapp.com",
  projectId: "skill-bridge-f4316",
  storageBucket: "skill-bridge-f4316.firebasestorage.app",
  messagingSenderId: "215570592226",
  appId: "1:215570592226:web:70812f81c5d3afc2a109bb"
};


// ================= INIT =================
const app = initializeApp(firebaseConfig);

// ✅ EXPORT (IMPORTANT)
export const auth = getAuth(app);
export const db = getFirestore(app);


// ================= LOGIN =================
export async function loginUser() {

  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) {
    alert("Fill all fields ❌");
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {
      alert("User data not found ❌");
      return;
    }

    const user = snap.data();

    localStorage.setItem("session", JSON.stringify(user));

    alert("Login success 🚀");

    // 🔥 role based redirect
    window.location.href = user.role === "seeker"
      ? "js-dashboard.html"
      : "rec-dashboard.html";

  } catch (err) {

    console.log("Login Error:", err.code);

    if (err.code === "auth/wrong-password") {
      alert("Wrong password ❌");
    } 
    else if (err.code === "auth/user-not-found") {
      alert("User not found ❌");
    } 
    else if (err.code === "auth/invalid-email") {
      alert("Invalid email ❌");
    } 
    else {
      alert("Login failed ❌");
    }
  }
}


// ================= LOGOUT =================
export async function logoutUser() {
  await signOut(auth);
  localStorage.removeItem("session");
  window.location.href = "index.html";
}