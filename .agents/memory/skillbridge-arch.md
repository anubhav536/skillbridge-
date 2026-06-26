---
name: SkillBridge AI Architecture
description: Tech stack decisions, file conventions, and important patterns for this project
---

## Stack
- Vanilla JS ES Modules (`<script type="module">`) — no framework, no bundler, no NPM
- Firebase v12.11.0 via CDN — all imports from `https://www.gstatic.com/firebasejs/12.11.0/...`
- Node.js static server (`server.js`) on port 5000
- html2pdf.js CDN for resume PDF export

## File Conventions
- `firebase.js` — single source of truth for Auth, Firestore, shared utilities (getSession, protectPage, applyJob, updateApplicationStatus, observePlatformAnalytics, startPresenceHeartbeat)
- `ai-match.js` — AI engine; all exports must stay backward compatible when upgrading
- `app-enhancements.js` — loaded at bottom of every dashboard page; injects toast system globally via `window.showToast()`
- `style.css` + `universal.css` — both loaded by every page; purple theme: #7c3aed primary, #4f46e5 secondary
- New files created: `career-gap.html`, `career-gap.js`, `project-report.html`

## Auth Pattern
- `protectPage("role")` redirects unauthorized users to login
- Session stored in localStorage; scoped keys like `appliedJobs:${email}`
- Roles: jobseeker, recruiter, admin, admin_pending

## Firebase Collections
- `users`, `jobs`, `applications`, `presence`, `contacts`

**Why:** Knowing this prevents breaking existing pages when modifying shared modules or adding new features.
