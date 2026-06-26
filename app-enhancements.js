// =============================================
// ✨ SkillBridge AI — App Enhancements v2
// Toast system + Form improvements + UX polish
// =============================================

const page = window.location.pathname.split('/').pop();
function qs(id) { return document.getElementById(id); }

// =============================================
// 🍞 TOAST NOTIFICATION SYSTEM
// =============================================
(function injectToastSystem() {
  if (document.getElementById('sb-toast-container')) return;

  const style = document.createElement('style');
  style.textContent = `
    #sb-toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column-reverse;
      gap: .55rem;
      pointer-events: none;
      max-width: 340px;
    }
    .sb-toast {
      display: flex;
      align-items: center;
      gap: .65rem;
      padding: .9rem 1.15rem;
      border-radius: 14px;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 12px 36px rgba(2,0,20,.55), 0 0 0 1px rgba(139,92,246,.2);
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #ede9fe;
      pointer-events: all;
      animation: toastSlideIn .3s cubic-bezier(.22,.68,0,1.2) forwards;
      max-width: 340px;
      line-height: 1.45;
    }
    .sb-toast.toast-success {
      background: rgba(22,163,74,.22);
      border: 1px solid rgba(74,222,128,.35);
    }
    .sb-toast.toast-error {
      background: rgba(220,38,38,.2);
      border: 1px solid rgba(248,113,113,.35);
    }
    .sb-toast.toast-info {
      background: rgba(18,12,48,.85);
      border: 1px solid rgba(124,58,237,.35);
    }
    .sb-toast.toast-warning {
      background: rgba(217,119,6,.18);
      border: 1px solid rgba(245,158,11,.35);
    }
    .sb-toast.toast-hide {
      animation: toastSlideOut .3s ease forwards;
    }
    .sb-toast-icon { font-size: 18px; flex-shrink: 0; }
    .sb-toast-msg  { flex: 1; }
    .sb-toast-close {
      background: none; border: none; color: rgba(167,139,250,.6);
      cursor: pointer; font-size: 16px; padding: 0 .2rem; line-height: 1;
      transition: color .18s; flex-shrink: 0; min-height: auto;
      box-shadow: none !important; transform: none !important;
    }
    .sb-toast-close:hover { color: #c4b5fd; }
    @keyframes toastSlideIn {
      from { opacity:0; transform:translateX(28px) scale(.95); }
      to   { opacity:1; transform:translateX(0) scale(1); }
    }
    @keyframes toastSlideOut {
      from { opacity:1; transform:translateX(0); max-height:80px; margin-bottom:0; }
      to   { opacity:0; transform:translateX(28px); max-height:0;  margin-bottom:-8px; }
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'sb-toast-container';
  document.body.appendChild(container);
})();

window.showToast = function(message, type = 'info', duration = 3500) {
  const container = document.getElementById('sb-toast-container');
  if (!container) return;

  const iconMap = { success: '✅', error: '❌', info: '💡', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `sb-toast toast-${type}`;
  toast.innerHTML = `
    <span class="sb-toast-icon">${iconMap[type] || '💡'}</span>
    <span class="sb-toast-msg">${message}</span>
    <button class="sb-toast-close" aria-label="Close">✕</button>
  `;

  const close = () => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 320);
  };
  toast.querySelector('.sb-toast-close').addEventListener('click', close);
  container.appendChild(toast);
  if (duration > 0) setTimeout(close, duration);
  return toast;
};

// =============================================
// 📋 FORM ENHANCEMENTS
// =============================================
function enhanceForms() {
  const commonRequired = ['name', 'email', 'password', 'title', 'skills', 'location'];
  commonRequired.forEach(id => {
    const el = qs(id);
    if (el) el.setAttribute('required', 'required');
  });

  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', () => {
      const btn = form.querySelector('button[type="submit"],button');
      if (!btn || btn.dataset.enhancing) return;
      btn.dataset.enhancing = '1';
      btn.dataset.oldText = btn.textContent;
      btn.textContent = 'Processing...';
      btn.disabled = true;
      setTimeout(() => {
        if (btn.dataset.enhancing) {
          btn.textContent = btn.dataset.oldText || btn.textContent;
          btn.disabled = false;
          delete btn.dataset.enhancing;
        }
      }, 5000);
    });
  });

  const password = qs('password');
  if (password && !qs('passwordStrength')) {
    const meter = document.createElement('small');
    meter.id = 'passwordStrength';
    meter.style.cssText = 'display:block;margin-top:5px;font-size:12px;transition:color .2s;';
    meter.textContent = 'Use 8+ chars, mix letters, numbers, symbols.';
    meter.style.color = '#6b7280';
    password.insertAdjacentElement('afterend', meter);
    password.addEventListener('input', () => {
      const v = password.value || '';
      let label = 'Weak', color = '#ef4444';
      if (v.length >= 10 && /\d/.test(v) && /[^\w\s]/.test(v)) { label = 'Strong 💪'; color = '#22c55e'; }
      else if (v.length >= 8 && /\d/.test(v)) { label = 'Medium'; color = '#f59e0b'; }
      meter.textContent = `Password strength: ${label}`;
      meter.style.color = color;
    });
  }
}

// =============================================
// 💾 DRAFT AUTOSAVE
// =============================================
function enableDraftAutosave() {
  const trackedIds = ['name','email','title','skills','salary','location','phone','bio','company','experience','education'];
  const key = `draft:${page}`;
  let draft = {};
  try { draft = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) {}

  trackedIds.forEach(id => {
    const el = qs(id);
    if (!el) return;
    if (draft[id] && !el.value) el.value = draft[id];
    el.addEventListener('input', () => {
      draft[id] = el.value;
      try { localStorage.setItem(key, JSON.stringify(draft)); } catch(e) {}
    });
  });
}

// =============================================
// 📊 ANALYTICS PAGES — live clock
// =============================================
function enrichAnalyticsPages() {
  if (!['js-analytics.html','rec-analytics.html','admin-analytics.html'].includes(page)) return;
  const header = document.querySelector('h1,h2');
  if (!header) return;
  const time = document.createElement('small');
  time.style.cssText = 'display:block;color:#6b7280;margin-top:4px;font-size:12px;';
  time.textContent = 'Realtime panel active';
  header.insertAdjacentElement('afterend', time);
  setInterval(() => { time.textContent = `Realtime panel active · ${new Date().toLocaleTimeString()}`; }, 1000);
}

// =============================================
// 🔘 BUTTON LAYOUT STABILIZER
// =============================================
function stabilizeButtonLayout() {
  document.querySelectorAll(".page-top, .profile-top, .profile-head").forEach(top => {
    top.style.display = 'flex';
    top.style.alignItems = 'center';
    top.style.justifyContent = 'space-between';
    top.style.gap = '12px';
    top.style.flexWrap = 'wrap';
  });

  document.querySelectorAll("button, .btn").forEach(btn => {
    if (!btn.closest(".sidebar nav") && !btn.classList.contains('sb-toast-close')) {
      btn.style.minHeight = '40px';
      btn.style.display   = 'inline-flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.gap = '6px';
    }
  });
}

// =============================================
// 🌟 ACTIVE NAV LINK HIGHLIGHTER
// =============================================
function highlightActiveNav() {
  const currentPage = page || 'index.html';
  document.querySelectorAll('.sidebar nav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

// =============================================
// 📱 MOBILE SIDEBAR TOGGLE (if not present)
// =============================================
function setupMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Add mobile class handling on resize
  const handleResize = () => {
    if (window.innerWidth >= 980) {
      sidebar.classList.remove('mobile-hidden');
    }
  };
  window.addEventListener('resize', handleResize);
}

// =============================================
// 🔔 INTERCEPT ALERT → TOAST (non-breaking)
// =============================================
(function interceptAlerts() {
  const origAlert = window.alert;
  window.alert = function(msg) {
    if (typeof msg === 'string' && window.showToast) {
      const isError   = msg.toLowerCase().includes('❌') || msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed');
      const isSuccess = msg.toLowerCase().includes('✅') || msg.toLowerCase().includes('success') || msg.toLowerCase().includes('sent');
      const isWarn    = msg.toLowerCase().includes('⚠️') || msg.toLowerCase().includes('pending') || msg.toLowerCase().includes('restricted');
      const type = isError ? 'error' : isSuccess ? 'success' : isWarn ? 'warning' : 'info';
      window.showToast(msg, type, 4000);
    } else {
      origAlert.call(window, msg);
    }
  };
})();

// =============================================
// 🚀 INIT
// =============================================
enhanceForms();
enableDraftAutosave();
enrichAnalyticsPages();
stabilizeButtonLayout();
highlightActiveNav();
setupMobileSidebar();
