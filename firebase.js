  window.location.href = "index.html";
};// ================= IMPORT =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc
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

// ✅ ONLY ONE EXPORT
export const auth = getAuth(app);
export const db = getFirestore(app);

// ================= SIGNUP =================
export async function signupUser(role) {

  let name = document.getElementById("name")?.value;
  let email = document.getElementById("email")?.value;
  let password = document.getElementById("password")?.value;

  if (!name || !email || !password) {
    alert("Fill all fields ❌");
    return;
  }

  try {
    let userCred = await createUserWithEmailAndPassword(auth, email, password);
    let uid = userCred.user.uid;

    await setDoc(doc(db, "users", uid), {
      name,
      email,
      role,
      createdAt: new Date()
    });

    alert("Signup successful 🚀");

    window.location.href = role === "seeker"
      ? "jobseeker-login.html"
      : "recruiter-login.html";

  } catch (err) {
    alert(err.message);
  }
}

// ================= LOGIN =================
export async function loginUser() {

  let email = document.getElementById("email")?.value;
  let password = document.getElementById("password")?.value;

  if (!email || !password) {
    alert("Fill all fields ❌");
    return;
  }

  try {
    let userCred = await signInWithEmailAndPassword(auth, email, password);
    let uid = userCred.user.uid;

    let snap = await getDoc(doc(db, "users", uid));
    let user = snap.data();

    if (!user) {
      alert("User not found ❌");
      return;
    }

    localStorage.setItem("session", JSON.stringify(user));

    alert("Login success 🚀");

    window.location.href = user.role === "seeker"
      ? "js-dashboard.html"
      : "rec-dashboard.html";

  } catch (error) {
    console.log(error);
    alert("Login failed ❌");
  }
}

// ================= LOGOUT =================
export async function firebaseLogout() {
  await signOut(auth);
  localStorage.removeItem("session");
  window.location.href = "index.html";
}