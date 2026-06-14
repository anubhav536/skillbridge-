// =============================================
// 🤖 SkillBridge AI — AI Job Matching Engine
// =============================================

/**
 * Normalise a skills string or array into a clean lowercase array.
 */
export function parseSkills(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : raw.split(/[,、;\/|]+/);
  return arr
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Calculate match score (0–100) between user skills and job skills.
 * Uses token overlap + partial substring matching for fuzzy results.
 */
export function calcMatchScore(userSkillsRaw, jobSkillsRaw) {
  const userSkills = parseSkills(userSkillsRaw);
  const jobSkills  = parseSkills(jobSkillsRaw);

  if (!jobSkills.length) return 50; // no requirements = open role
  if (!userSkills.length) return 0;

  let matched = 0;

  for (const jSkill of jobSkills) {
    const hit = userSkills.some(uSkill =>
      uSkill === jSkill ||
      uSkill.includes(jSkill) ||
      jSkill.includes(uSkill)
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

  const matched = [];
  const missing = [];

  for (const jSkill of jobSkills) {
    const hit = userSkills.some(uSkill =>
      uSkill === jSkill ||
      uSkill.includes(jSkill) ||
      jSkill.includes(uSkill)
    );
    if (hit) matched.push(jSkill);
    else     missing.push(jSkill);
  }

  return { matched, missing };
}

/**
 * Sort jobs by match score descending.
 * Attaches `.matchScore` to each job object.
 */
export function rankJobs(jobs, userSkills) {
  return jobs
    .map(job => ({
      ...job,
      matchScore: calcMatchScore(userSkills, job.skills)
    }))
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

  // Profile: skills count (up to 35pts)
  score += Math.min(parsedSkills.length * 5, 35);

  // Profile: experience (up to 15pts)
  const expNum = Number(exp) || 0;
  score += Math.min(expNum * 3, 15);

  // Activity: applications (up to 25pts)
  score += Math.min(totalApps * 5, 25);

  // Success: shortlisted/hired (up to 25pts)
  const successRate = totalApps ? (successApps / totalApps) : 0;
  score += Math.round(successRate * 25);

  return Math.min(score, 100);
}
