// ================= GLOBAL =================

// Toast notification (UPGRADED fallback support)
function showToast(msg) {
  let t = document.getElementById("toast");
  
  // अगर toast element नहीं है → dynamic create
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

// ================= DARK MODE =================
function toggleTheme() {
  document.body.classList.toggle("dark");
  
  let mode = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", mode);
}

// Load saved theme
(function() {
  let saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
  }
})();

// ================= LOGOUT =================
// 🔥 upgraded (firebase sync friendly)
function logout() {
  localStorage.removeItem("session");
  showToast("Logged out 👋");
  
  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
}

// ================= PAGE FADE ANIMATION =================
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = 0;
  
  setTimeout(() => {
    document.body.style.transition = "0.4s";
    document.body.style.opacity = 1;
  }, 100);
});

// ================= TYPING EFFECT =================
(function() {
  let el = document.getElementById("typing");
  
  if (!el) return;
  
  let text = "Build Your Career with AI 🚀";
  let i = 0;
  
  function type() {
    if (i < text.length) {
      el.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, 40);
    }
  }
  
  type();
})();

// ================= LOADER =================
window.onload = () => {
  let loader = document.getElementById("loader");
  
  if (loader) {
    setTimeout(() => {
      loader.style.display = "none";
    }, 800);
  }
};

// ================= FORM VALIDATION =================
function validateEmail(email) {
  return email.includes("@") && email.includes(".");
}

// ================= INPUT ERROR UI =================
function showError(id, msg) {
  let el = document.getElementById(id);
  if (!el) return;
  
  el.innerText = msg;
  el.style.color = "#EF4444";
}

// ================= CLEAR ERROR =================
function clearError(id) {
  let el = document.getElementById(id);
  if (!el) return;
  
  el.innerText = "";
}

// ================= SIMPLE LOADING =================
function fakeLoader(btn) {
  if (!btn) return;
  
  let original = btn.innerText;
  btn.innerText = "Loading...";
  btn.disabled = true;
  
  setTimeout(() => {
    btn.innerText = original;
    btn.disabled = false;
  }, 1000);
}

// ================= 🔥 GLOBAL SEARCH FILTER =================
function searchFilter(inputId, listId) {
  let q = document.getElementById(inputId)?.value.toLowerCase();
  let items = document.querySelectorAll(`#${listId} div`);
  
  items.forEach((i) => {
    i.style.display = i.innerText.toLowerCase().includes(q) ?
      "block" :
      "none";
  });
}

// ================= 🔥 SESSION CHECK =================
function checkSessionUI() {
  let user = JSON.parse(localStorage.getItem("session"));
  
  // login page → redirect
  if (user && window.location.pathname.includes("login")) {
    if (user.role === "recruiter") {
      window.location.href = "rec-dashboard.html";
    } else {
      window.location.href = "js-dashboard.html";
    }
  }
}

// ================= 🔥 PROTECTED ROUTE =================
function protectPage(role) {
  let user = JSON.parse(localStorage.getItem("session"));
  
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  
  if (role && user.role !== role) {
    showToast("Unauthorized ❌");
    window.location.href = "index.html";
  }
}

// Run session UI check
checkSessionUI();
