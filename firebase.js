// ================= IMPORT =================
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

// ✅ FIX 1: EXPORT AUTH
export const auth = getAuth(app);

// ✅ optional export
export const db = getFirestore(app);

// ================= SIGNUP =================
window.signupUser = async function(role) {

  let name = document.getElementById("name")?.value;
  let email = document.getElementById("email")?.value;
  let password = document.getElementById("password")?.value;

  if (!name || !email || !password) {
    showToast("Fill all fields ❌");
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

    showToast("Signup successful 🚀");

    window.location.href = role === "seeker"
      ? "jobseeker-login.html"
      : "recruiter-login.html";

  } catch (err) {
    showToast(err.message);
  }
};

// ================= LOGIN =================
window.loginUser = async function(role) {

  let email = document.getElementById("email")?.value;
  let password = document.getElementById("password")?.value;

  if (!email || !password) {
    showToast("Fill all fields ❌");
    return;
  }

  try {
    let userCred = await signInWithEmailAndPassword(auth, email, password);
    let uid = userCred.user.uid;

    let snap = await getDoc(doc(db, "users", uid));
    let user = snap.data();

    if (!user) {
      showToast("User not found ❌");
      return;
    }

    // ✅ FIX 2: role auto detect
    let userRole = user.role;

    localStorage.setItem("session", JSON.stringify(user));

    showToast("Login success 🚀");

    // ✅ smart redirect
    window.location.href = userRole === "seeker"
      ? "js-dashboard.html"
      : "rec-dashboard.html";

  } catch (error) {
    console.log(error);
    showToast("Login failed ❌");
  }
};

// ================= LOGOUT =================
window.firebaseLogout = async function() {
  await signOut(auth);
  localStorage.removeItem("session");
  window.location.href = "index.html";
};