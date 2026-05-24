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
  setDoc,
  addDoc,
  updateDoc,
  collection
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
  if (user?.role) localStorage.setItem("role", user.role);
}

function clearSession() {
  localStorage.removeItem("session");
  localStorage.removeItem("role");
}

export function getSession() {
  const raw = localStorage.getItem("session");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Invalid session data in localStorage", e);
    clearSession();
    return null;
  }
}

// ---------- REDIRECT ----------
function redirectByRole(role) {
  if (role === "jobseeker") {
    window.location.href = "js-dashboard.html";
    return;
  }

  if (role === "recruiter") {
    window.location.href = "rec-dashboard.html";
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
export async function loginUser(btn = null, expectedRole = null) {
  setLoading(btn, true, "Logging in...");

  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Fill all fields ❌");
      return null;
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));

    if (!snap.exists()) {
      alert("User data not found ❌");
      return null;
    }

    const user = snap.data();

    if (expectedRole && user.role !== expectedRole) {
      await signOut(auth);
      clearSession();
      alert("Access denied for this portal ❌");
      return null;
    }

    saveSession(user);
    redirectByRole(user.role);
    return user;
  } catch (e) {
    console.error(e);

    const errors = {
      "auth/user-not-found": "User not found ❌",
      "auth/wrong-password": "Wrong password ❌",
      "auth/invalid-email": "Invalid email ❌",
      "auth/too-many-requests": "Too many attempts ❌"
    };

    alert(errors[e.code] || e.message);
    return null;
  } finally {
    setLoading(btn, false);
  }
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
      return null;
    }

    if (password.length < 6) {
      alert("Password must be 6+ characters ❌");
      return null;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const userData = {
      name,
      email,
      role,
      createdAt: Date.now()
    };

    await setDoc(doc(db, "users", cred.user.uid), userData);

    saveSession(userData);
    redirectByRole(role);
    return userData;
  } catch (e) {
    console.error(e);

    const errors = {
      "auth/email-already-in-use": "Email already exists ❌",
      "auth/invalid-email": "Invalid email ❌",
      "auth/weak-password": "Weak password ❌"
    };

    alert(errors[e.code] || e.message);
    return null;
  } finally {
    setLoading(btn, false);
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
// 💼 JOB & APPLICATION HELPERS
// =====================================
export async function postJob() {
  const user = getSession();

  if (!user?.email) {
    throw new Error("Recruiter session required");
  }

  const jobData = {
    title: document.getElementById("title")?.value?.trim() || "",
    skills: document.getElementById("skills")?.value?.split(",").map(s => s.trim()).filter(Boolean) || [],
    salary: document.getElementById("salary")?.value?.trim() || "",
    location: document.getElementById("location")?.value?.trim() || "",
    recruiter: user?.email || "",
    createdAt: Date.now()
  };

  return addDoc(collection(db, "jobs"), jobData);
}

export async function applyJob(applicationData) {
  if (!applicationData || !applicationData.jobId) {
    throw new Error("Valid application data is required");
  }

  return addDoc(collection(db, "applications"), {
    ...applicationData,
    createdAt: applicationData?.createdAt || Date.now()
  });
}

export async function updateApplicationStatus(applicationId, status) {
  return updateDoc(doc(db, "applications", applicationId), { status });
}

export async function updateUserProfile(profileData) {
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    throw new Error("User not logged in");
  }

  await updateDoc(doc(db, "users", firebaseUser.uid), profileData);

  const session = getSession() || {};
  saveSession({ ...session, ...profileData });
}
