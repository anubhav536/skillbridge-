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
const auth = getAuth(app);
const db = getFirestore(app);

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
    
    // OTP generate
    let otp = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem("otp", otp);
    
    showToast("OTP sent (demo) 🔐");
    window.location.href = "verify.html";
    
  } catch (err) {
    showToast(err.message);
  }
};

// ================= LOGIN =================
window.loginUser = async function(role) {
  
  let email = document.getElementById("email")?.value;
  let password = document.getElementById("password")?.value;
  
  try {
    let userCred = await signInWithEmailAndPassword(auth, email, password);
    let uid = userCred.user.uid;
    
    let snap = await getDoc(doc(db, "users", uid));
    let user = snap.data();
    
    if (!user) {
      showToast("User not found ❌");
      return;
    }
    
    if (user.role !== role) {
      showToast("Wrong role ❌");
      return;
    }
    
    localStorage.setItem("session", JSON.stringify(user));
    
    showToast("Login success 🚀");
    
    window.location.href = role === "seeker" ?
      "js-dashboard.html" :
      "rec-dashboard.html";
    
  } catch {
    showToast("Login failed ❌");
  }
};

// ================= LOGOUT =================
window.firebaseLogout = async function() {
  await signOut(auth);
  localStorage.removeItem("session");
  window.location.href = "index.html";
};

// ================= POST JOB =================
window.postJob = async function() {
  
  let user = JSON.parse(localStorage.getItem("session"));
  
  let title = document.getElementById("title")?.value;
  let skills = document.getElementById("skills")?.value
    .split(",")
    .map(s => s.trim());
  
  let salary = document.getElementById("salary")?.value || "";
  
  if (!title) {
    showToast("Enter job title ❌");
    return;
  }
  
  try {
    await addDoc(collection(db, "jobs"), {
      title,
      skills,
      salary,
      recruiter: user?.email,
      createdAt: new Date()
    });
    
    showToast("Job posted 🚀");
    
  } catch {
    showToast("Error posting job ❌");
  }
};

// ================= LOAD JOBS =================
window.loadJobs = async function() {
  
  let container = document.getElementById("jobList");
  if (!container) return;
  
  container.innerHTML = "Loading...";
  
  let snapshot = await getDocs(collection(db, "jobs"));
  
  let html = "";
  
  snapshot.forEach(docSnap => {
    let j = docSnap.data();
    
    html += `
      <div class="card">
        <b>${j.title}</b><br>
        ${j.skills?.join(", ") || ""}<br>
        ${j.salary ? "₹"+j.salary : ""}
        <br><br>
        <button onclick="applyJob('${docSnap.id}')">Apply 🚀</button>
      </div>
    `;
  });
  
  container.innerHTML = html || "No jobs";
};

// ================= APPLY JOB =================
window.applyJob = async function(jobId) {
  
  let user = JSON.parse(localStorage.getItem("session"));
  
  if (!user) {
    showToast("Login required ❌");
    return;
  }
  
  try {
    await addDoc(collection(db, "applications"), {
      user: user.email,
      jobId,
      status: "Applied",
      time: new Date()
    });
    
    showToast("Applied successfully ✅");
    
  } catch {
    showToast("Error applying ❌");
  }
};

// ================= LOAD APPLICATIONS =================
window.loadApplications = async function() {
  
  let user = JSON.parse(localStorage.getItem("session"));
  let container = document.getElementById("apps");
  
  if (!container) return;
  
  container.innerHTML = "Loading...";
  
  let snapshot = await getDocs(collection(db, "applications"));
  
  let html = "";
  
  snapshot.forEach(doc => {
    let a = doc.data();
    
    if (a.user === user?.email) {
      html += `
        <div class="card">
          Job ID: ${a.jobId}<br>
          Status: ${a.status}
        </div>
      `;
    }
  });
  
  container.innerHTML = html || "No applications";
};

// ================= DELETE JOB =================
window.deleteJob = async function(id) {
  
  await deleteDoc(doc(db, "jobs", id));
  showToast("Job deleted ❌");
  
  loadJobs();
};

// ================= CONTACT =================
window.sendMessage = async function(e) {
  e.preventDefault();
  
  let name = document.getElementById("cname")?.value;
  let email = document.getElementById("cemail")?.value;
  let msg = document.getElementById("cmsg")?.value;
  
  await addDoc(collection(db, "messages"), {
    name,
    email,
    message: msg,
    time: new Date()
  });
  
  showToast("Message sent 🚀");
  
  document.getElementById("cname").value = "";
  document.getElementById("cemail").value = "";
  document.getElementById("cmsg").value = "";
};

// ================= EXPORT =================
export { db };
