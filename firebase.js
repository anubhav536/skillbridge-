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
  setDoc
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

const auth = getAuth(app);
const db = getFirestore(app);


// ================= TOAST =================
function showToast(msg) {
  let t = document.getElementById("toast");
  
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
    
    t.style.position = "fixed";
    t.style.bottom = "20px";
    t.style.right = "20px";
    t.style.background = "#2563EB";
    t.style.color = "#fff";
    t.style.padding = "10px 15px";
    t.style.borderRadius = "6px";
    t.style.zIndex = "9999";
  }
  
  t.innerText = msg;
  t.style.display = "block";
  
  setTimeout(() => {
    t.style.display = "none";
  }, 2000);
}


// ================= SIGNUP =================
window.signupUser = async function(role) {
  
  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  
  if (!name || !email || !password) {
    showToast("⚠️ Fill all fields");
    return;
  }
  
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    
    await setDoc(doc(db, "users", uid), {
      name,
      email,
      role,
      createdAt: new Date()
    });
    
    showToast("Signup successful 🚀");
    
    window.location.href = role === "seeker" ?
      "jobseeker-login.html" :
      "recruiter-login.html";
    
  } catch (err) {
    
    console.log("Signup Error:", err.code);
    
    if (err.code === "auth/email-already-in-use") {
      showToast("Email already registered ❌");
    } else if (err.code === "auth/invalid-email") {
      showToast("Invalid email ❌");
    } else if (err.code === "auth/weak-password") {
      showToast("Password should be 6+ characters ❌");
    } else {
      showToast("Signup failed ❌");
    }
  }
};


// ================= LOGIN =================
window.loginUser = async function() {
  
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  
  if (!email || !password) {
    showToast("⚠️ Fill all fields");
    return;
  }
  
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    
    const snap = await getDoc(doc(db, "users", uid));
    
    if (!snap.exists()) {
      showToast("User data not found ❌");
      return;
    }
    
    const user = snap.data();
    
    localStorage.setItem("session", JSON.stringify(user));
    
    showToast("Login successful ✅");
    
    window.location.href = user.role === "seeker" ?
      "js-dashboard.html" :
      "rec-dashboard.html";
    
  } catch (err) {
    
    console.log("Login Error:", err.code);
    
    if (err.code === "auth/wrong-password") {
      showToast("Wrong password ❌");
    }
    else if (err.code === "auth/user-not-found") {
      showToast("User not found ❌");
    }
    else if (err.code === "auth/invalid-email") {
      showToast("Invalid email ❌");
    }
    else {
      showToast("Login failed ❌");
    }
  }
};


// ================= LOGOUT =================
window.logoutUser = async function() {
  await signOut(auth);
  localStorage.removeItem("session");
  
  showToast("Logged out 👋");
  
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
};


// ================= SESSION CHECK =================
function checkSessionUI() {
  const user = JSON.parse(localStorage.getItem("session"));
  
  if (user && window.location.pathname.includes("login")) {
    window.location.href = user.role === "seeker" ?
      "js-dashboard.html" :
      "rec-dashboard.html";
  }
}


// ================= PROTECT PAGE =================
window.protectPage = function() {
  const user = JSON.parse(localStorage.getItem("session"));
  
  if (!user) {
    window.location.href = "index.html";
  }
};


// ================= RUN =================
checkSessionUI();