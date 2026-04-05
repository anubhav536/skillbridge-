// ================= FIREBASE IMPORT =================
import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js"; 
// 🔥 IMPORTANT: version SAME rakha (12.11.0)


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


// ================= LOGIN =================
window.loginUser = async function () {

  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) {
    showToast("⚠️ Fill all fields");
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    const userData = {
      email: userCred.user.email
    };

    localStorage.setItem("session", JSON.stringify(userData));

    showToast("Login Successful ✅");

    window.location.href = "js-dashboard.html";

  } catch (error) {

    console.log("LOGIN ERROR:", error);

    if (error.code === "auth/wrong-password") {
      showToast("❌ Wrong password");
    } else if (error.code === "auth/user-not-found") {
      showToast("⚠️ User not found");
    } else if (error.code === "auth/invalid-email") {
      showToast("❌ Invalid email");
    } else {
      showToast("Login failed ❌");
    }
  }
};


// ================= LOGOUT =================
window.logout = async function () {
  try {
    await signOut(auth);
  } catch (e) {
    console.log("Logout error:", e);
  }

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
    window.location.href = "js-dashboard.html";
  }
}


// ================= PROTECT PAGE =================
window.protectPage = function () {
  const user = JSON.parse(localStorage.getItem("session"));

  if (!user) {
    window.location.href = "index.html";
  }
};


// ================= RUN =================
checkSessionUI();