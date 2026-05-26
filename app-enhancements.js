const page = window.location.pathname.split('/').pop();

function qs(id) { return document.getElementById(id); }
function createNode(tag, attrs = {}, text = "") {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
  if (text) el.textContent = text;
  return el;
}

function injectRoleChip() {
  // Intentionally disabled: role-chip injection next to the SkillBridge AI brand.
}

function enhanceForms() {
  const commonRequired = ['name', 'email', 'password', 'title', 'skills', 'location'];
  commonRequired.forEach((id) => {
    const el = qs(id);
    if (el) el.setAttribute('required', 'required');
  });

  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', () => {
      const btn = form.querySelector('button[type="submit"],button');
      if (!btn) return;
      btn.dataset.oldText = btn.textContent;
      btn.textContent = 'Processing...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = btn.dataset.oldText || btn.textContent;
        btn.disabled = false;
      }, 4000);
    });
  });

  const password = qs('password');
  if (password && !qs('passwordStrength')) {
    const meter = createNode('small', { id: 'passwordStrength', style: 'display:block;margin-top:6px;color:#6b7280;' }, 'Use 8+ chars, mix letters, numbers, symbols.');
    password.insertAdjacentElement('afterend', meter);
    password.addEventListener('input', () => {
      const v = password.value || '';
      let label = 'Weak';
      if (v.length >= 10 && /\d/.test(v) && /[^\w\s]/.test(v)) label = 'Strong';
      else if (v.length >= 8 && /\d/.test(v)) label = 'Medium';
      meter.textContent = `Password strength: ${label}`;
      meter.style.color = label === 'Strong' ? '#059669' : (label === 'Medium' ? '#d97706' : '#dc2626');
    });
  }
}

function enableDraftAutosave() {
  const trackedIds = ['name','email','title','skills','salary','location','phone','bio','company','experience','education'];
  const key = `draft:${page}`;
  const draft = JSON.parse(localStorage.getItem(key) || '{}');
  trackedIds.forEach((id) => {
    const el = qs(id);
    if (!el) return;
    if (draft[id] && !el.value) el.value = draft[id];
    el.addEventListener('input', () => {
      draft[id] = el.value;
      localStorage.setItem(key, JSON.stringify(draft));
    });
  });
}

function profileCompleteness() {
  const profilePages = new Set(['js-profile.html', 'rec-profile.html', 'js-resume.html']);
  if (!profilePages.has(page)) return;

  const ids = ['name','email','phone','skills','location','experience','education','bio','company'];
  const root = document.querySelector('.main, main, .card, .auth-container') || document.body;
  const box = createNode('div', { style: 'margin:12px 0;padding:10px;border:1px solid #e5e7eb;border-radius:10px;background:#f8fafc;' });
  const title = createNode('div', { style: 'font-weight:600;margin-bottom:6px;' }, 'Profile Completeness');
  const barWrap = createNode('div', { style: 'height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden;' });
  const bar = createNode('div', { style: 'height:100%;width:0;background:#2563eb;' });
  const txt = createNode('small', { style: 'display:block;margin-top:6px;color:#374151;' }, '0% complete');
  barWrap.appendChild(bar); box.appendChild(title); box.appendChild(barWrap); box.appendChild(txt);
  root.prepend(box);

  const recalc = () => {
    let total = 0, done = 0;
    ids.forEach(id => {
      const el = qs(id);
      if (!el) return;
      total += 1;
      if ((el.value || '').trim()) done += 1;
    });
    const pct = total ? Math.round((done/total)*100) : 0;
    bar.style.width = pct + '%';
    bar.style.background = pct >= 80 ? '#16a34a' : (pct >= 50 ? '#f59e0b' : '#2563eb');
    txt.textContent = `${pct}% complete (${done}/${total} essential fields)`;
  };

  ids.forEach(id => { const el = qs(id); if (el) el.addEventListener('input', recalc); });
  recalc();
}

function enrichAnalyticsPages() {
  if (!['js-analytics.html','rec-analytics.html','admin-analytics.html'].includes(page)) return;
  const header = document.querySelector('h1,h2');
  if (!header) return;
  const time = createNode('small', { style: 'display:block;color:#6b7280;margin-top:4px;' }, 'Realtime panel active');
  header.insertAdjacentElement('afterend', time);
  setInterval(() => { time.textContent = `Realtime panel active • updated ${new Date().toLocaleTimeString()}`; }, 1000);
}

injectRoleChip();
enhanceForms();
enableDraftAutosave();
profileCompleteness();
enrichAnalyticsPages();


function stabilizeButtonLayout() {
  document.querySelectorAll(".page-top, .profile-top, .profile-head").forEach((top) => {
    top.style.display = "flex";
    top.style.alignItems = "center";
    top.style.justifyContent = "space-between";
    top.style.gap = "12px";
    top.style.flexWrap = "wrap";
  });

  document.querySelectorAll("button, .btn").forEach((btn) => {
    if (!btn.closest(".sidebar nav")) {
      btn.style.minHeight = "40px";
      btn.style.display = "inline-flex";
      btn.style.alignItems = "center";
      btn.style.justifyContent = "center";
      btn.style.gap = "6px";
    }
  });
}

stabilizeButtonLayout();
