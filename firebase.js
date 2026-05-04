// =====================================
// 🔥 SkillBridge AI CLEAN firebase.js
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
  setDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// =====================================
// 🔥 SkillBridge AI CLEAN firebase.js
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
  setDoc
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
    window.location.href = "jobseeker-dashboard.html";
    return;
  }
  if (role === "recruiter") {
    window.location.href = "recruiter-dashboard.html";
    return;
  }
  if (role === "admin") {
    window.location.href = "admin-dashboard.html";
    return;
  }
  window.location.href = "index.html";
}

// ---------- LOGIN ----------
export async function loginUser(btn = null) {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const cred = await signInWithEmailAndPassword(auth, email, password);

    const snap = await getDoc(doc(db, "users", cred.user.uid));

    if (!snap.exists()) {
      alert("User data not found ❌");
      return;
    }

    const user = snap.data();
    saveSession(user);
    redirectByRole(user.role);

  } catch (e) {
    console.error(e);
    alert(e.code);
  }
}

// ---------- SIGNUP ----------
export async function signupUser(role, btn = null) {
  try {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const userData = { name, email, role };

    await setDoc(doc(db, "users", cred.user.uid), userData);

    saveSession(userData);
    redirectByRole(role);

  } catch (e) {
    console.error(e);
    alert(e.code);
  }
}

// =====================================
// 🔐 LOGOUT
// =====================================
export async function logoutUser() {

  await signOut(auth);

  clearSession();

  window.location.href = "index.html";
}


// =====================================
// 🔐 RESET PASSWORD
// =====================================
export async function resetPassword(email) {

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Reset link sent ✅");
  } catch (e) {
    alert(e.message);
  }
}


// =====================================
// 🛡 PAGE PROTECTION
// =====================================
export function protectPage(role) {

  const user = getSession();

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  if (role && user.role !== role) {
    window.location.href = "index.html";
  }
}


// =====================================
// 🔄 AUTO SESSION
// =====================================
onAuthStateChanged(auth, async (firebaseUser) => {

  if (!firebaseUser) return;

  const snap = await getDoc(doc(db, "users", firebaseUser.uid));

  if (snap.exists()) {
    saveSession(snap.data());
  }

});


// =====================================
// ⚙️ HELPERS
// =====================================

// Loading button
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
    window.location.href = "jobseeker-dashboard.html";
    return;
  }

  if (role === "recruiter") {
    window.location.href = "recruiter-dashboard.html";
    return;
  }

  if (role === "admin") {
    window.location.href = "admin-dashboard.html";
    return;
  }

  window.location.href = "index.html";
}


// =====================================
// 🔐 LOGIN
// =====================================
export async function loginUser(btn = null) {

  setLoading(btn, true, "Logging in...");

  try {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Fill all fields ❌");
      return;
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);

    const snap = await getDoc(doc(db, "users", cred.user.uid));

    if (!snap.exists()) {
      alert("User data not found ❌");
      return;
    }

    const user = snap.data();

    saveSession(user);

    redirectByRole(user.role);

  } catch (e) {
    console.error(e);

    const errors = {
      "auth/user-not-found": "User not found ❌",
      "auth/wrong-password": "Wrong password ❌",
      "auth/invalid-email": "Invalid email ❌",
      "auth/too-many-requests": "Too many attempts ❌"
    };

    alert(errors[e.code] || e.message);
  }

  setLoading(btn, false);
}


// =====================================
// 🔐 SIGNUP
// =====================================
export async function signupUser(role, btn = null) {

  setLoading(btn, true, "Creating...");

  try {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
      alert("Fill all fields ❌");
      return;
    }

    if (password.length < 6) {
      alert("Password must be 6+ characters ❌");
      return;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const userData = {
      name,
      email,
      role, // 🔥 IMPORTANT
      createdAt: Date.now()
    };

    await setDoc(doc(db, "users", cred.user.uid), userData);

    saveSession(userData);

    redirectByRole(role);

  } catch (e) {

    console.error(e);

    const errors = {
      "auth/email-already-in-use": "Email already exists ❌",
      "auth/invalid-email": "Invalid email ❌",
      "auth/weak-password": "Weak password ❌"
    };

    alert(errors[e.code] || e.message);
  }

  setLoading(btn, false);
}


// =====================================
// 🔐 LOGOUT
// =====================================
export async function logoutUser() {

  await signOut(auth);

  clearSession();

  window.location.href = "index.html";
}


// =====================================
// 🔐 RESET PASSWORD
// =====================================
export async function resetPassword(email) {

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Reset link sent ✅");
  } catch (e) {
    alert(e.message);
  }
}


// =====================================
// 🛡 PAGE PROTECTION
// =====================================
export function protectPage(role) {

  const user = getSession();

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  if (role && user.role !== role) {
    window.location.href = "index.html";
  }
}


// =====================================
// 🔄 AUTO SESSION
// =====================================
onAuthStateChanged(auth, async (firebaseUser) => {

  if (!firebaseUser) return;

  const snap = await getDoc(doc(db, "users", firebaseUser.uid));

  if (snap.exists()) {
    saveSession(snap.data());
  }

});