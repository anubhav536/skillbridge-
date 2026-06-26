---
name: SkillBridge AI Matching Engine
description: How ai-match.js works — backward compat rules, scoring weights, career gap algorithm
---

## Backward-Compatible Exports (never remove)
`parseSkills`, `calcMatchScore`, `getSkillGap`, `rankJobs`, `matchLabel`, `calcEmployabilityScore`

## New Weighted Engine (Phase 5)
`calcWeightedScore(user, job)` → returns `{ score, breakdown, reason, suggestions, missingSkills, matchedSkills }`

Weight distribution (max 100):
- Skills match: 40 pts (job skills vs parsed user skills)
- Experience: 20 pts (4pts/yr, adjusted for senior/junior job titles)
- Education: 20 pts (PhD/MBA=20, BTech/BE=14, Diploma=7)
- Resume keywords: 15 pts (job skills found in user.resumeText)
- Projects/Certs: 10 pts (bio keywords + cert keywords)
- Recent activity: 5 pts (totalApps × 2)

`rankJobsWeighted(jobs, user)` — attaches `.weightedScore`, `.matchScore` (same), `.matchReason`, `.missingSkills`

## Career Gap Analysis (Phase 4)
`analyzeCareerGap(user, jobs)` — no external API, pure JS:
- Builds skill frequency map from all jobs
- Classifies user skills into Strong (in top 15 market), Weak (not in demand), Missing (top market skills absent from user)
- Career Readiness Score: skills count (25) + exp (20) + skill market match (30) + profile completeness (15) + strong skills bonus (10)
- Returns: score, skillMatchPct, strongSkills, weakSkills, missingSkills, topJobs, roadmap (by category), interviewScore, suggestions

**Why:** Both old (calcMatchScore) and new (calcWeightedScore) must coexist. Old is used by quick apply flows; new is used by recruiter ranking and career gap page.
