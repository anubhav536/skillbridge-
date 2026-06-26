// ================================================================
// ⚡ SkillBridge AI — Premium Enhancement Engine v4.0
// Theme Engine · Command Palette · Cursor · Ripple · Tilt
// Stagger · Counter · Magnetic · Toast · Particle Burst
// ================================================================

const PAGE = window.location.pathname.split('/').pop() || 'index.html';

// ── 1. THEME ENGINE ─────────────────────────────────────────────
const THEMES = [
  { id:'purple',   name:'Purple',   hex:'#7c3aed', cls:'' },
  { id:'blue',     name:'Blue',     hex:'#2563eb', cls:'theme-blue' },
  { id:'emerald',  name:'Emerald',  hex:'#059669', cls:'theme-emerald' },
  { id:'rose',     name:'Rose',     hex:'#e11d48', cls:'theme-rose' },
  { id:'indigo',   name:'Indigo',   hex:'#4338ca', cls:'theme-indigo' },
  { id:'teal',     name:'Teal',     hex:'#0d9488', cls:'theme-teal' },
  { id:'orange',   name:'Orange',   hex:'#ea580c', cls:'theme-orange' },
  { id:'amber',    name:'Amber',    hex:'#d97706', cls:'theme-amber' },
  { id:'cyan',     name:'Cyan',     hex:'#0891b2', cls:'theme-cyan' },
  { id:'midnight', name:'Dark+',    hex:'#6366f1', cls:'theme-midnight' },
];

function initThemeEngine() {
  // Load saved theme
  const saved = localStorage.getItem('sb-theme') || 'purple';
  applyTheme(saved, false);

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #sb-theme-btn {
      position: fixed; bottom: 5.25rem; right: 1.25rem; z-index: 9990;
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, var(--p1), var(--p2));
      border: 1.5px solid rgba(255,255,255,.15);
      box-shadow: 0 4px 20px var(--pg), 0 0 0 1px rgba(255,255,255,.08);
      cursor: none; display: flex; align-items: center; justify-content: center;
      font-size: 18px; transition: all .2s ease;
      animation: themeBtnFloat 3s ease-in-out infinite;
    }
    #sb-theme-btn:hover { transform: scale(1.1) !important; box-shadow: 0 8px 30px var(--pg); }
    @keyframes themeBtnFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

    #sb-theme-panel {
      position: fixed; bottom: 10rem; right: 1.25rem; z-index: 9989;
      background: rgba(10,6,30,.96); border: 1px solid var(--bd);
      border-radius: 18px; padding: 1.1rem; width: 220px;
      box-shadow: 0 20px 60px rgba(2,0,20,.65), 0 0 0 1px rgba(124,58,237,.15);
      backdrop-filter: blur(24px);
      opacity: 0; transform: translateY(10px) scale(.96);
      transition: opacity .22s ease, transform .22s cubic-bezier(.4,0,.2,1);
      pointer-events: none;
    }
    #sb-theme-panel.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }
    .sb-theme-title { font-size: 11px; font-weight: 700; color: var(--t4); letter-spacing: .5px; text-transform: uppercase; margin-bottom: .75rem; font-family: Inter, sans-serif; }
    .sb-theme-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: .4rem; }
    .sb-swatch {
      width: 34px; height: 34px; border-radius: 50%; cursor: none;
      border: 2px solid transparent; transition: all .18s ease;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px;
    }
    .sb-swatch:hover { transform: scale(1.18); }
    .sb-swatch.active { border-color: rgba(255,255,255,.7); box-shadow: 0 0 12px rgba(255,255,255,.3); }
    .sb-theme-name { font-size: 11px; color: var(--t4); text-align: center; margin-top: .6rem; font-family: Inter, sans-serif; }
  `;
  document.head.appendChild(style);

  // Create button
  const btn = document.createElement('button');
  btn.id = 'sb-theme-btn';
  btn.title = 'Switch Theme';
  btn.setAttribute('aria-label', 'Switch color theme');
  btn.textContent = '🎨';
  btn.setAttribute('data-no-ripple', '1');
  document.body.appendChild(btn);

  // Create panel
  const panel = document.createElement('div');
  panel.id = 'sb-theme-panel';
  panel.setAttribute('aria-label', 'Color theme selector');
  panel.innerHTML = `
    <div class="sb-theme-title">Color Theme</div>
    <div class="sb-theme-grid" id="sb-theme-grid"></div>
    <div class="sb-theme-name" id="sb-theme-label">Purple (Default)</div>
  `;
  document.body.appendChild(panel);

  // Populate swatches
  const grid  = document.getElementById('sb-theme-grid');
  const label = document.getElementById('sb-theme-label');
  THEMES.forEach(t => {
    const sw = document.createElement('div');
    sw.className = 'sb-swatch' + (t.id === saved ? ' active' : '');
    sw.style.background = t.hex;
    sw.title = t.name;
    sw.setAttribute('role', 'button');
    sw.setAttribute('aria-label', `${t.name} theme`);
    sw.addEventListener('click', () => {
      applyTheme(t.id);
      document.querySelectorAll('.sb-swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      label.textContent = t.name;
      panel.classList.remove('open');
    });
    sw.addEventListener('mouseenter', () => { label.textContent = t.name; });
    sw.addEventListener('mouseleave', () => { label.textContent = (localStorage.getItem('sb-theme-name') || 'Purple'); });
    grid.appendChild(sw);
  });

  // Toggle panel
  btn.addEventListener('click', () => { panel.classList.toggle('open'); });
  document.addEventListener('click', e => {
    if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove('open');
  });
}

function applyTheme(id, save = true) {
  const t = THEMES.find(t => t.id === id) || THEMES[0];
  // Remove all theme classes
  THEMES.forEach(th => { if (th.cls) document.body.classList.remove(th.cls); });
  // Add new theme class (purple has no class — it's the default :root)
  if (t.cls) document.body.classList.add(t.cls);
  if (save) {
    localStorage.setItem('sb-theme', id);
    localStorage.setItem('sb-theme-name', t.name);
  }
}

initThemeEngine();

// ── 2. COMMAND PALETTE (Cmd+K / Ctrl+K) ─────────────────────────
function initCommandPalette() {
  const ALL_COMMANDS = [
    // Public
    { label: '🏠 Home',                 url: 'index.html',           tags: 'home landing' },
    { label: '📖 About',                url: 'about.html',           tags: 'about info' },
    { label: '📬 Contact',              url: 'contact.html',         tags: 'contact support' },
    // Job Seeker
    { label: '📊 Dashboard',            url: 'js-dashboard.html',    tags: 'dashboard overview jobseeker' },
    { label: '🧑 My Profile',           url: 'js-profile.html',      tags: 'profile edit jobseeker' },
    { label: '💼 Browse Jobs',          url: 'js-jobs.html',         tags: 'jobs browse search jobseeker' },
    { label: '📋 My Applications',      url: 'js-applications.html', tags: 'applications status jobseeker' },
    { label: '📄 Resume Builder',       url: 'js-resume.html',       tags: 'resume cv build jobseeker' },
    { label: '📈 Analytics',            url: 'js-analytics.html',    tags: 'analytics stats jobseeker' },
    { label: '🧠 AI Career Gap',        url: 'career-gap.html',      tags: 'career ai gap analysis jobseeker' },
    // Recruiter
    { label: '🏢 Recruiter Dashboard',  url: 'rec-dashboard.html',   tags: 'recruiter dashboard' },
    { label: '👥 Applicants',           url: 'rec-applicants.html',  tags: 'applicants candidates recruiter' },
    { label: '📢 Post Job',             url: 'rec-post-job.html',    tags: 'post job recruiter' },
    { label: '📂 Manage Jobs',          url: 'rec-manage-jobs.html', tags: 'manage jobs recruiter' },
    { label: '📊 Recruiter Analytics',  url: 'rec-analytics.html',   tags: 'analytics recruiter' },
    { label: '🧑‍💼 Recruiter Profile',  url: 'rec-profile.html',     tags: 'profile recruiter' },
    // Admin
    { label: '🛡️ Admin Dashboard',     url: 'admin-dashboard.html', tags: 'admin dashboard' },
    { label: '👤 Manage Users',         url: 'admin-users.html',     tags: 'users admin manage' },
    { label: '💼 Manage Jobs',          url: 'admin-jobs.html',      tags: 'jobs admin manage' },
    { label: '📋 Admin Applications',   url: 'admin-applications.html', tags: 'applications admin' },
    { label: '📈 Admin Analytics',      url: 'admin-analytics.html', tags: 'analytics admin' },
    { label: '🚨 Flags',               url: 'admin-flags.html',     tags: 'flags reports admin' },
    { label: '🏆 Leaderboard',         url: 'admin-leaderboard.html', tags: 'leaderboard admin' },
    { label: '📝 Project Report',       url: 'project-report.html',  tags: 'report project docs' },
  ];

  const style = document.createElement('style');
  style.textContent = `
    #sb-palette-overlay {
      position: fixed; inset: 0; z-index: 99990;
      background: rgba(2,0,16,.65);
      backdrop-filter: blur(8px);
      display: flex; align-items: flex-start; justify-content: center;
      padding-top: clamp(60px, 15vh, 160px);
      opacity: 0; transition: opacity .18s ease;
      pointer-events: none;
    }
    #sb-palette-overlay.open { opacity: 1; pointer-events: all; }
    #sb-palette {
      width: min(580px, calc(100vw - 2rem));
      background: rgba(10,6,32,.97);
      border: 1px solid var(--bd);
      border-radius: 18px;
      box-shadow: 0 32px 80px rgba(2,0,20,.7), 0 0 0 1px rgba(124,58,237,.2);
      overflow: hidden;
      transform: scale(.96) translateY(-10px);
      transition: transform .22s cubic-bezier(.4,0,.2,1);
    }
    #sb-palette-overlay.open #sb-palette { transform: scale(1) translateY(0); }
    #sb-palette-head {
      display: flex; align-items: center; gap: .75rem;
      padding: .9rem 1.1rem;
      border-bottom: 1px solid var(--bd2);
    }
    #sb-palette-head span { font-size: 16px; color: var(--t4); }
    #sb-palette-input {
      flex: 1; background: transparent; border: none !important;
      color: var(--t1); font-size: 15px; font-family: Inter,sans-serif;
      outline: none; padding: 0; margin: 0;
      box-shadow: none !important;
    }
    #sb-palette-input::placeholder { color: var(--t4); font-weight: 400; }
    #sb-palette-kbd {
      font-size: 11px; color: var(--t4);
      background: rgba(255,255,255,.06); border: 1px solid var(--bd2);
      border-radius: 5px; padding: .15rem .45rem; white-space: nowrap;
      font-family: monospace;
    }
    #sb-palette-list { max-height: 340px; overflow-y: auto; padding: .45rem; }
    .sb-cmd-item {
      display: flex; align-items: center; gap: .65rem;
      padding: .65rem .85rem; border-radius: 10px;
      cursor: none; transition: background .12s ease;
      color: var(--t2); font-size: 13.5px; font-family: Inter,sans-serif;
      font-weight: 500; text-decoration: none; border: 1px solid transparent;
    }
    .sb-cmd-item:hover, .sb-cmd-item.focused {
      background: var(--pb); border-color: var(--bd2); color: var(--t1);
    }
    .sb-cmd-item.focused { background: rgba(124,58,237,.18); border-color: var(--bd); }
    .sb-cmd-empty { padding: 1.5rem; text-align: center; color: var(--t4); font-size: 13.5px; font-family: Inter,sans-serif; }
    #sb-palette-footer {
      display: flex; gap: 1.5rem; align-items: center;
      padding: .6rem 1.1rem; border-top: 1px solid var(--bd2);
      font-size: 11.5px; color: var(--t4); font-family: Inter,sans-serif;
    }
    .sb-pal-hint { display: flex; align-items: center; gap: .3rem; }
    .sb-pal-hint kbd {
      background: rgba(255,255,255,.06); border: 1px solid var(--bd2);
      border-radius: 4px; padding: .1rem .35rem; font-size: 10px; font-family: monospace;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'sb-palette-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Command palette');
  overlay.innerHTML = `
    <div id="sb-palette">
      <div id="sb-palette-head">
        <span>🔍</span>
        <input id="sb-palette-input" placeholder="Search pages, actions..." autocomplete="off" spellcheck="false">
        <span id="sb-palette-kbd">ESC</span>
      </div>
      <div id="sb-palette-list"></div>
      <div id="sb-palette-footer">
        <span class="sb-pal-hint"><kbd>↑↓</kbd> Navigate</span>
        <span class="sb-pal-hint"><kbd>↵</kbd> Open</span>
        <span class="sb-pal-hint"><kbd>Esc</kbd> Close</span>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  let focused = -1;
  let filtered = [];

  function renderList(q = '') {
    const list = document.getElementById('sb-palette-list');
    filtered = q
      ? ALL_COMMANDS.filter(c => (c.label + ' ' + c.tags).toLowerCase().includes(q.toLowerCase()))
      : ALL_COMMANDS;
    focused = -1;

    if (!filtered.length) {
      list.innerHTML = `<div class="sb-cmd-empty">No results for "${q}"</div>`;
      return;
    }
    list.innerHTML = filtered.map((c, i) =>
      `<a class="sb-cmd-item" href="${c.url}" data-idx="${i}" tabindex="-1">${c.label}</a>`
    ).join('');

    list.querySelectorAll('.sb-cmd-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        setFocused(+el.dataset.idx);
      });
    });
  }

  function setFocused(idx) {
    focused = Math.max(0, Math.min(idx, filtered.length - 1));
    document.querySelectorAll('.sb-cmd-item').forEach((el, i) => {
      el.classList.toggle('focused', i === focused);
      if (i === focused) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function openPalette() {
    overlay.classList.add('open');
    const inp = document.getElementById('sb-palette-input');
    inp.value = '';
    renderList('');
    setTimeout(() => inp.focus(), 50);
  }
  function closePalette() {
    overlay.classList.remove('open');
  }

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? closePalette() : openPalette();
    }
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(focused + 1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(focused - 1); }
    if (e.key === 'Enter') {
      e.preventDefault();
      const items = document.querySelectorAll('.sb-cmd-item');
      if (focused >= 0 && items[focused]) window.location.href = items[focused].href;
    }
  });

  document.getElementById('sb-palette-input').addEventListener('input', e => {
    renderList(e.target.value);
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePalette();
  });

  // Show Cmd+K hint in navbar (subtle)
  const navbar = document.querySelector('.navbar, nav');
  if (navbar && !document.getElementById('sb-cmdk-hint')) {
    const hint = document.createElement('button');
    hint.id = 'sb-cmdk-hint';
    hint.setAttribute('data-no-ripple', '1');
    hint.title = 'Command Palette (Cmd+K)';
    hint.setAttribute('aria-label', 'Open command palette');
    hint.style.cssText = `
      background: rgba(124,58,237,.1); border: 1px solid var(--bd2);
      border-radius: 8px; color: var(--t4); font-size: 12px; font-family: Inter,sans-serif;
      padding: .32rem .7rem; cursor: none; transition: all .18s ease;
      display: flex; align-items: center; gap: .35rem; font-weight: 500;
    `;
    hint.innerHTML = `<span>⌘K</span>`;
    hint.addEventListener('click', openPalette);
    hint.addEventListener('mouseenter', () => {
      hint.style.background = 'var(--pb)';
      hint.style.borderColor = 'var(--bd)';
      hint.style.color = 'var(--t3)';
    });
    hint.addEventListener('mouseleave', () => {
      hint.style.background = 'rgba(124,58,237,.1)';
      hint.style.borderColor = 'var(--bd2)';
      hint.style.color = 'var(--t4)';
    });
    navbar.appendChild(hint);
  }
}

initCommandPalette();

// ── 3. PAGE LOADER ───────────────────────────────────────────────
(function initPageLoader() {
  const loader = document.createElement('div');
  loader.id = 'sb-page-loader';
  loader.style.cssText = `
    position:fixed;inset:0;background:var(--bg, #06041a);z-index:100000;
    display:flex;align-items:center;justify-content:center;
    transition:opacity .38s ease;
  `;
  loader.innerHTML = `<div class="sb-loader-ring"></div>`;
  document.body.insertBefore(loader, document.body.firstChild);
  const remove = () => {
    loader.style.opacity = '0';
    setTimeout(() => { if (loader.parentNode) loader.remove(); }, 400);
  };
  if (document.readyState === 'complete') { setTimeout(remove, 120); }
  else { window.addEventListener('load', () => setTimeout(remove, 120)); }
  setTimeout(remove, 1400);
})();

// ── 4. CUSTOM CURSOR ─────────────────────────────────────────────
function initCursor() {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after { cursor: none !important; }
    #sb-cursor {
      position:fixed;width:9px;height:9px;background:var(--p1,#7c3aed);border-radius:50%;
      pointer-events:none;z-index:99999;transform:translate(-50%,-50%);
      transition:width .15s ease,height .15s ease,background .15s ease,opacity .15s ease;
      box-shadow:0 0 14px rgba(124,58,237,.9),0 0 28px rgba(124,58,237,.35);
      mix-blend-mode:screen;
    }
    #sb-cursor-ring {
      position:fixed;width:34px;height:34px;border:1.5px solid rgba(167,139,250,.45);border-radius:50%;
      pointer-events:none;z-index:99998;transform:translate(-50%,-50%);
      transition:width .3s cubic-bezier(.4,0,.2,1),height .3s cubic-bezier(.4,0,.2,1),border-color .2s ease;
    }
    #sb-cursor.ch { width:5px;height:5px;background:var(--p4,#c4b5fd); }
    #sb-cursor-ring.ch { width:50px;height:50px;border-color:rgba(167,139,250,.75); }
    #sb-cursor.cc { width:13px;height:13px; }
    @media (hover:none),(pointer:coarse) { *{cursor:auto!important} #sb-cursor,#sb-cursor-ring{display:none!important} }
  `;
  document.head.appendChild(style);

  const dot  = document.createElement('div'); dot.id  = 'sb-cursor';
  const ring = document.createElement('div'); ring.id = 'sb-cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * .11; ry += (my - ry) * .11;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  const hov = 'button,a,input,select,textarea,label,[role="button"],.pick-card,.applicant-card,.cg-job-card,.feat-card,.sb-swatch,.sb-cmd-item,.how-step,.stat-bubble';
  document.addEventListener('mouseover', e => {
    if (e.target.matches(hov) || e.target.closest(hov)) { dot.classList.add('ch'); ring.classList.add('ch'); }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.matches(hov) || e.target.closest(hov)) { dot.classList.remove('ch'); ring.classList.remove('ch'); }
  });
  document.addEventListener('mousedown', () => dot.classList.add('cc'));
  document.addEventListener('mouseup',   () => dot.classList.remove('cc'));
  document.addEventListener('mouseleave', () => { dot.style.opacity='0'; ring.style.opacity='0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity='1'; ring.style.opacity='1'; });
}
initCursor();

// ── 5. RIPPLE ON CLICK ────────────────────────────────────────────
document.addEventListener('click', e => {
  const btn = e.target.closest('button,.btn,.primary-btn,.secondary-btn,.quick-btn,.q-btn,.analyze-btn,.ci-btn,.pick-apply,.cg-apply-btn,.feat-card,.how-step');
  if (!btn || btn.disabled || btn.dataset.noRipple) return;

  const existing = btn.style.position;
  if (!existing || existing === 'static') btn.style.position = 'relative';
  btn.style.overflow = 'hidden';

  const r    = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  r.style.cssText = `
    position:absolute;border-radius:50%;background:rgba(255,255,255,.18);
    width:${size}px;height:${size}px;
    left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;
    transform:scale(0);animation:rippleOut .6s ease-out forwards;pointer-events:none;
  `;
  const kf = document.createElement('style');
  kf.textContent = '@keyframes rippleOut{to{transform:scale(4.5);opacity:0}}';
  if (!document.getElementById('sb-ripple-kf')) { kf.id='sb-ripple-kf'; document.head.appendChild(kf); }
  btn.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
});

// ── 6. 3D CARD TILT ──────────────────────────────────────────────
function init3DTilt() {
  if (window.matchMedia('(hover:none)').matches) return;
  const SEL = '.stat-card,.dash-card,.score-card,.applicant-card,.pick-card,.cg-job-card,.section-card,.feat-card,.stat-bubble,.how-step,.cg-section,.mini-card';
  const MAX = 7;

  function attach(el) {
    if (el._tilt) return; el._tilt = true;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      el.style.transform       = `perspective(800px) rotateY(${x*MAX}deg) rotateX(${-y*MAX}deg) translateY(-3px)`;
      el.style.boxShadow       = `${-x*14}px ${(-y*14)+14}px 40px rgba(2,0,20,.55), 0 0 32px var(--pb)`;
      el.style.transition      = 'none';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .45s cubic-bezier(.4,0,.2,1), box-shadow .45s ease';
      el.style.transform  = ''; el.style.boxShadow = '';
    });
  }

  function run() { document.querySelectorAll(SEL).forEach(attach); }
  run(); setTimeout(run, 1000); setTimeout(run, 2500);
}
init3DTilt();

// ── 7. MAGNETIC HOVER ─────────────────────────────────────────────
function initMagnetic() {
  if (window.matchMedia('(hover:none)').matches) return;
  const SEL = '.analyze-btn,.ci-btn,.hero-btns .primary-btn,.hero-cta .primary-btn,.cg-apply-btn,.auth-submit';
  const STR = .32;

  function attach(el) {
    if (el._mag) return; el._mag = true;
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2))  * STR;
      const dy = (e.clientY - (r.top  + r.height/2)) * STR;
      el.style.transform = `translate(${dx}px,${dy}px) scale(1.03)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  }

  function run() { document.querySelectorAll(SEL).forEach(attach); }
  run(); setTimeout(run, 1200); setTimeout(run, 2500);
}
initMagnetic();

// ── 8. STAGGER MOUNT ──────────────────────────────────────────────
function initStagger() {
  const SEL = '.stats-grid,.stat-grid,.mini-grid,.picks-grid,.app-grid,.apps-grid,.cg-jobs-grid,.files-grid,.feat-grid,.how-grid,.quick-grid,.feature-grid,.lower-two,.stat-row';

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      [...e.target.children].forEach((child, i) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(18px)';
        child.style.transition = `opacity .4s ease ${i*60}ms, transform .4s cubic-bezier(.4,0,.2,1) ${i*60}ms`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        }));
      });
      obs.unobserve(e.target);
    });
  }, { threshold: .06, rootMargin: '0px 0px -20px 0px' });

  function run() {
    document.querySelectorAll(SEL).forEach(el => {
      if (!el._stagger) { el._stagger = true; obs.observe(el); }
    });
  }
  run(); setTimeout(run, 800); setTimeout(run, 2000);
}
initStagger();

// ── 9. ANIMATED COUNTERS ──────────────────────────────────────────
function initCounters() {
  const SEL = [
    '.stat-card p','.dash-card > p','.mini-card > p','.stat-bubble h3',
    '#totalApps','#selectedApps','#score','#matchedCount',
    '#dashUsers','#dashJobs','#dashApps','#dashActive',
    '#totalCount','#shortCount','#hiredCount','#rejectCount',
    '#readinessNum','#skillMatchNum','#interviewNum',
    '#liveUsersCount','#liveJobsCount','#liveApplicationsCount',
    '#aboutLiveJobs','#aboutLiveUsers','#aboutLiveApplications',
  ].join(',');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const raw = el.textContent.trim();
      const num = parseFloat(raw.replace(/[^\d.]/g, ''));
      if (!isNaN(num) && num > 0 && !el._counted) {
        el._counted = true;
        const suffix = raw.replace(/[\d.]/g, '');
        const dur    = Math.min(1200, Math.max(400, num * 7));
        const start  = performance.now();
        el.classList.add('num-pop');
        const tick = now => {
          const t    = Math.min((now - start) / dur, 1);
          const ease = 1 - (1 - t) ** 3;
          el.textContent = Math.round(num * ease) + suffix;
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = raw;
        };
        requestAnimationFrame(tick);
      }
      obs.unobserve(el);
    });
  }, { threshold: .5 });

  function run() {
    document.querySelectorAll(SEL).forEach(el => {
      if (!el._cobs) { el._cobs = true; obs.observe(el); }
    });
  }
  run(); setTimeout(run, 1200); setTimeout(run, 2800);
}
initCounters();

// ── 10. PARTICLE BURST ────────────────────────────────────────────
document.addEventListener('click', e => {
  const btn = e.target.closest('.analyze-btn,.ci-btn,.hero-btns .primary-btn,.hero-cta .primary-btn,.auth-submit');
  if (!btn || btn.disabled) return;
  const colors = ['#a78bfa','#c4b5fd','#7c3aed','#818cf8','#e0e7ff'];
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    const angle = (Math.PI * 2 / 10) * i;
    const speed = 38 + Math.random() * 45;
    const size  = 4 + Math.random() * 4;
    const col   = colors[Math.floor(Math.random() * colors.length)];
    Object.assign(p.style, {
      position:'fixed', borderRadius:'50%', background:col,
      width:size+'px', height:size+'px', pointerEvents:'none',
      zIndex:'99997', left:e.clientX+'px', top:e.clientY+'px',
      transition:'transform .55s cubic-bezier(.4,0,.2,1), opacity .55s ease',
      boxShadow:`0 0 ${size*2}px ${col}`, transform:'translate(-50%,-50%)',
    });
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(calc(-50% + ${Math.cos(angle)*speed}px), calc(-50% + ${Math.sin(angle)*speed}px)) scale(0)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 600);
  }
});

// ── 11. TOAST SYSTEM ──────────────────────────────────────────────
(function initToast() {
  if (document.getElementById('sb-toast-box')) return;

  const style = document.createElement('style');
  style.textContent = `
    #sb-toast-box {
      position:fixed;bottom:1.4rem;right:1.4rem;z-index:99900;
      display:flex;flex-direction:column-reverse;gap:.5rem;
      pointer-events:none;max-width:320px;
    }
    .sb-toast {
      display:flex;align-items:center;gap:.6rem;padding:.82rem 1.1rem;
      border-radius:14px;backdrop-filter:blur(20px);font-family:Inter,sans-serif;
      font-size:13.5px;font-weight:500;color:#ede9fe;pointer-events:all;
      max-width:320px;line-height:1.45;position:relative;overflow:hidden;
      animation:toastIn .3s cubic-bezier(.4,0,.2,1) forwards;
      box-shadow:0 12px 40px rgba(2,0,20,.55),0 0 0 1px rgba(139,92,246,.2);
    }
    .t-success{background:rgba(22,163,74,.22);border:1px solid rgba(74,222,128,.3)}
    .t-error  {background:rgba(220,38,38,.22); border:1px solid rgba(248,113,113,.3)}
    .t-info   {background:rgba(16,10,44,.94);  border:1px solid rgba(124,58,237,.38)}
    .t-warning{background:rgba(217,119,6,.22); border:1px solid rgba(245,158,11,.38)}
    .sb-toast.hiding{animation:toastOut .28s ease forwards}
    .sb-t-close{background:none!important;border:none!important;color:rgba(167,139,250,.55)!important;
      cursor:none!important;font-size:15px;padding:0 .15rem;line-height:1;transition:color .15s;
      flex-shrink:0;min-height:auto!important;box-shadow:none!important;
      transform:none!important;width:auto!important;border-radius:4px!important;animation:none!important;}
    .sb-t-close:hover{color:#c4b5fd!important}
    .sb-t-prog{position:absolute;bottom:0;left:0;height:2.5px;border-radius:0 0 14px 14px;animation:tProg linear forwards}
    .t-success .sb-t-prog{background:#4ade80}.t-error .sb-t-prog{background:#f87171}
    .t-info .sb-t-prog{background:#a78bfa}.t-warning .sb-t-prog{background:#fcd34d}
    @keyframes toastIn{from{opacity:0;transform:translateX(20px) scale(.95)}to{opacity:1;transform:none}}
    @keyframes toastOut{from{opacity:1;max-height:80px}to{opacity:0;max-height:0;padding:0;margin:0}}
    @keyframes tProg{from{width:100%}to{width:0%}}
  `;
  document.head.appendChild(style);

  const box = document.createElement('div');
  box.id = 'sb-toast-box';
  document.body.appendChild(box);
})();

window.showToast = function(msg, type = 'info', dur = 3800) {
  const box = document.getElementById('sb-toast-box');
  if (!box) return;
  const icons = { success:'✅', error:'❌', info:'💡', warning:'⚠️' };
  const el = document.createElement('div');
  el.className = `sb-toast t-${type}`;
  el.innerHTML = `
    <span style="font-size:16px;flex-shrink:0">${icons[type]||'💡'}</span>
    <span style="flex:1">${msg}</span>
    <button class="sb-t-close" aria-label="Close">✕</button>
    ${dur > 0 ? `<div class="sb-t-prog" style="animation-duration:${dur}ms"></div>` : ''}
  `;
  const hide = () => {
    el.classList.add('hiding');
    setTimeout(() => el.remove(), 300);
  };
  el.querySelector('.sb-t-close').addEventListener('click', hide);
  box.appendChild(el);
  if (dur > 0) setTimeout(hide, dur);
  return el;
};

// ── 12. ALERT → TOAST ─────────────────────────────────────────────
const _alert = window.alert;
window.alert = function(msg) {
  if (typeof msg === 'string' && window.showToast) {
    const t = /❌|error|fail|invalid|wrong/i.test(msg) ? 'error'
            : /✅|success|sent|applied|saved|hired/i.test(msg) ? 'success'
            : /⚠️|pending|restrict|warn/i.test(msg) ? 'warning' : 'info';
    window.showToast(msg, t);
  } else { _alert.call(window, msg); }
};

// ── 13. FORM ENHANCEMENTS ─────────────────────────────────────────
(function enhanceForms() {
  // Password strength
  const pwd = document.getElementById('password');
  const existingMsg = document.getElementById('pwdStrengthMsg') || document.getElementById('pwdStrength');
  if (pwd && !existingMsg && !pwd._enhanced) {
    pwd._enhanced = true;
    const m = document.createElement('small');
    m.style.cssText = 'display:block;margin-top:3px;font-size:11.5px;transition:color .2s;height:16px;color:#6b7280;font-family:Inter,sans-serif';
    pwd.after(m);
    pwd.addEventListener('input', () => {
      const v = pwd.value;
      if (!v) { m.textContent = ''; return; }
      if (v.length >= 10 && /\d/.test(v) && /[^a-zA-Z0-9]/.test(v)) { m.style.color='#4ade80'; m.textContent='Strong 💪'; }
      else if (v.length >= 8 && /\d/.test(v)) { m.style.color='#fcd34d'; m.textContent='Medium 🙂'; }
      else { m.style.color='#f87171'; m.textContent='Weak — use 8+ chars & numbers 😬'; }
    });
  }

  // Draft autosave
  const fields = ['name','email','title','skills','salary','location','phone','bio','company','experience','education','message'];
  const key = `draft:${PAGE}`;
  let draft = {}; try { draft = JSON.parse(localStorage.getItem(key)||'{}'); } catch(_){}
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (draft[id] && !el.value) el.value = draft[id];
    el.addEventListener('input', () => {
      draft[id] = el.value;
      try { localStorage.setItem(key, JSON.stringify(draft)); } catch(_){}
    });
  });
})();

// ── 14. ACTIVE NAV ────────────────────────────────────────────────
document.querySelectorAll('.sidebar nav a').forEach(a => {
  if ((a.getAttribute('href') || '') === PAGE) a.classList.add('active');
});

// ── 15. SMOOTH SCROLL ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
  });
});

// ── 16. ACCESSIBILITY: FOCUS RING ─────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') document.body.classList.add('kb-nav');
});
document.addEventListener('mousedown', () => {
  document.body.classList.remove('kb-nav');
});
const kbStyle = document.createElement('style');
kbStyle.textContent = `body:not(.kb-nav) *:focus { outline: none !important; }`;
document.head.appendChild(kbStyle);

// ── 17. KEYBOARD SHORTCUT HINTS ───────────────────────────────────
document.addEventListener('keydown', e => {
  // Already handled: Cmd+K for palette
  if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const focused = document.activeElement;
    if (focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA')) return;
    window.showToast && window.showToast('⌘K — Command Palette &nbsp;|&nbsp; T — Theme Switcher', 'info', 3000);
  }
  if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const focused = document.activeElement;
    if (focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA')) return;
    const btn = document.getElementById('sb-theme-btn');
    if (btn) btn.click();
  }
});
