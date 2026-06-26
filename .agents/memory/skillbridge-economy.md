---
name: SkillBridge Career Economy
description: Career Coins economy engine, Firestore wallet structure, anti-fraud system, pages built, coin triggers wired.
---

## Core Engine: economy.js
Exports: `EARN_EVENTS`, `SPEND_CATALOG`, `MISSIONS`, `LEVELS`, `calcLevel()`, `getWallet()`, `earnCoins()`, `spendCoins()`, `checkAndUpdateStreak()`, `getUserMissions()`, `completeMission()`, `getTransactionHistory()`, `computeTrustScore()`, `getPlatformEconomyStats()`, `adminAwardCoins()`, `formatCoins()`, `formatTime()`

## Firestore Wallet Structure
`wallets/{userId}` document:
```
{ balance, totalEarned, totalSpent, xp, level, streakDays, longestStreak, lastLoginDate,
  earned: { [eventType]: true },          // for 'once' cooldowns
  dailyCounts: { [eventType]: { count, date } },
  weeklyCounts: { [eventType]: { count, week } },
  monthlyCounts: { [eventType]: { count, month } },
  eventCounts: { [eventType]: number },   // for 'always' type with lifetime max
  missions: { [missionId]: { completed, completedAt, date?, week? } },
  purchases: [ { id, label, cost, purchasedAt } ],
  updatedAt }
```
`wallets/{userId}/transactions/{txId}` subcollection:
```
{ type: 'earn'|'spend', amount, xp?, reason, eventType?, balance, timestamp, metadata? }
```

## Anti-Fraud Cooldown System
Cooldown types encoded in `EARN_EVENTS[eventType].cooldown`:
- `'once'` — stored in `earned[eventType]: true`, never repeatable
- `'daily'` — stored in `dailyCounts[eventType] = { count, date }`, resets each calendar day
- `'weekly'` — stored in `weeklyCounts[eventType] = { count, week }`, week = monday ISO date
- `'monthly'` — stored in `monthlyCounts[eventType]`
- `'once_per_streak'` — stored as `earned[eventType_streak_N]: true`
- `'always'` — tracked via `eventCounts[eventType]`, up to lifetime `max`

**Why:** Prevents reward farming, fake referrals, and rapid-click abuse without any backend or cloud function.

## Pages Built / Updated
New pages:
- `js-wallet.html` — Balance hero, XP ring, streak, transaction history, spend catalog, earn guide
- `js-missions.html` — Daily / Career / Weekly missions with claim button and live progress
- `admin-economy.html` — Economy stats, top earners, award coins form, economy controls toggles, recent tx monitor

Updated pages:
- `js-dashboard.html` — Economy banner (coins/level/streak/trust), missions preview strip, streak bar, economy imports
- All JS page sidebars — Added `🪙 Wallet` and `⚡ Missions` links to: js-jobs, js-applications, js-analytics, career-gap, js-profile, js-apply
- `admin-dashboard.html` — Added Economy to sidebar nav + quick-actions grid
- `js-apply.html` — earnCoins('job_applied') + earnCoins('first_application') triggered on successful apply
- `career-gap.js` — earnCoins('career_gap_analysis') triggered after analysis runs

## Economy Controls
Admin can toggle controls via `economy_config/controls` Firestore doc:
`daily_login_enabled`, `streak_bonus_enabled`, `mission_rewards_enabled`, `spend_enabled`, `anti_fraud_enabled`

## Key Rules
- `earnCoins()` always reads wallet first, checks cooldown, then writes atomically with transaction log
- `checkAndUpdateStreak()` is called fire-and-forget on dashboard load — it only awards once per day
- `spendCoins()` validates balance >= cost before writing
- All coin operations fail silently on dashboard (try/catch) so the main page never breaks
