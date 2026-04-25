// ===============================
// 🔥 SkillBridge AI PRO firebase.js
// Clean • Fast • Smart • Scalable
// ===============================

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
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
};


// ---------- INIT ----------
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


// ===============================
// ⚙️ HELPERS
// ===============================

// Safe async runner
async function safeRun(fn) {
  try {
    return await fn();
  } catch (e) {

    if (e?.name === "AbortError") return;

    console.log("Handled:", e);

    const errors = {
      "auth/wrong-password": "Wrong password ❌",
      "auth/user-not-found": "User not found ❌",
      "auth/email-already-in-use": "Email already exists ❌",
      "auth/invalid-email": "Invalid email ❌",
      "auth/weak-password": "Weak password ❌"
    };

    alert(errors[e.code] || "Something went wrong ❌");
  }
}


// Loading Button
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


// Save Session
function saveSession(user) {
  localStorage.setItem("session", JSON.stringify(user));
}


// Get Session
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("session"));
  } catch {
    localStorage.removeItem("session");
    return null;
  }
}


// Clear Session
function clearSession() {
  localStorage.removeItem("session");
}


// Redirect by Role
function redirectByRole(role) {
  location.href =
    role === "seeker"
      ? "js-dashboard.html"
      : "rec-dashboard.html";
}


// ===============================
// 🔐 AUTH SYSTEM
// ===============================

// LOGIN
export async function loginUser(btn = null) {

  setLoading(btn, true);

  await safeRun(async () => {

    const email =
      document.getElementById("email")?.value.trim();

    const password =
      document.getElementById("password")?.value.trim();

    if (!email || !password) {
      alert("Fill all fields ❌");
      return;
    }

    const cred =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    const snap =
      await getDoc(doc(db, "users", cred.user.uid));

    if (!snap.exists()) {
      alert("User not found ❌");
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

  await safeRun(async () => {

    const name =
      document.getElementById("name")?.value.trim();

    const email =
      document.getElementById("email")?.value.trim();

    const password =
      document.getElementById("password")?.value.trim();

    if (!name || !email || !password) {
      alert("Fill all fields ❌");
      return;
    }

    const cred =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const userData = {
      name,
      email,
      role,
      createdAt: Date.now()
    };

    await setDoc(
      doc(db, "users", cred.user.uid),
      userData
    );

    saveSession(userData);

    redirectByRole(role);

  });

  setLoading(btn, false);
}



// LOGOUT
export async function logoutUser() {

  await safeRun(async () => {

    await signOut(auth);

    clearSession();

    location.replace("index.html");

  });
}



// RESET PASSWORD
export async function resetPassword(email, btn = null) {

  setLoading(btn, true, "Sending...");

  await safeRun(async () => {

    if (!email) {
      alert("Enter email first 📩");
      return;
    }

    await sendPasswordResetEmail(auth, email);

    alert("Reset link sent ✅");

  });

  setLoading(btn, false);
}



// ===============================
// 🛡 PAGE SECURITY
// ===============================

// Protect Pages
export function protectPage(role = null) {

  const user = getSession();

  if (!user) {
    location.replace("index.html");
    return;
  }

  if (role && user.role !== role) {
    location.replace("index.html");
  }
}


// Login/Signup Redirect
export function checkSessionUI() {

  const user = getSession();

  if (!user) return;

  const path = location.pathname;

  if (
    path.includes("login") ||
    path.includes("signup")
  ) {
    redirectByRole(user.role);
  }
}



// Firebase Auto Session Sync
onAuthStateChanged(auth, async (firebaseUser) => {

  if (!firebaseUser) return;

  const snap =
    await getDoc(doc(db, "users", firebaseUser.uid));

  if (snap.exists()) {
    saveSession(snap.data());
  }

});


// ===============================
// 💼 JOB SYSTEM
// ===============================

// POST JOB
export async function postJob(btn = null) {

  setLoading(btn, true);

  await safeRun(async () => {

    const title =
      document.getElementById("title")?.value.trim();

    const skills =
      document.getElementById("skills")?.value.trim();

    const salary =
      document.getElementById("salary")?.value.trim();

    const location =
      document.getElementById("location")?.value.trim();

    const user = getSession();

    if (!title || !skills) {
      alert("Fill details ❌");
      return;
    }

    await addDoc(collection(db, "jobs"), {
      title,
      skills: skills.split(",").map(s => s.trim()),
      salary,
      location,
      recruiter: user.email,
      createdAt: Date.now()
    });

    alert("Job Posted 🚀");

    document.getElementById("jobForm")?.reset();

  });

  setLoading(btn, false);
}



// APPLY JOB
export async function applyJob(data) {

  await safeRun(async () => {

    await addDoc(collection(db, "applications"), {
      ...data,
      status: "Applied",
      createdAt: Date.now()
    });

  });
}



// UPDATE APPLICATION STATUS
export async function updateApplicationStatus(id, status) {

  await safeRun(async () => {

    await updateDoc(
      doc(db, "applications", id),
      { status }
    );

  });
}



// ===============================
// 👤 PROFILE SYSTEM
// ===============================

// Update User Profile
export async function updateUserProfile(data) {

  const user = getSession();

  if (!user) return;

  await safeRun(async () => {

    const q = query(
      collection(db, "users"),
      where("email", "==", user.email)
    );

    const snap = await getDocs(q);

    if (snap.empty) return;

    const id = snap.docs[0].id;

    await updateDoc(doc(db, "users", id), data);

    const updated = {
      ...user,
      ...data
    };

    saveSession(updated);

  });
}



// Save Resume
export async function saveResume(data) {

  const user = getSession();

  if (!user) return;

  await safeRun(async () => {

    await addDoc(collection(db, "resumes"), {
      user: user.email,
      ...data,
      createdAt: Date.now()
    });

  });
}



// ===============================
// 🌪 GLOBAL SILENT FIXES
// ===============================

// Abort errors ignore
window.addEventListener("unhandledrejection", e => {
  if (e.reason?.name === "AbortError") {
    e.preventDefault();
  }
});

window.addEventListener("error", e => {
  if (e.message?.includes("AbortError")) {
    e.preventDefault();
  }
});