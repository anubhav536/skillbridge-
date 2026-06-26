// =============================================
// 🤖 SkillBridge AI — Enhanced Matching Engine v2
// Phase 5: Weighted Smart Matching
// =============================================

/**
 * Normalise a skills string or array into a clean lowercase array.
 */
export function parseSkills(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : raw.split(/[,、;\/|]+/);
  return arr.map(s => s.trim().toLowerCase()).filter(Boolean);
}

/**
 * Classic match score — kept for backward compatibility.
 * Used by existing quick-apply and job listing pages.
 */
export function calcMatchScore(userSkillsRaw, jobSkillsRaw) {
  const userSkills = parseSkills(userSkillsRaw);
  const jobSkills  = parseSkills(jobSkillsRaw);
  if (!jobSkills.length) return 50;
  if (!userSkills.length) return 0;
  let matched = 0;
  for (const jSkill of jobSkills) {
    const hit = userSkills.some(uSkill =>
      uSkill === jSkill || uSkill.includes(jSkill) || jSkill.includes(uSkill)
    );
    if (hit) matched++;
  }
  return Math.round((matched / jobSkills.length) * 100);
}

/**
 * Returns matched and missing skill arrays for gap analysis.
 */
export function getSkillGap(userSkillsRaw, jobSkillsRaw) {
  const userSkills = parseSkills(userSkillsRaw);
  const jobSkills  = parseSkills(jobSkillsRaw);
  const matched = [], missing = [];
  for (const jSkill of jobSkills) {
    const hit = userSkills.some(uSkill =>
      uSkill === jSkill || uSkill.includes(jSkill) || jSkill.includes(uSkill)
    );
    if (hit) matched.push(jSkill); else missing.push(jSkill);
  }
  return { matched, missing };
}

/**
 * Sort jobs by classic match score descending.
 * Attaches .matchScore to each job object — backward compatible.
 */
export function rankJobs(jobs, userSkills) {
  return jobs
    .map(job => ({ ...job, matchScore: calcMatchScore(userSkills, job.skills) }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Returns a label + colour for a given score.
 */
export function matchLabel(score) {
  if (score >= 80) return { label: 'Excellent Match', color: '#4ade80' };
  if (score >= 60) return { label: 'Good Match',      color: '#a78bfa' };
  if (score >= 40) return { label: 'Fair Match',      color: '#f59e0b' };
  return              { label: 'Low Match',        color: '#f87171' };
}

/**
 * Compute an employability score (0–100) based on:
 *  - Profile completeness (skills + exp)
 *  - Application activity
 *  - Success rate
 */
export function calcEmployabilityScore({ skills, exp, totalApps, successApps }) {
  let score = 0;
  const parsedSkills = parseSkills(skills);
  score += Math.min(parsedSkills.length * 5, 35);
  const expNum = Number(exp) || 0;
  score += Math.min(expNum * 3, 15);
  score += Math.min(totalApps * 5, 25);
  const successRate = totalApps ? (successApps / totalApps) : 0;
  score += Math.round(successRate * 25);
  return Math.min(score, 100);
}

// =============================================
// 🧠 PHASE 5 — WEIGHTED SMART MATCHING ENGINE
// =============================================

const EDU_KEYWORDS = {
  high: ['phd', 'doctorate', 'mtech', 'm.tech', 'mba', 'masters', 'ms ', 'postgraduate'],
  mid:  ['btech', 'b.tech', 'be ', 'bsc', 'b.sc', 'bachelors', 'graduate', 'engineering'],
  low:  ['diploma', 'certification', 'certificate', 'course', '12th', 'hsc', 'ssc']
};

function scoreEducation(userEduRaw) {
  if (!userEduRaw) return 0;
  const edu = userEduRaw.toLowerCase();
  if (EDU_KEYWORDS.high.some(k => edu.includes(k))) return 20;
  if (EDU_KEYWORDS.mid.some(k => edu.includes(k)))  return 14;
  if (EDU_KEYWORDS.low.some(k => edu.includes(k)))  return 7;
  return 5; // unknown edu, give base credit
}

function scoreExperience(userExp, jobTitle) {
  const exp = Number(userExp) || 0;
  const title = (jobTitle || '').toLowerCase();
  const isSenior = title.includes('senior') || title.includes('lead') || title.includes('manager') || title.includes('head');
  const isJunior = title.includes('junior') || title.includes('fresher') || title.includes('trainee') || title.includes('intern');
  let score = Math.min(exp * 4, 20); // 4pts/yr max 20
  if (isSenior && exp < 3) score = Math.max(score - 8, 0);
  if (isJunior && exp > 2) score = Math.min(score + 4, 20);
  return score;
}

function scoreResumeKeywords(resumeText, jobSkills) {
  if (!resumeText || !jobSkills.length) return 0;
  const resume = resumeText.toLowerCase();
  let hits = 0;
  for (const skill of jobSkills) {
    if (resume.includes(skill)) hits++;
  }
  return Math.min(Math.round((hits / jobSkills.length) * 15), 15);
}

function scoreProjects(bio) {
  if (!bio) return 0;
  const b = bio.toLowerCase();
  const keywords = ['project', 'built', 'developed', 'created', 'launched', 'deployed', 'freelance', 'internship', 'github', 'portfolio'];
  const hits = keywords.filter(k => b.includes(k)).length;
  return Math.min(hits * 2, 10);
}

function scoreCertifications(skills, bio) {
  const combined = ((skills || '') + ' ' + (bio || '')).toLowerCase();
  const certs = ['certified', 'certification', 'aws', 'gcp', 'azure', 'cisco', 'google', 'microsoft', 'oracle', 'pmp', 'scrum', 'agile'];
  const hits = certs.filter(c => combined.includes(c)).length;
  return Math.min(hits * 3, 10);
}

function scoreRecentActivity(totalApps) {
  return Math.min((totalApps || 0) * 2, 5);
}

/**
 * WEIGHTED SMART MATCH — Phase 5
 * Returns { score, breakdown, reason, suggestions }
 *
 * Weights:
 *   Skills match        40 pts
 *   Experience          20 pts
 *   Education           20 pts
 *   Resume keywords     15 pts
 *   Projects/certs      10 pts (bonus can push to 100)
 *   Recent activity      5 pts
 */
export function calcWeightedScore(user, job) {
  const userSkills = parseSkills(user.skills);
  const jobSkills  = parseSkills(Array.isArray(job.skills) ? job.skills.join(',') : job.skills);

  // 1. Skills (0–40)
  let skillMatched = 0;
  for (const jSkill of jobSkills) {
    if (userSkills.some(u => u === jSkill || u.includes(jSkill) || jSkill.includes(u))) skillMatched++;
  }
  const skillScore = jobSkills.length
    ? Math.round((skillMatched / jobSkills.length) * 40)
    : 20;

  // 2. Experience (0–20)
  const expScore = scoreExperience(user.exp, job.title);

  // 3. Education (0–20)
  const eduScore = scoreEducation(user.education || '');

  // 4. Resume keywords (0–15)
  const resumeScore = scoreResumeKeywords(user.resumeText || '', jobSkills);

  // 5. Projects / certs (0–10)
  const projectScore = scoreProjects(user.bio || '') + scoreCertifications(user.skills, user.bio);
  const bonusScore   = Math.min(projectScore, 10);

  // 6. Recent activity (0–5)
  const activityScore = scoreRecentActivity(user.totalApps || 0);

  const raw = skillScore + expScore + eduScore + resumeScore + bonusScore + activityScore;
  const score = Math.min(Math.round(raw), 100);

  // Reason string
  const reasons = [];
  if (skillScore >= 30)  reasons.push(`Strong skill alignment (${skillMatched}/${jobSkills.length} matched)`);
  else if (skillScore >= 15) reasons.push(`Partial skill match (${skillMatched}/${jobSkills.length})`);
  else                   reasons.push(`Low skill overlap — ${jobSkills.length - skillMatched} skills missing`);
  if (expScore >= 15)    reasons.push(`Solid experience (${user.exp} yrs)`);
  if (eduScore >= 14)    reasons.push('Strong educational background');
  if (resumeScore >= 10) reasons.push('Resume keywords align well');
  if (bonusScore >= 6)   reasons.push('Projects/certifications boost profile');

  // Suggestions
  const suggestions = [];
  const missingSkills = jobSkills.filter(j => !userSkills.some(u => u === j || u.includes(j) || j.includes(u)));
  if (missingSkills.length) suggestions.push(`Learn: ${missingSkills.slice(0,3).join(', ')}`);
  if (expScore < 10 && Number(user.exp) < 2) suggestions.push('Add internship/project experience to boost score');
  if (eduScore < 10) suggestions.push('Add your education details in profile');
  if (resumeScore < 5) suggestions.push('Build your resume with skill keywords');
  if (bonusScore < 4) suggestions.push('Add GitHub link or certifications to stand out');

  return {
    score,
    breakdown: { skillScore, expScore, eduScore, resumeScore, bonusScore, activityScore },
    reason: reasons[0] || 'Profile reviewed',
    allReasons: reasons,
    suggestions: suggestions.slice(0, 3),
    missingSkills: missingSkills.slice(0, 5),
    matchedSkills: skillMatched
  };
}

/**
 * Rank jobs using weighted smart scoring.
 * Attaches .weightedScore and .scoreBreakdown to each job.
 */
export function rankJobsWeighted(jobs, user) {
  return jobs
    .map(job => {
      const result = calcWeightedScore(user, job);
      return {
        ...job,
        matchScore:     result.score,       // kept for backward compat
        weightedScore:  result.score,
        scoreBreakdown: result.breakdown,
        matchReason:    result.reason,
        matchSuggestions: result.suggestions,
        missingSkills:  result.missingSkills
      };
    })
    .sort((a, b) => b.weightedScore - a.weightedScore);
}

// =============================================
// 📊 CAREER GAP ANALYSIS ENGINE (Phase 4)
// =============================================

const SKILL_CATEGORIES = {
  'Programming Languages': ['python', 'javascript', 'java', 'c++', 'c#', 'typescript', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'r'],
  'Web Technologies':      ['react', 'angular', 'vue', 'node', 'express', 'html', 'css', 'nextjs', 'nuxt', 'gatsby', 'tailwind', 'bootstrap'],
  'Data & AI':             ['machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit', 'sql', 'power bi', 'tableau'],
  'Cloud & DevOps':        ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'terraform', 'jenkins', 'linux', 'git', 'github'],
  'Databases':             ['mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'sqlite', 'oracle', 'dynamodb'],
  'Mobile':                ['android', 'ios', 'flutter', 'react native', 'swift', 'kotlin', 'xamarin'],
  'Design & PM':           ['figma', 'adobe xd', 'photoshop', 'illustrator', 'agile', 'scrum', 'jira', 'notion', 'product management']
};

const LEARNING_RESOURCES = {
  'python':       'freeCodeCamp, Codecademy',
  'javascript':   'javascript.info, MDN Docs',
  'react':        'React official docs, Scrimba',
  'node':         'Node.js official docs, The Odin Project',
  'sql':          'SQLZoo, Mode Analytics',
  'machine learning': 'Coursera (Andrew Ng), fast.ai',
  'aws':          'AWS Free Tier + Cloud Practitioner',
  'docker':       'Docker Docs, Play with Docker',
  'git':          'GitHub Learning Lab',
  'figma':        'Figma Academy, YouTube'
};

function categorizeSkill(skill) {
  for (const [cat, skills] of Object.entries(SKILL_CATEGORIES)) {
    if (skills.some(s => skill.includes(s) || s.includes(skill))) return cat;
  }
  return 'Other Technologies';
}

function getResourceFor(skill) {
  for (const [key, res] of Object.entries(LEARNING_RESOURCES)) {
    if (skill.includes(key) || key.includes(skill)) return res;
  }
  return 'Google, YouTube, Udemy';
}

export function analyzeCareerGap(user, jobs) {
  const userSkills = parseSkills(user.skills || '');
  const exp        = Number(user.exp) || 0;

  // --- 1. Build skill frequency map from jobs ---
  const skillFreq = {};
  jobs.forEach(job => {
    parseSkills(Array.isArray(job.skills) ? job.skills.join(',') : job.skills)
      .forEach(s => { skillFreq[s] = (skillFreq[s] || 0) + 1; });
  });

  const marketSkills = Object.entries(skillFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([s]) => s);

  // --- 2. Classify user skills ---
  const strongSkills = userSkills.filter(u =>
    marketSkills.slice(0, 15).some(m => m.includes(u) || u.includes(m))
  );
  const weakSkills = userSkills.filter(u => !strongSkills.includes(u));
  const missingSkills = marketSkills
    .filter(m => !userSkills.some(u => u.includes(m) || m.includes(u)))
    .slice(0, 10);

  // --- 3. Market skill match % ---
  const top20 = marketSkills.slice(0, 20);
  const matched20 = userSkills.filter(u =>
    top20.some(m => m.includes(u) || u.includes(m))
  ).length;
  const skillMatchPct = top20.length ? Math.round((matched20 / Math.min(top20.length, 10)) * 100) : 0;

  // --- 4. Career Readiness Score ---
  let score = 0;
  score += Math.min(userSkills.length * 4, 25);     // skills count — max 25
  score += Math.min(exp * 5, 20);                    // experience — max 20
  score += Math.min(skillMatchPct * 0.3, 30);        // market alignment — max 30
  const profileBonus = [user.name, user.email, user.skills, user.exp].filter(Boolean).length;
  score += Math.round((profileBonus / 4) * 15);      // profile completeness — max 15
  score += Math.min(strongSkills.length * 2, 10);    // strong skills bonus
  score = Math.min(Math.round(score), 100);

  // --- 5. Top recommended jobs ---
  const topJobs = rankJobs(jobs, user.skills).filter(j => j.matchScore > 0).slice(0, 6);

  // --- 6. Learning roadmap (grouped by category) ---
  const roadmap = {};
  missingSkills.slice(0, 8).forEach((skill, i) => {
    const cat = categorizeSkill(skill);
    if (!roadmap[cat]) roadmap[cat] = [];
    roadmap[cat].push({
      skill,
      priority: i < 3 ? 'High' : i < 6 ? 'Medium' : 'Low',
      resource: getResourceFor(skill),
      weeks: i < 3 ? '2–4 weeks' : '4–8 weeks'
    });
  });

  // --- 7. Interview Readiness ---
  let interviewScore = 0;
  interviewScore += Math.min(exp * 8, 40);
  interviewScore += Math.min(userSkills.length * 4, 30);
  interviewScore += strongSkills.length >= 3 ? 20 : strongSkills.length * 5;
  interviewScore += score >= 70 ? 10 : score >= 50 ? 5 : 0;
  interviewScore = Math.min(Math.round(interviewScore), 100);

  // --- 8. Personalized suggestions ---
  const suggestions = [];
  if (missingSkills.length > 0) {
    suggestions.push(`📚 Top skill to learn: **${missingSkills[0]}** — appears in ${skillFreq[missingSkills[0]] || 'many'} job${skillFreq[missingSkills[0]] > 1 ? 's' : ''}`);
  }
  if (exp < 1) {
    suggestions.push('💼 No experience? Build 2–3 portfolio projects and add them to your profile');
  } else if (exp < 3) {
    suggestions.push('🚀 With ' + exp + ' yr(s) experience, target mid-level roles and upskill in cloud/frameworks');
  } else {
    suggestions.push('👑 ' + exp + ' years is strong — target senior/lead roles with your skill set');
  }
  if (strongSkills.length < 3) {
    suggestions.push('⚡ Fewer than 3 market-demanded skills — focus on strengthening core technical skills first');
  } else {
    suggestions.push('✅ You have ' + strongSkills.length + ' in-demand skills — keep sharpening and add missing ones');
  }
  if (missingSkills.slice(0, 3).some(s => ['docker', 'aws', 'azure', 'kubernetes'].includes(s))) {
    suggestions.push('☁️ Cloud skills are highly demanded — AWS/GCP free tier certifications can 2x your matches');
  }
  if (score < 40) {
    suggestions.push('🎯 Score is low — complete profile, add more skills, and build resume to improve significantly');
  } else if (score >= 75) {
    suggestions.push('🔥 Excellent profile! Apply to top-match jobs immediately while continuing to learn');
  }

  return {
    score,
    skillMatchPct: Math.min(skillMatchPct, 100),
    strongSkills,
    weakSkills,
    missingSkills,
    topJobs,
    roadmap,
    interviewScore,
    suggestions: suggestions.slice(0, 5),
    marketSkills: marketSkills.slice(0, 15),
    userSkills
  };
}
