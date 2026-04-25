// =====================================
// 🔥 SkillBridge AI FINAL firebase.js
// Production Ready • GitHub Ready
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



// ---------- FIREBASE CONFIG ----------
const firebaseConfig = {
  apiKey: "AIzaSyAvT2lDQ8UFfe8iKdJ-SDnJi49H6OSUfxM",
  authDomain: "skill-bridge-f4316.firebaseapp.com",
  databaseURL: "https://skill-bridge-f4316-default-rtdb.firebaseio.com",
  projectId: "skill-bridge-f4316",
  storageBucket: "skill-bridge-f4316.firebasestorage.app",
  messagingSenderId: "215570592226",
  appId: "1:215570592226:web:70812f81c5d3afc2a109bb",
  measurementId: "G-Y46GR7769S"
};



// ---------- INIT ----------
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

    if (e?.name === "AbortError") return;

    console.error("Firebase Error:", e);

    const errors = {
      "auth/wrong-password": "Wrong password ❌",
      "auth/user-not-found": "User not found ❌",
      "auth/invalid-email": "Invalid email ❌",
      "auth/email-already-in-use": "Email already exists ❌",
      "auth/weak-password": "Password must be 6+ chars ❌",
      "auth/network-request-failed": "Network issue 🌐",
      "auth/too-many-requests": "Too many attempts ⏳",
      "auth/operation-not-allowed": "Email signup disabled ❌",
      "auth/unauthorized-domain": "Domain not authorized ❌"
    };

    alert(errors[e.code] || e.message || "Something went wrong ❌");
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



function saveSession(user) {
  localStorage.setItem("session", JSON.stringify(user));
}



function clearSession() {
  localStorage.removeItem("session");
}



export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("session"));
  } catch {
    localStorage.removeItem("session");
    return null;
  }
}



function redirectByRole(role) {

  if (role === "seeker") {
    location.href = "js-dashboard.html";
  } else {
    location.href = "rec-dashboard.html";
  }

}



// =====================================
// 🔐 AUTH SYSTEM
// =====================================

// LOGIN
export async function loginUser(btn = null) {

  setLoading(btn, true, "Logging in...");

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
      await getDoc(
        doc(db, "users", cred.user.uid)
      );

    if (!snap.exists()) {
      alert("User data not found ❌");
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
      company: "",
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



// =====================================
// 🛡 PAGE SECURITY
// =====================================

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



// =====================================
// 💼 JOB SYSTEM
// =====================================

// POST JOB
export async function postJob(btn = null) {

  setLoading(btn, true, "Posting...");

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
      alert("Fill required fields ❌");
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

    alert("Job posted 🚀");

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



// DELETE JOB
export async function deleteJobById(id) {

  await safeRun(async () => {

    await deleteDoc(doc(db, "jobs", id));

  });

}



// =====================================
// 👤 PROFILE SYSTEM
// =====================================

// UPDATE PROFILE
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

    await updateDoc(
      doc(db, "users", id),
      data
    );

    const updated = {
      ...user,
      ...data
    };

    saveSession(updated);

  });

}



// SAVE RESUME
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



// =====================================
// 🔄 AUTO SESSION SYNC
// =====================================

onAuthStateChanged(auth, async (firebaseUser) => {

  if (!firebaseUser) return;

  try {

    const snap = await getDoc(
      doc(db, "users", firebaseUser.uid)
    );

    if (snap.exists()) {
      saveSession(snap.data());
    }

  } catch (e) {
    console.log(e);
  }

});



// =====================================
// 🌪 GLOBAL ERROR SILENCER
// =====================================

window.addEventListener(
  "unhandledrejection",
  (e) => {
    if (e.reason?.name === "AbortError") {
      e.preventDefault();
    }
  }
);

window.addEventListener(
  "error",
  (e) => {
    if (
      e.message &&
      e.message.includes("AbortError")
    ) {
      e.preventDefault();
    }
  }
);