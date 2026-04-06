// ================= IMPORT =================              
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


// ================= INIT =================              
const firebaseConfig = {
  apiKey: "AIzaSyAvT2lDQ8UFfe8iKdJ-SDnJi49H6OSUfxM",
  authDomain: "skill-bridge-f4316.firebaseapp.com",
  projectId: "skill-bridge-f4316"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


// ================= SESSION =================              
export function getSession() {
  try {
    const data = localStorage.getItem("session");
    return data ? JSON.parse(data) : null;
  } catch {
    localStorage.removeItem("session");
    return null;
  }
}


// ================= SAFE WRAPPER =================              
async function safeRun(fn) {
  try {
    return await fn();
  } catch (e) {

    if (e?.name === "AbortError") return;

    console.warn("Handled Error:", e);

    const map = {
      "auth/wrong-password": "Wrong password ❌",
      "auth/user-not-found": "User not found ❌",
      "auth/invalid-email": "Invalid email ❌",
      "auth/email-already-in-use": "Email already registered ❌",
      "auth/weak-password": "Weak password ❌"
    };

    alert(map[e.code] || "Something went wrong ❌");
  }
}


// ================= LOADING =================              
function setLoading(btn, state, text = "Please wait...") {
  if (!btn) return;

  if (state) {
    if (!btn.dataset.original) {
      btn.dataset.original = btn.innerText;
    }
    btn.innerText = text;
    btn.disabled = true;
  } else {
    btn.innerText = btn.dataset.original || "Submit";
    btn.disabled = false;
  }
}


// ================= LOGIN =================              
export async function loginUser(btn = null) {

  setLoading(btn, true);

  await safeRun(async () => {

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!email || !password) {
      alert("Fill all fields ❌");
      return;
    }

    const userCred = await signInWithEmailAndPassword(auth, email, password);

    const snap = await getDoc(doc(db, "users", userCred.user.uid));

    if (!snap.exists()) {
      alert("User not found ❌");
      return;
    }

    const user = snap.data();

    user.email = user.email || email;

    localStorage.setItem("session", JSON.stringify(user));

    setTimeout(() => {
      window.location.href =
        user.role === "seeker"
          ? "js-dashboard.html"
          : "rec-dashboard.html";
    }, 200);
  });

  setLoading(btn, false);
}


// ================= SIGNUP =================              
export async function signupUser(role, btn = null) {

  setLoading(btn, true);

  await safeRun(async () => {

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!name || !email || !password) {
      alert("Fill all fields ❌");
      return;
    }

    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCred.user.uid), {
      name,
      email,
      role,
      createdAt: Date.now()
    });

    setTimeout(() => {
      window.location.href =
        role === "seeker"
          ? "jobseeker-login.html"
          : "recruiter-login.html";
    }, 200);
  });

  setLoading(btn, false);
}


// ================= LOGOUT =================              
export async function logoutUser() {

  await safeRun(async () => {
    await signOut(auth);

    localStorage.removeItem("session");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 150);
  });
}


// ================= POST JOB =================              
export async function postJob(btn = null) {

  setLoading(btn, true);

  await safeRun(async () => {

    const title = document.getElementById("title")?.value.trim();
    const skills = document.getElementById("skills")?.value.trim();

    if (!title || !skills) {
      alert("Fill job details ❌");
      return;
    }

    const user = getSession();

    if (!user) {
      alert("Login required ❌");
      return;
    }

    await addDoc(collection(db, "jobs"), {
      title,
      skills: skills.split(",").map(s => s.trim()),
      salary: document.getElementById("salary")?.value || "",
      location: document.getElementById("location")?.value || "",
      recruiter: user.email,
      createdAt: Date.now()
    });

    alert("Job posted 🚀");

    document.getElementById("jobForm")?.reset();

  });

  setLoading(btn, false);
}


// ================= APPLY JOB =================                
export async function applyJob(data) {

  await addDoc(collection(db, "applications"), {
    ...data,
    status: "Applied",
    createdAt: Date.now(),
    time: new Date().toISOString()
  });

}


// ================= SAVE RESUME =================    
export async function saveResume(data) {

  const user = getSession();

  if (!user) return;

  await addDoc(collection(db, "resumes"), {
    user: user.email,
    ...data,
    createdAt: Date.now()
  });

}


// ================= UPDATE PROFILE =================    
export async function updateUserProfile(data) {

  const user = getSession();

  if (!user) return;

  const snap = await getDocs(collection(db, "users"));

  let userId = null;

  snap.forEach(docSnap => {
    const d = docSnap.data();
    if (d.email === user.email) {
      userId = docSnap.id;
    }
  });

  if (!userId) return;

  await updateDoc(doc(db, "users", userId), data);

  const updated = { ...user, ...data };
  localStorage.setItem("session", JSON.stringify(updated));
}


// ================= UPDATE APPLICATION STATUS =================    
export async function updateApplicationStatus(id, status) {
  await updateDoc(doc(db, "applications", id), {
    status
  });
}


// ================= SAFE GET DOCS =================              
export async function safeGetDocs(colRef) {
  try {
    return await getDocs(colRef);
  } catch (e) {
    if (e?.name === "AbortError") return null;
    console.warn("Fetch error:", e);
    return null;
  }
}


// ================= PROTECT =================              
export function protectPage(role = null) {

  const user = getSession();

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  if (role && user.role !== role) {
    window.location.href = "index.html";
  }
}


// ================= SESSION REDIRECT =================              
export function checkSessionUI() {

  const user = getSession();

  if (user && window.location.pathname.includes("login")) {
    window.location.href =
      user.role === "seeker"
        ? "js-dashboard.html"
        : "rec-dashboard.html";
  }
}


// ================= GLOBAL ABORT FIX =================              
window.addEventListener("unhandledrejection", (e) => {
  if (e.reason?.name === "AbortError") {
    e.preventDefault();
  }
});

