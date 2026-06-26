// =============================================
// ⚡ SkillBridge AI — Premium Interactions v3
// World-class: Cursor · Ripple · Tilt · Magnetic
// Stagger · Counter · Glow · Page Loader
// =============================================

const page = window.location.pathname.split('/').pop() || 'index.html';
const SKIP_CLOSE_BTN = '.sb-toast-close, .sidebar button, [data-no-ripple]';

// ── 1. PAGE LOADER ────────────────────────────────────────────
function injectPageLoader() {
  const loader = document.createElement('div');
  loader.id = 'sb-page-loader';
  loader.innerHTML = '<div class="sb-loader-ring"></div>';
  document.body.insertBefore(loader, document.body.firstChild);
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('loaded');
      setTimeout(() => loader.remove(), 450);
    }, 200);
  });
  // Safety remove after 1.5s
  setTimeout(() => { if (loader.parentNode) loader.remove(); }, 1500);
}
injectPageLoader();

// ── 2. CUSTOM CURSOR ─────────────────────────────────────────
function initCursor() {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.id = 'sb-cursor';
  ring.id = 'sb-cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = -100, my = -100, rx = -100, ry = -100;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf = requestAnimationFrame(animRing);
  }
  animRing();

  const hoverTargets = 'button, a, input, select, textarea, .pick-card, .applicant-card, .cg-job-card, .quick-btn, .q-btn, label';
  document.addEventListener('mouseover', e => {
    if (e.target.matches(hoverTargets) || e.target.closest(hoverTargets)) {
      dot.classList.add('cursor-hover');
      ring.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.matches(hoverTargets) || e.target.closest(hoverTargets)) {
      dot.classList.remove('cursor-hover');
      ring.classList.remove('cursor-hover');
    }
  });
  document.addEventListener('mousedown', () => {
    dot.classList.add('cursor-click');
    ring.classList.add('cursor-click');
  });
  document.addEventListener('mouseup', () => {
    dot.classList.remove('cursor-click');
    ring.classList.remove('cursor-click');
  });
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}
initCursor();

// ── 3. RIPPLE EFFECT ─────────────────────────────────────────
function initRipple() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('button, .btn, .primary-btn, .quick-btn, .q-btn, .analyze-btn, .ci-btn, .pick-apply, .cg-apply-btn, .actionBtn');
    if (!btn || btn.disabled || btn.matches(SKIP_CLOSE_BTN)) return;

    btn.classList.add('sb-ripple-wrap');
    const r    = document.createElement('span');
    r.className = 'sb-ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x    = e.clientX - rect.left - size / 2;
    const y    = e.clientY - rect.top  - size / 2;
    Object.assign(r.style, { width: size + 'px', height: size + 'px', left: x + 'px', top: y + 'px' });
    btn.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
}
initRipple();

// ── 4. 3D CARD TILT ─────────────────────────────────────────
function init3DTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const TILT_SELECTORS = [
    '.stat-card', '.dash-card', '.score-card', '.applicant-card',
    '.pick-card', '.cg-job-card', '.section-card', '.cg-section',
    '.file-card', '.mini-card', '.career-intel-card', '.cg-hero'
  ].join(',');

  function applyTilt(el) {
    if (el._tiltBound) return;
    el._tiltBound = true;

    const MAX = 8;
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      el.style.transform       = `perspective(900px) rotateY(${x * MAX}deg) rotateX(${-y * MAX}deg) translateY(-4px)`;
      el.style.boxShadow       = `${-x * 16}px ${-y * 16 + 16}px 50px rgba(2,0,20,.6), 0 0 40px rgba(124,58,237,.${Math.round(10 + Math.abs(x + y) * 15)})`;
      el.style.transition      = 'none';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .5s cubic-bezier(.22,.68,0,1.2), box-shadow .5s ease';
      el.style.transform  = '';
      el.style.boxShadow  = '';
    });
  }

  function attachTiltToAll() {
    document.querySelectorAll(TILT_SELECTORS).forEach(applyTilt);
  }
  attachTiltToAll();
  // Re-run after async content loads
  setTimeout(attachTiltToAll, 1200);
  setTimeout(attachTiltToAll, 2800);
}
init3DTilt();

// ── 5. MAGNETIC HOVER (CTA buttons) ─────────────────────────
function initMagnetic() {
  if (window.matchMedia('(hover: none)').matches) return;

  const MAG_SELECTORS = '.analyze-btn, .ci-btn, .btn-primary, .pro-btn, .cg-apply-btn';
  const STRENGTH = 0.35;

  function attachMag(btn) {
    if (btn._magBound) return;
    btn._magBound = true;
    btn.classList.add('magnetic');

    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * STRENGTH;
      const dy   = (e.clientY - cy) * STRENGTH;
      btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  }

  function attachAllMagnetic() {
    document.querySelectorAll(MAG_SELECTORS).forEach(attachMag);
  }
  attachAllMagnetic();
  setTimeout(attachAllMagnetic, 1200);
  setTimeout(attachAllMagnetic, 2800);
}
initMagnetic();

// ── 6. STAGGER MOUNT (IntersectionObserver) ───────────────────
function initStagger() {
  const GRID_SELECTORS = [
    '.stats-grid', '.stat-grid', '.mini-grid', '.picks-grid',
    '.app-grid', '.apps-grid', '.cg-jobs-grid', '.files-grid',
    '.feat-list', '.tech-grid', '.quick-grid', '.scores-grid',
    '.lower-two', '.skills-two-col', '.feature-grid'
  ].join(',');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const children = [...entry.target.children];
      children.forEach((child, i) => {
        child.classList.add('sb-stagger');
        setTimeout(() => child.classList.add('sb-visible'), i * 65);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  function observeGrids() {
    document.querySelectorAll(GRID_SELECTORS).forEach(el => {
      if (!el._staggerObserved) {
        el._staggerObserved = true;
        observer.observe(el);
      }
    });
  }
  observeGrids();
  setTimeout(observeGrids, 800);
  setTimeout(observeGrids, 2000);
}
initStagger();

// ── 7. ANIMATED COUNTERS ─────────────────────────────────────
function initCounters() {
  const COUNTER_SELECTORS = [
    '.stat-card p', '.dash-card p', '.mini-card p', '.stat-card .big',
    '#totalApps', '#selectedApps', '#score', '#matchedCount',
    '#dashUsers', '#dashJobs', '#dashApps', '#dashActive',
    '#totalCount', '#shortCount', '#hiredCount', '#rejectCount',
    '#readinessNum', '#skillMatchNum', '#interviewNum'
  ].join(',');

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const raw = el.textContent.trim();
      const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0 && !el._counted) {
        el._counted = true;
        animateCounter(el, num, raw);
      }
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });

  function animateCounter(el, target, original) {
    const suffix  = original.replace(/[0-9.]/g, '').trim();
    const dur     = Math.min(1200, Math.max(400, target * 8));
    const start   = performance.now();
    el.classList.add('num-pop');
    function update(now) {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * ease) + suffix;
      if (t < 1) requestAnimationFrame(update);
      else el.textContent = original;
    }
    requestAnimationFrame(update);
  }

  function observeCounters() {
    document.querySelectorAll(COUNTER_SELECTORS).forEach(el => {
      if (!el._counterObs) {
        el._counterObs = true;
        counterObs.observe(el);
      }
    });
  }
  observeCounters();
  setTimeout(observeCounters, 1500);
  setTimeout(observeCounters, 3000);
}
initCounters();

// ── 8. TOAST NOTIFICATION SYSTEM ─────────────────────────────
(function injectToastSystem() {
  if (document.getElementById('sb-toast-container')) return;

  const style = document.createElement('style');
  style.textContent = `
    #sb-toast-container {
      position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999;
      display: flex; flex-direction: column-reverse; gap: .55rem;
      pointer-events: none; max-width: 340px;
    }
    .sb-toast {
      display: flex; align-items: center; gap: .65rem;
      padding: .9rem 1.15rem; border-radius: 14px;
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 16px 48px rgba(2,0,20,.6), 0 0 0 1px rgba(139,92,246,.25);
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
      color: #ede9fe; pointer-events: all; max-width: 340px; line-height: 1.45;
      animation: toastIn .35s cubic-bezier(.22,.68,0,1.25) forwards;
      position: relative; overflow: hidden;
    }
    .sb-toast.toast-success { background: rgba(22,163,74,.22); border: 1px solid rgba(74,222,128,.35); }
    .sb-toast.toast-error   { background: rgba(220,38,38,.2);  border: 1px solid rgba(248,113,113,.35); }
    .sb-toast.toast-info    { background: rgba(18,12,48,.9);   border: 1px solid rgba(124,58,237,.4); }
    .sb-toast.toast-warning { background: rgba(217,119,6,.18); border: 1px solid rgba(245,158,11,.4); }
    .sb-toast.toast-hide    { animation: toastOut .3s ease forwards; }
    .sb-toast-icon { font-size: 18px; flex-shrink: 0; }
    .sb-toast-msg  { flex: 1; }
    .sb-toast-close {
      background: none !important; border: none !important; color: rgba(167,139,250,.6) !important;
      cursor: none !important; font-size: 16px; padding: 0 .2rem; line-height: 1;
      transition: color .18s; flex-shrink: 0; min-height: auto !important;
      box-shadow: none !important; transform: none !important;
      width: auto !important; border-radius: 4px !important;
      animation: none !important; display: inline-flex !important;
    }
    .sb-toast-close:hover { color: #c4b5fd !important; }
    .sb-toast-progress {
      position: absolute; bottom: 0; left: 0; height: 3px;
      border-radius: 0 0 14px 14px; opacity: .7;
      animation: toastProg linear forwards;
    }
    .toast-success .sb-toast-progress { background: #4ade80; }
    .toast-error   .sb-toast-progress { background: #f87171; }
    .toast-info    .sb-toast-progress { background: #a78bfa; }
    .toast-warning .sb-toast-progress { background: #fcd34d; }
    @keyframes toastIn {
      from { opacity:0; transform:translateX(28px) scale(.94); }
      to   { opacity:1; transform:translateX(0) scale(1); }
    }
    @keyframes toastOut {
      from { opacity:1; transform:translateX(0); max-height:80px; }
      to   { opacity:0; transform:translateX(28px); max-height:0; padding:0; margin:0; }
    }
    @keyframes toastProg {
      from { width:100%; } to { width:0%; }
    }
  `;
  document.head.appendChild(style);
  const container = document.createElement('div');
  container.id = 'sb-toast-container';
  document.body.appendChild(container);
})();

window.showToast = function(message, type = 'info', duration = 3800) {
  const container = document.getElementById('sb-toast-container');
  if (!container) return;
  const icons = { success:'✅', error:'❌', info:'💡', warning:'⚠️' };
  const toast  = document.createElement('div');
  toast.className = `sb-toast toast-${type}`;
  toast.innerHTML = `
    <span class="sb-toast-icon">${icons[type] || '💡'}</span>
    <span class="sb-toast-msg">${message}</span>
    <button class="sb-toast-close" aria-label="Close">✕</button>
    ${duration > 0 ? `<div class="sb-toast-progress" style="animation-duration:${duration}ms"></div>` : ''}
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

// ── 9. ALERT INTERCEPTOR → TOAST ────────────────────────────
(function() {
  const orig = window.alert;
  window.alert = function(msg) {
    if (typeof msg === 'string' && window.showToast) {
      const isErr  = /❌|error|failed|fail/i.test(msg);
      const isOk   = /✅|success|sent|applied|saved/i.test(msg);
      const isWarn = /⚠️|pending|restrict|warn/i.test(msg);
      window.showToast(msg, isErr ? 'error' : isOk ? 'success' : isWarn ? 'warning' : 'info');
    } else { orig.call(window, msg); }
  };
})();

// ── 10. FORM ENHANCEMENTS ────────────────────────────────────
function enhanceForms() {
  // Password strength
  const pwd = document.getElementById('password');
  if (pwd && !document.getElementById('pwdStrength')) {
    const m = document.createElement('small');
    m.id = 'pwdStrength';
    m.style.cssText = 'display:block;margin-top:4px;font-size:12px;color:#6b7280;transition:color .2s';
    m.textContent = 'Use 8+ chars, mix letters & numbers';
    pwd.after(m);
    pwd.addEventListener('input', () => {
      const v = pwd.value;
      let label = 'Weak 😬', col = '#f87171';
      if (v.length >= 10 && /\d/.test(v) && /[^\w]/.test(v)) { label = 'Strong 💪'; col = '#4ade80'; }
      else if (v.length >= 8 && /\d/.test(v)) { label = 'Medium 🙂'; col = '#fcd34d'; }
      m.textContent = 'Password: ' + label;
      m.style.color = col;
    });
  }

  // Draft autosave
  const draftKey = `draft:${page}`;
  const fields   = ['name','email','title','skills','salary','location','phone','bio','company','experience','education','message'];
  let draft = {};
  try { draft = JSON.parse(localStorage.getItem(draftKey) || '{}'); } catch(_) {}
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (draft[id] && !el.value) el.value = draft[id];
    el.addEventListener('input', () => {
      draft[id] = el.value;
      try { localStorage.setItem(draftKey, JSON.stringify(draft)); } catch(_) {}
    });
  });
}
enhanceForms();

// ── 11. ACTIVE NAV HIGHLIGHTER ──────────────────────────────
function highlightActiveNav() {
  document.querySelectorAll('.sidebar nav a').forEach(a => {
    if ((a.getAttribute('href') || '') === page) a.classList.add('active');
  });
}
highlightActiveNav();

// ── 12. BUTTON LAYOUT STABILIZER ─────────────────────────────
function stabilizeButtons() {
  document.querySelectorAll('button, .btn').forEach(btn => {
    if (btn.classList.contains('sb-toast-close')) return;
    btn.style.minHeight = btn.style.minHeight || '40px';
  });
}
stabilizeButtons();

// ── 13. PARTICLE BURST ON CTA CLICK ─────────────────────────
function initParticleBurst() {
  const CTA = '.analyze-btn, .ci-btn, .btn-primary';

  function burst(x, y, color = '#a78bfa') {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const angle  = (Math.PI * 2 / count) * i;
      const speed  = 40 + Math.random() * 50;
      const size   = 4 + Math.random() * 5;
      Object.assign(p.style, {
        position:  'fixed',
        left:      x + 'px',
        top:       y + 'px',
        width:     size + 'px',
        height:    size + 'px',
        borderRadius: '50%',
        background: color,
        pointerEvents: 'none',
        zIndex:    99997,
        transition: `transform .55s cubic-bezier(.22,.68,0,1.1), opacity .55s ease`,
        boxShadow: `0 0 ${size * 2}px ${color}`,
        transform: 'translate(-50%,-50%)',
        opacity: '1'
      });
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate(calc(-50% + ${Math.cos(angle) * speed}px), calc(-50% + ${Math.sin(angle) * speed}px)) scale(0)`;
        p.style.opacity   = '0';
      });
      setTimeout(() => p.remove(), 620);
    }
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest(CTA);
    if (btn && !btn.disabled) {
      const r = btn.getBoundingClientRect();
      burst(e.clientX, e.clientY);
    }
  });
}
initParticleBurst();

// ── 14. SMOOTH SCROLL TO SECTIONS ─────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── 15. ANALYTICS LIVE CLOCK ─────────────────────────────────
if (['js-analytics.html','rec-analytics.html','admin-analytics.html'].includes(page)) {
  const h1 = document.querySelector('h1,h2');
  if (h1) {
    const t = document.createElement('small');
    t.style.cssText = 'display:block;color:#6b7280;font-size:12px;margin-top:4px;font-family:Inter,sans-serif';
    h1.after(t);
    const tick = () => { t.textContent = `Live · ${new Date().toLocaleTimeString()}`; };
    tick(); setInterval(tick, 1000);
  }
}

// ── 16. BUTTON SHIMMER HOVER (JS-triggered for dynamic buttons) ──
function attachShimmer() {
  document.querySelectorAll('button:not(.sb-toast-close):not([data-shimmer])').forEach(btn => {
    btn.dataset.shimmer = '1';
    btn.addEventListener('mouseenter', () => {
      btn.style.backgroundPosition = '200% center';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.backgroundPosition = '0% center';
    });
  });
}
setTimeout(attachShimmer, 800);

// ── 17. MOBILE SIDEBAR ────────────────────────────────────────
function setupMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 980) sidebar.classList.remove('mobile-hidden');
  });
}
setupMobileSidebar();
