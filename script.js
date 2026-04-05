// ================= FIREBASE IMPORT =================
import { auth } from "./firebase.js";
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// ================= GLOBAL =================
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


// ================= LOGIN FUNCTION =================
window.loginUser = async function () {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  if (!email || !password) {
    showToast("⚠️ Fill all fields");
    return;
  }

  try {
    let userCred = await signInWithEmailAndPassword(auth, email, password);

    // ✅ session save
    localStorage.setItem("session", JSON.stringify({
      email: userCred.user.email
    }));

    showToast("Login Successful ✅");

    // 👉 redirect
    setTimeout(() => {
      window.location.href = "js-dashboard.html";
    }, 800);

  } catch (error) {

    console.log(error.code);

    if (error.code === "auth/wrong-password") {
      showToast("❌ Wrong password");
    }
    else if (error.code === "auth/user-not-found") {
      showToast("⚠️ Account nahi mila, signup karo");
    }
    else if (error.code === "auth/invalid-email") {
      showToast("❌ Invalid email");
    }
    else {
      showToast("Login failed ❌");
    }
  }
};


// ================= LOGOUT =================
window.logout = async function () {
  await signOut(auth);
  localStorage.removeItem("session");

  showToast("Logged out 👋");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
};


// ================= SESSION CHECK =================
function checkSessionUI() {
  let user = JSON.parse(localStorage.getItem("session"));

  if (user && window.location.pathname.includes("login")) {
    window.location.href = "js-dashboard.html";
  }
}


// ================= PROTECT PAGE =================
function protectPage() {
  let user = JSON.parse(localStorage.getItem("session"));

  if (!user) {
    window.location.href = "index.html";
  }
}


// ================= AUTO LOGIN CHECK =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem("session", JSON.stringify({
      email: user.email
    }));
  }
});


// ================= RUN =================
checkSessionUI();