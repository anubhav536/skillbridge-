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
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  orderBy,
  limit
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
function redirectByRole(role, user = {}) {
  if (role === "jobseeker") {
    const profileReady = Boolean((user.skills || "").trim()) && user.exp !== undefined && user.exp !== null && `${user.exp}` !== "";
    window.location.href = profileReady ? "js-dashboard.html" : "js-profile.html";
    return;
  }

  if (role === "recruiter") {
    const profileReady = Boolean((user.company || "").trim());
    window.location.href = profileReady ? "rec-dashboard.html" : "rec-profile.html";
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
      await signOut(auth);
      clearSession();
      alert("User data not found ❌");
      return null;
    }

    const user = snap.data();

    // Check if account is suspended
    if (user.suspended) {
      await signOut(auth);
      clearSession();
      alert("Your account has been suspended. Please contact support.");
      return null;
    }

    // Check maintenance mode (non-admins blocked during maintenance)
    if (user.role !== "admin") {
      try {
        const settingsSnap = await getDoc(doc(db, "settings", "main"));
        if (settingsSnap.exists() && settingsSnap.data().maintenanceMode) {
          await signOut(auth);
          clearSession();
          alert("Platform is under maintenance. Please try again later. 🔧");
          return null;
        }
      } catch (_) {}
    }

    if (expectedRole === "admin" && user.role === "admin_pending") {
      await signOut(auth);
      clearSession();
      alert("Admin account is pending approval by existing admin ⏳");
      return null;
    }

    if (expectedRole && user.role !== expectedRole) {
      await signOut(auth);
      clearSession();
      alert("Access denied for this portal ❌");
      return null;
    }

    saveSession(user);
    redirectByRole(user.role, user);
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

    // Check platform settings before creating account
    if (role !== "admin") {
      try {
        const settingsSnap = await getDoc(doc(db, "settings", "main"));
        if (settingsSnap.exists()) {
          const s = settingsSnap.data();
          if (s.maintenanceMode) {
            alert("Platform is under maintenance. Please try again later. 🔧");
            return null;
          }
          if (s.allowSignup === false) {
            alert("New signups are currently disabled by the administrator. ❌");
            return null;
          }
        }
      } catch (_) {}
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    let userData = {
      name,
      email,
      role,
      createdAt: Date.now(),
      profileCompleted: false
    };

    if (role === "admin") {
      const approvedAdmins = await getDocs(query(collection(db, "users"), where("role", "==", "admin")));
      const requiresApproval = !approvedAdmins.empty;
      userData = {
        ...userData,
        role: requiresApproval ? "admin_pending" : "admin",
        requestedRole: "admin",
        approved: !requiresApproval,
        approvedBy: requiresApproval ? null : "bootstrap"
      };
    }

    await setDoc(doc(db, "users", cred.user.uid), userData);

    saveSession(userData);
    if (role === "admin" && userData.role === "admin_pending") {
      alert("Admin signup request submitted. Wait for approval from an existing admin.");
      await signOut(auth);
      clearSession();
      window.location.href = "admin-login.html";
      return userData;
    }

    redirectByRole(userData.role, userData);
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


// =====================================
// 📊 REALTIME ANALYTICS + ADMIN UTILITIES
// =====================================
export async function updatePresence(role = null) {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return;

  const session = getSession() || {};
  const effectiveRole = role || session.role || localStorage.getItem("role") || "unknown";

  await setDoc(doc(db, "presence", firebaseUser.uid), {
    uid: firebaseUser.uid,
    role: effectiveRole,
    email: session.email || firebaseUser.email || "",
    isOnline: true,
    lastSeen: Date.now()
  }, { merge: true });
}

export async function markOffline() {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return;
  await setDoc(doc(db, "presence", firebaseUser.uid), {
    isOnline: false,
    lastSeen: Date.now()
  }, { merge: true });
}

export function startPresenceHeartbeat(role = null) {
  updatePresence(role).catch(console.error);
  const id = setInterval(() => updatePresence(role).catch(console.error), 30000);

  window.addEventListener("beforeunload", () => {
    clearInterval(id);
    markOffline().catch(console.error);
  });

  return () => clearInterval(id);
}

export function enforceSecretAdminSignup() {
  const unlocked = sessionStorage.getItem("admin_signup_unlocked") === "1";
  if (!unlocked) {
    alert("Admin signup is restricted. Use secret access from Admin Login.");
    window.location.href = "admin-login.html";
    return false;
  }
  return true;
}

export function observePlatformAnalytics(handlers = {}) {
  const unsubs = [];
  const bind = (key, value) => {
    if (typeof handlers[key] === "function") handlers[key](value);
  };

  unsubs.push(onSnapshot(collection(db, "users"), (snap) => bind("totalUsers", snap.size)));
  unsubs.push(onSnapshot(collection(db, "jobs"), (snap) => bind("totalJobs", snap.size)));
  unsubs.push(onSnapshot(collection(db, "applications"), (snap) => bind("totalApplications", snap.size)));

  unsubs.push(onSnapshot(query(collection(db, "presence"), where("isOnline", "==", true)), (snap) => {
    bind("activeUsers", snap.size);
  }));

  return () => unsubs.forEach((u) => u && u());
}


export function observeUsersRealtime(onChange) {
  return onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(500)), (snap) => {
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (typeof onChange === "function") onChange(users);
  });
}

export async function approveAdminUser(userId, approver = "") {
  if (!userId) throw new Error("userId required");
  await updateDoc(doc(db, "users", userId), {
    role: "admin",
    approved: true,
    approvedBy: approver || "existing-admin",
    approvedAt: Date.now()
  });
}
