// =====================================
// 🔥 SkillBridge AI FINAL firebase.js (FIXED)
// =====================================


// ---------- IMPORTS ----------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


// ---------- CONFIG ----------
const firebaseConfig = {
  apiKey: "AIzaSyAvT2lDQ8UFfe8iKdJ-SDnJi49H6OSUfxM",
  authDomain: "skill-bridge-f4316.firebaseapp.com",
  projectId: "skill-bridge-f4316",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


// =====================================
// ⚙️ HELPERS
// =====================================

async function safeRun(fn) {
  try {
    return await fn();
  } catch (e) {
    console.error("Firebase Error:", e);

    const errors = {
      "auth/wrong-password": "Wrong password ❌",
      "auth/user-not-found": "User not found ❌",
      "auth/email-already-in-use": "Email already exists ❌",
      "auth/weak-password": "Password must be 6+ chars ❌",
    };

    alert(errors[e.code] || e.message);
  }
}

function setLoading(btn, state, text = "Please wait...") {
  if (!btn) return;

  if (state) {
    btn.dataset.old = btn.innerText;
    btn.innerText = text;
    btn.disabled = true;
  } else {
    btn.innerText = btn.dataset.old || "Submit";
    btn.disabled = false;
  }
}


// ---------- SESSION ----------
function saveSession(user) {
  localStorage.setItem("session", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("session");
}

export function getSession() {
  return JSON.parse(localStorage.getItem("session"));
}


// ---------- REDIRECT ----------
function redirectByRole(role) {

  if (role === "jobseeker") {
    location.href = "jobseeker-dashboard.html";
    return;
  }

  if (role === "recruiter") {
    location.href = "recruiter-dashboard.html";
    return;
  }

  if (role === "admin") {
    location.href = "admin-dashboard.html";
    return;
  }

  location.href = "index.html";
}



// =====================================
// 🔐 AUTH SYSTEM
// =====================================

// LOGIN
export async function loginUser(btn = null) {

  setLoading(btn, true, "Logging in...");

  await safeRun(async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Fill all fields ❌");
      return;
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);

    const snap = await getDoc(doc(db, "users", cred.user.uid));

    if (!snap.exists()) {
      alert("User data missing ❌");
      return;
    }

    const user = snap.data();

    saveSession(user);

    redirectByRole(user.role);

  });

  setLoading(btn, false);
}


// SIGNUP
export async function signupUser(role, btn = null) {

  setLoading(btn, true, "Creating...");

  let createdUser = null;

  await safeRun(async () => {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
      alert("Fill all fields ❌");
      return;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const userData = {
      name,
      email,
      role, // 🔥 consistent role
      createdAt: Date.now()
    };

    await setDoc(doc(db, "users", cred.user.uid), userData);

    saveSession(userData);

    createdUser = cred.user;

    redirectByRole(role);

  });

  setLoading(btn, false);

  return createdUser;
}


// LOGOUT
export async function logoutUser() {
  await signOut(auth);
  clearSession();
  location.href = "index.html";
}


// RESET PASSWORD
export async function resetPassword(email) {
  await safeRun(async () => {
    await sendPasswordResetEmail(auth, email);
    alert("Reset link sent ✅");
  });
}



// =====================================
// 🛡 PAGE SECURITY
// =====================================

export function protectPage(role = null) {

  const user = getSession();

  if (!user) {
    location.href = "index.html";
    return;
  }

  if (role && user.role !== role) {
    location.href = "index.html";
  }
}


// LOGIN PAGE REDIRECT FIX
export function checkSessionUI() {

  const user = getSession();
  if (!user) return;

  const path = location.pathname;

  // ❌ login/signup pe force redirect mat karo
  if (path.includes("login") || path.includes("signup")) return;

  redirectByRole(user.role);
}


// =====================================
// 🔄 AUTO SESSION SYNC
// =====================================

onAuthStateChanged(auth, async (firebaseUser) => {

  if (!firebaseUser) return;

  const snap = await getDoc(doc(db, "users", firebaseUser.uid));

  if (snap.exists()) {
    saveSession(snap.data());
  }

});