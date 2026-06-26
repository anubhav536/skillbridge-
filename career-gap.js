// =============================================
// 🧠 SkillBridge AI — Career Gap Analyzer
// Phase 4: AI Career Intelligence (No external API)
// =============================================

import { db, getSession, logoutUser, protectPage } from "./firebase.js";
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { analyzeCareerGap, matchLabel } from "./ai-match.js";

protectPage("jobseeker");
document.getElementById("logoutBtn").addEventListener("click", logoutUser);

const user = getSession();
if (!user) { window.location.href = "jobseeker-login.html"; }

// Greet user
document.getElementById("userName").textContent = user.name || "Job Seeker";
document.getElementById("userSkillsPreview").textContent =
  user.skills ? `Skills: ${user.skills}` : "⚠️ No skills added — add them in Profile first";

// ── Animate counter ──────────────────────────────────────────
function animateNumber(el, from, to, duration = 1200) {
  const step = (to - from) / (duration / 16);
  let cur = from;
  const id = setInterval(() => {
    cur += step;
    if ((step > 0 && cur >= to) || (step < 0 && cur <= to)) {
      clearInterval(id);
      el.textContent = Math.round(to);
    } else {
      el.textContent = Math.round(cur);
    }
  }, 16);
}

// ── Score ring ───────────────────────────────────────────────
function setScoreRing(score, ringId, numId, labelId, label) {
  const circle = document.getElementById(ringId);
  const numEl  = document.getElementById(numId);
  const labEl  = document.getElementById(labelId);
  const r = 52;
  const circumference = 2 * Math.PI * r;
  if (circle) {
    circle.style.strokeDasharray  = circumference;
    circle.style.strokeDashoffset = circumference - (score / 100) * circumference;
    const col = score >= 75 ? '#4ade80' : score >= 50 ? '#a78bfa' : score >= 30 ? '#f59e0b' : '#f87171';
    circle.style.stroke = col;
  }
  if (numEl)  animateNumber(numEl, 0, score);
  if (labEl)  labEl.textContent = label;
}

// ── Tag builder ──────────────────────────────────────────────
function skillTag(name, variant = 'neutral') {
  const colors = {
    strong:  'background:rgba(74,222,128,.15);border:1px solid rgba(74,222,128,.4);color:#4ade80',
    missing: 'background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.4);color:#f87171',
    weak:    'background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.35);color:#fcd34d',
    neutral: 'background:rgba(124,58,237,.14);border:1px solid rgba(124,58,237,.35);color:#c4b5fd'
  };
  return `<span style="display:inline-flex;align-items:center;padding:.25rem .65rem;border-radius:999px;font-size:12.5px;font-weight:600;${colors[variant]};margin:.2rem">${name}</span>`;
}

// ── Priority badge ───────────────────────────────────────────
function priorityBadge(priority) {
  const map = {
    High:   'background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.4)',
    Medium: 'background:rgba(245,158,11,.15);color:#fcd34d;border:1px solid rgba(245,158,11,.35)',
    Low:    'background:rgba(74,222,128,.12);color:#4ade80;border:1px solid rgba(74,222,128,.35)'
  };
  return `<span style="font-size:11px;font-weight:700;padding:.15rem .55rem;border-radius:999px;${map[priority] || map.Low}">${priority}</span>`;
}

// ── Main analysis ─────────────────────────────────────────────
async function runAnalysis() {
  const btn      = document.getElementById("analyzeBtn");
  const results  = document.getElementById("analysisResults");
  const skeleton = document.getElementById("skeletonLoader");
  const empty    = document.getElementById("emptyState");

  btn.disabled   = true;
  btn.innerHTML  = '<span class="spin-icon">⚙️</span> Analyzing...';
  empty.style.display    = "none";
  skeleton.style.display = "block";
  results.style.display  = "none";

  try {
    const snap = await getDocs(collection(db, "jobs"));
    const jobs = [];
    snap.forEach(d => jobs.push({ id: d.id, ...d.data() }));

    // Fallback: if no skills, use empty but still show analysis
    const analysis = analyzeCareerGap(user, jobs);

    // Slight delay for UX effect
    await new Promise(r => setTimeout(r, 800));

    skeleton.style.display = "none";
    results.style.display  = "block";

    renderResults(analysis, jobs.length);

  } catch (e) {
    console.error(e);
    skeleton.style.display = "none";
    empty.style.display    = "block";
    document.getElementById("emptyMsg").textContent = "Analysis failed. Check your connection and try again.";
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '🔄 Re-Analyze';
  }
}

function renderResults(a, totalJobs) {
  // ── Score rings ──
  setScoreRing(a.score, 'readinessRing', 'readinessNum', 'readinessLabel',
    a.score >= 75 ? 'Excellent' : a.score >= 50 ? 'Good' : a.score >= 30 ? 'Fair' : 'Needs Work');
  setScoreRing(a.skillMatchPct, 'skillMatchRing', 'skillMatchNum', 'skillMatchLabel',
    a.skillMatchPct >= 70 ? 'High Demand' : a.skillMatchPct >= 40 ? 'Moderate' : 'Build More');
  setScoreRing(a.interviewScore, 'interviewRing', 'interviewNum', 'interviewLabel',
    a.interviewScore >= 70 ? 'Interview Ready' : a.interviewScore >= 40 ? 'Getting There' : 'Needs Prep');

  // ── Strong skills ──
  document.getElementById("strongSkillsWrap").innerHTML = a.strongSkills.length
    ? a.strongSkills.map(s => skillTag(s, 'strong')).join('')
    : `<span style="color:#a78bfa;font-size:13.5px">No strong market skills detected yet — add more skills in Profile.</span>`;

  // ── Weak skills ──
  document.getElementById("weakSkillsWrap").innerHTML = a.weakSkills.length
    ? a.weakSkills.map(s => skillTag(s, 'weak')).join('')
    : `<span style="color:#a78bfa;font-size:13.5px">All your skills are market-aligned. 🎉</span>`;

  // ── Missing skills ──
  document.getElementById("missingSkillsWrap").innerHTML = a.missingSkills.length
    ? a.missingSkills.map(s => skillTag(s, 'missing')).join('')
    : `<span style="color:#4ade80;font-size:13.5px">You cover all top market skills! 🏆</span>`;

  // ── Top recommended jobs ──
  const jobsEl = document.getElementById("topJobsList");
  if (a.topJobs.length === 0) {
    jobsEl.innerHTML = `<p style="color:#a78bfa;font-size:14px;padding:.5rem 0">No jobs available right now — check back when new postings go live.</p>`;
  } else {
    jobsEl.innerHTML = a.topJobs.map(job => {
      const ml = matchLabel(job.matchScore);
      return `
      <div class="cg-job-card">
        <div class="cg-job-header">
          <div>
            <div class="cg-job-title">${job.title || 'Untitled'}</div>
            <div class="cg-job-meta">🏢 ${job.recruiter || 'Company'}${job.location ? ` · 📍 ${job.location}` : ''}</div>
          </div>
          <span class="cg-score-pill" style="color:${ml.color};border-color:${ml.color}40;background:${ml.color}18">${job.matchScore}%</span>
        </div>
        <div class="cg-match-bar-wrap">
          <div class="cg-match-bar" style="width:${job.matchScore}%;background:${ml.color}"></div>
        </div>
        <div class="cg-job-label" style="color:${ml.color}">${ml.label}</div>
        <a href="js-apply.html?jobId=${job.id}&title=${encodeURIComponent(job.title||'')}" class="cg-apply-btn">Apply Now →</a>
      </div>`;
    }).join('');
  }

  // ── Learning Roadmap ──
  const roadmapEl = document.getElementById("roadmapList");
  const roadmapEntries = Object.entries(a.roadmap);
  if (roadmapEntries.length === 0) {
    roadmapEl.innerHTML = `<p style="color:#4ade80;font-size:14px;padding:.5rem 0">🏆 Your skills already cover top market demands!</p>`;
  } else {
    roadmapEl.innerHTML = roadmapEntries.map(([cat, items]) => `
      <div class="cg-roadmap-cat">
        <div class="cg-roadmap-cat-title">📂 ${cat}</div>
        ${items.map(item => `
        <div class="cg-roadmap-item">
          <div class="cg-roadmap-skill">
            ${skillTag(item.skill, 'missing')}
            ${priorityBadge(item.priority)}
          </div>
          <div class="cg-roadmap-meta">
            <span>⏱ ${item.weeks}</span>
            <span style="color:#a78bfa">📖 ${item.resource}</span>
          </div>
        </div>`).join('')}
      </div>`).join('');
  }

  // ── Suggestions ──
  document.getElementById("suggestionsList").innerHTML = a.suggestions.map(s => {
    const clean = s.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f5f3ff">$1</strong>');
    return `<div class="cg-suggestion">${clean}</div>`;
  }).join('');

  // ── Stats footer ──
  document.getElementById("totalJobsAnalyzed").textContent = totalJobs;
  document.getElementById("marketSkillsCount").textContent = a.marketSkills.length;
  document.getElementById("strongCount").textContent = a.strongSkills.length;
  document.getElementById("missingCount").textContent = a.missingSkills.length;

  // Animate in
  document.getElementById("analysisResults").style.animation = 'pageFadeIn .5s ease forwards';
}

document.getElementById("analyzeBtn").addEventListener("click", runAnalysis);
