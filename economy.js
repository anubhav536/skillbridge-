// =====================================
// 🪙 SkillBridge AI — Career Economy Engine
// =====================================
// Handles: Career Coins, Wallets, Streaks, Missions, Levels, Trust Score
// Anti-fraud: daily cooldowns, once-only events, daily caps, rate limiting

import { db } from "./firebase.js";
import {
  doc, getDoc, setDoc, updateDoc, addDoc,
  collection, getDocs, increment
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// ─────────────────────────────────────────
// 🪙 EARN EVENT DEFINITIONS
// cooldown: 'daily' | 'once' | 'weekly' | 'monthly' | 'always'
// max: max times per cooldown window (for 'daily'/'weekly')
// xp: experience points awarded alongside coins
// ─────────────────────────────────────────
export const EARN_EVENTS = {
  daily_login:          { coins: 10,  xp: 5,   cooldown: 'daily',   max: 1,  label: 'Daily Login',              icon: '📅' },
  profile_complete:     { coins: 50,  xp: 30,  cooldown: 'once',    max: 1,  label: 'Complete Profile',          icon: '👤' },
  skills_added:         { coins: 20,  xp: 15,  cooldown: 'once',    max: 1,  label: 'Skills Added',              icon: '🔧' },
  resume_built:         { coins: 30,  xp: 20,  cooldown: 'once',    max: 1,  label: 'Resume Built',              icon: '📄' },
  job_applied:          { coins: 5,   xp: 3,   cooldown: 'daily',   max: 3,  label: 'Applied to Job',            icon: '🎯' },
  career_gap_analysis:  { coins: 25,  xp: 20,  cooldown: 'once',    max: 1,  label: 'Career Gap Analysis',       icon: '🧠' },
  interview_practice:   { coins: 15,  xp: 10,  cooldown: 'daily',   max: 2,  label: 'Interview Practice',        icon: '🎤' },
  mission_daily:        { coins: 30,  xp: 25,  cooldown: 'daily',   max: 1,  label: 'Daily Mission Complete',    icon: '⚡' },
  mission_career:       { coins: 75,  xp: 60,  cooldown: 'once',    max: 1,  label: 'Career Mission Complete',   icon: '🏆' },
  mission_weekly:       { coins: 100, xp: 80,  cooldown: 'weekly',  max: 1,  label: 'Weekly Challenge Complete', icon: '🔥' },
  streak_7:             { coins: 50,  xp: 40,  cooldown: 'once_per_streak', max: 1, label: '7-Day Streak Bonus', icon: '🌟' },
  streak_30:            { coins: 200, xp: 150, cooldown: 'once_per_streak', max: 1, label: '30-Day Streak Bonus',icon: '👑' },
  referral:             { coins: 100, xp: 50,  cooldown: 'always',  max: 50, label: 'Referral Bonus',            icon: '🤝' },
  first_application:    { coins: 25,  xp: 20,  cooldown: 'once',    max: 1,  label: 'First Application!',        icon: '🚀' },
  profile_bio_added:    { coins: 15,  xp: 10,  cooldown: 'once',    max: 1,  label: 'Bio Added to Profile',      icon: '✍️' },
  education_added:      { coins: 15,  xp: 10,  cooldown: 'once',    max: 1,  label: 'Education Added',           icon: '🎓' },
};

// ─────────────────────────────────────────
// 🛒 SPEND CATALOG
// ─────────────────────────────────────────
export const SPEND_CATALOG = [
  { id: 'resume_boost',     cost: 100, label: 'Resume Boost',         desc: 'Highlight your profile to recruiters for 7 days',  icon: '🚀', category: 'visibility' },
  { id: 'featured_profile', cost: 200, label: 'Featured Profile',     desc: 'Appear at the top of talent searches for 3 days',   icon: '⭐', category: 'visibility' },
  { id: 'priority_app',     cost: 50,  label: 'Priority Application', desc: 'Your application goes to the top of the stack',     icon: '🎯', category: 'applications' },
  { id: 'ai_coach',         cost: 150, label: 'AI Career Coach',      desc: 'Unlock one in-depth AI career coaching session',    icon: '🧠', category: 'ai' },
  { id: 'mock_interview',   cost: 75,  label: 'Mock Interview Credit',desc: 'Unlock a full AI mock interview session',           icon: '🎤', category: 'ai' },
  { id: 'special_badge',    cost: 300, label: 'Verified Badge',       desc: 'Display a verified skill badge on your profile',    icon: '🏅', category: 'reputation' },
  { id: 'theme_pack',       cost: 80,  label: 'Premium Theme',        desc: 'Unlock premium dashboard color themes',             icon: '🎨', category: 'cosmetics' },
];

// ─────────────────────────────────────────
// 📋 MISSION DEFINITIONS
// ─────────────────────────────────────────
export const MISSIONS = {
  // Daily missions (reset each day)
  daily_login_check:   { type: 'daily',  label: 'Log in today',                     xp: 5,   coins: 10,  icon: '📅', difficulty: 'easy' },
  daily_apply:         { type: 'daily',  label: 'Apply to one job today',            xp: 10,  coins: 15,  icon: '🎯', difficulty: 'easy' },
  daily_profile_check: { type: 'daily',  label: 'Review your profile completeness',  xp: 5,   coins: 8,   icon: '👤', difficulty: 'easy' },
  daily_jobs_browse:   { type: 'daily',  label: 'Browse jobs for 60 seconds',        xp: 5,   coins: 8,   icon: '💼', difficulty: 'easy' },

  // Career missions (one-time, milestone-based)
  career_first_app:    { type: 'career', label: 'Submit your first application',     xp: 20,  coins: 25,  icon: '🚀', difficulty: 'easy' },
  career_profile_100:  { type: 'career', label: 'Complete your profile 100%',        xp: 50,  coins: 60,  icon: '💯', difficulty: 'medium' },
  career_resume:       { type: 'career', label: 'Build your resume in Resume Builder',xp: 30, coins: 40,  icon: '📄', difficulty: 'medium' },
  career_gap_analysis: { type: 'career', label: 'Run your AI Career Gap Analysis',   xp: 40,  coins: 50,  icon: '🧠', difficulty: 'medium' },
  career_5_apps:       { type: 'career', label: 'Reach 5 total applications',        xp: 40,  coins: 50,  icon: '📬', difficulty: 'medium' },
  career_10_apps:      { type: 'career', label: 'Reach 10 total applications',       xp: 80,  coins: 100, icon: '🔥', difficulty: 'hard' },
  career_streak_7:     { type: 'career', label: 'Maintain a 7-day login streak',     xp: 60,  coins: 75,  icon: '📆', difficulty: 'hard' },
  career_interview:    { type: 'career', label: 'Practice interview questions',       xp: 30,  coins: 35,  icon: '🎤', difficulty: 'medium' },

  // Weekly challenge
  weekly_apply_3:      { type: 'weekly', label: 'Apply to 3 jobs this week',         xp: 60,  coins: 80,  icon: '⚡', difficulty: 'medium' },
};

// ─────────────────────────────────────────
// 🏅 LEVEL SYSTEM
// ─────────────────────────────────────────
export const LEVELS = [
  { level: 1,  minXp: 0,    label: 'Starter',         icon: '🌱', color: '#6b7280' },
  { level: 2,  minXp: 100,  label: 'Explorer',        icon: '🗺️',  color: '#a78bfa' },
  { level: 3,  minXp: 250,  label: 'Contender',       icon: '⚡',  color: '#818cf8' },
  { level: 4,  minXp: 500,  label: 'Achiever',        icon: '🎯', color: '#4ade80' },
  { level: 5,  minXp: 900,  label: 'Pro Candidate',   icon: '💼', color: '#22d3ee' },
  { level: 6,  minXp: 1400, label: 'Elite Talent',    icon: '🔥', color: '#f59e0b' },
  { level: 7,  minXp: 2100, label: 'Career Master',   icon: '👑', color: '#c4b5fd' },
  { level: 8,  minXp: 3000, label: 'Legend',          icon: '🌟', color: '#fbbf24' },
];

export function calcLevel(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXp) current = l;
  }
  const nextLevel = LEVELS.find(l => l.level === current.level + 1);
  const nextXp    = nextLevel ? nextLevel.minXp : current.minXp;
  const progress  = nextLevel
    ? Math.round(((xp - current.minXp) / (nextXp - current.minXp)) * 100)
    : 100;
  return { ...current, xp, nextXp, progress, nextLevel };
}

// ─────────────────────────────────────────
// 📅 DATE UTILITIES
// ─────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}
function weekStr() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}
function monthStr() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

// ─────────────────────────────────────────
// 🛡️ ANTI-FRAUD COOLDOWN CHECK
// ─────────────────────────────────────────
function canEarn(wallet, eventType) {
  const def = EARN_EVENTS[eventType];
  if (!def) return { allowed: false, reason: 'Unknown event type' };

  const earned     = wallet.earned     || {};
  const dailyCnts  = wallet.dailyCounts|| {};
  const weeklyCnts = wallet.weeklyCounts || {};

  if (def.cooldown === 'once') {
    if (earned[eventType]) return { allowed: false, reason: 'Already earned' };
    return { allowed: true };
  }

  if (def.cooldown === 'daily') {
    const today = todayStr();
    const entry = dailyCnts[eventType] || { count: 0, date: '' };
    const count = entry.date === today ? entry.count : 0;
    if (count >= def.max) return { allowed: false, reason: `Daily limit reached (${def.max}/day)` };
    return { allowed: true, dailyCount: count };
  }

  if (def.cooldown === 'weekly') {
    const week = weekStr();
    const entry = weeklyCnts[eventType] || { count: 0, week: '' };
    const count = entry.week === week ? entry.count : 0;
    if (count >= def.max) return { allowed: false, reason: 'Weekly limit reached' };
    return { allowed: true };
  }

  if (def.cooldown === 'monthly') {
    const month = monthStr();
    const entry = wallet.monthlyCounts?.[eventType] || { count: 0, month: '' };
    if (entry.month === month && entry.count >= def.max) return { allowed: false, reason: 'Monthly limit reached' };
    return { allowed: true };
  }

  if (def.cooldown === 'once_per_streak') {
    const streakKey = `streak_${wallet.streakDays || 0}`;
    if (earned[eventType + '_' + streakKey]) return { allowed: false, reason: 'Already earned for this streak' };
    return { allowed: true };
  }

  // 'always' — always allowed (e.g. referrals up to max ever)
  const totalEarned = wallet.eventCounts?.[eventType] || 0;
  if (totalEarned >= def.max) return { allowed: false, reason: 'Lifetime limit reached' };
  return { allowed: true };
}

// ─────────────────────────────────────────
// 📖 GET / INIT WALLET
// ─────────────────────────────────────────
export async function getWallet(userId) {
  if (!userId) return null;
  const ref  = doc(db, 'wallets', userId);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();

  // Create fresh wallet
  const fresh = {
    balance: 0, totalEarned: 0, totalSpent: 0,
    xp: 0, level: 1,
    streakDays: 0, longestStreak: 0,
    lastLoginDate: null,
    earned: {}, dailyCounts: {}, weeklyCounts: {}, monthlyCounts: {}, eventCounts: {},
    missions: {},
    purchases: [],
    createdAt: Date.now(), updatedAt: Date.now()
  };
  await setDoc(ref, fresh);
  return fresh;
}

// ─────────────────────────────────────────
// 🪙 EARN COINS
// Returns { success, coins, xp, message, newBalance }
// ─────────────────────────────────────────
export async function earnCoins(userId, eventType, metadata = {}) {
  if (!userId || !eventType) return { success: false, message: 'Missing params' };

  const def = EARN_EVENTS[eventType];
  if (!def) return { success: false, message: 'Unknown event' };

  try {
    const wallet = await getWallet(userId);
    const check  = canEarn(wallet, eventType);
    if (!check.allowed) return { success: false, message: check.reason };

    const today   = todayStr();
    const week    = weekStr();
    const month   = monthStr();
    const newBalance = (wallet.balance || 0) + def.coins;
    const newXp      = (wallet.xp || 0) + def.xp;

    // Build update payload
    const updates = {
      balance:      newBalance,
      totalEarned:  (wallet.totalEarned || 0) + def.coins,
      xp:           newXp,
      level:        calcLevel(newXp).level,
      updatedAt:    Date.now(),
    };

    // Cooldown tracking
    if (def.cooldown === 'once') {
      updates[`earned.${eventType}`] = true;
    } else if (def.cooldown === 'daily') {
      const prev  = wallet.dailyCounts?.[eventType] || { count: 0, date: '' };
      const count = prev.date === today ? prev.count + 1 : 1;
      updates[`dailyCounts.${eventType}`] = { count, date: today };
    } else if (def.cooldown === 'weekly') {
      const prev  = wallet.weeklyCounts?.[eventType] || { count: 0, week: '' };
      const count = prev.week === week ? prev.count + 1 : 1;
      updates[`weeklyCounts.${eventType}`] = { count, week };
    } else if (def.cooldown === 'monthly') {
      const prev  = wallet.monthlyCounts?.[eventType] || { count: 0, month: '' };
      const count = prev.month === month ? prev.count + 1 : 1;
      updates[`monthlyCounts.${eventType}`] = { count, month };
    } else if (def.cooldown === 'once_per_streak') {
      const streakKey = `streak_${wallet.streakDays || 0}`;
      updates[`earned.${eventType}_${streakKey}`] = true;
    } else {
      updates[`eventCounts.${eventType}`] = (wallet.eventCounts?.[eventType] || 0) + 1;
    }

    await updateDoc(doc(db, 'wallets', userId), updates);

    // Log transaction
    await addDoc(collection(db, 'wallets', userId, 'transactions'), {
      type: 'earn', amount: def.coins, xp: def.xp,
      reason: def.label, eventType,
      balance: newBalance, timestamp: Date.now(),
      metadata: metadata || {}
    });

    return { success: true, coins: def.coins, xp: def.xp, newBalance, message: def.label };
  } catch(e) {
    console.error('earnCoins error:', e);
    return { success: false, message: 'Server error' };
  }
}

// ─────────────────────────────────────────
// 💸 SPEND COINS
// ─────────────────────────────────────────
export async function spendCoins(userId, spendId) {
  if (!userId || !spendId) return { success: false, message: 'Missing params' };

  const item = SPEND_CATALOG.find(s => s.id === spendId);
  if (!item) return { success: false, message: 'Unknown item' };

  try {
    const wallet = await getWallet(userId);
    if ((wallet.balance || 0) < item.cost) {
      return { success: false, message: `Need ${item.cost - wallet.balance} more coins` };
    }

    const newBalance = wallet.balance - item.cost;
    const purchase   = { id: spendId, label: item.label, cost: item.cost, purchasedAt: Date.now() };

    await updateDoc(doc(db, 'wallets', userId), {
      balance:     newBalance,
      totalSpent:  (wallet.totalSpent || 0) + item.cost,
      purchases:   [...(wallet.purchases || []), purchase],
      updatedAt:   Date.now()
    });

    await addDoc(collection(db, 'wallets', userId, 'transactions'), {
      type: 'spend', amount: -item.cost, reason: item.label,
      spendId, balance: newBalance, timestamp: Date.now()
    });

    return { success: true, item, newBalance };
  } catch(e) {
    console.error('spendCoins error:', e);
    return { success: false, message: 'Server error' };
  }
}

// ─────────────────────────────────────────
// 📅 STREAK + DAILY LOGIN
// Call on every dashboard load
// ─────────────────────────────────────────
export async function checkAndUpdateStreak(userId) {
  if (!userId) return { streakDays: 0, isNew: false };

  try {
    const wallet  = await getWallet(userId);
    const today   = todayStr();
    const last    = wallet.lastLoginDate || '';

    if (last === today) {
      // Already logged in today — no update, still earn if not done
      return { streakDays: wallet.streakDays || 1, isNew: false };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    let newStreak = 1;
    if (last === yStr) {
      newStreak = (wallet.streakDays || 0) + 1; // consecutive
    }

    const longest = Math.max(wallet.longestStreak || 0, newStreak);

    await updateDoc(doc(db, 'wallets', userId), {
      lastLoginDate: today,
      streakDays:    newStreak,
      longestStreak: longest,
      updatedAt:     Date.now()
    });

    // Award daily login coins
    await earnCoins(userId, 'daily_login');

    // Streak milestone bonuses
    if (newStreak === 7)  await earnCoins(userId, 'streak_7');
    if (newStreak === 30) await earnCoins(userId, 'streak_30');

    return { streakDays: newStreak, longestStreak: longest, isNew: true };
  } catch(e) {
    console.error('checkStreak error:', e);
    return { streakDays: 0, isNew: false };
  }
}

// ─────────────────────────────────────────
// 📋 MISSIONS — GET USER STATE
// ─────────────────────────────────────────
export async function getUserMissions(userId, userStats = {}) {
  if (!userId) return { daily: [], career: [], weekly: [] };

  const wallet   = await getWallet(userId);
  const missions = wallet.missions || {};
  const today    = todayStr();
  const week     = weekStr();

  // Build mission status array
  const daily  = [];
  const career = [];
  const weekly = [];

  for (const [id, def] of Object.entries(MISSIONS)) {
    const saved   = missions[id] || {};
    let completed = false;
    let locked    = false;

    if (def.type === 'daily') {
      completed = saved.date === today && saved.completed;
    } else if (def.type === 'career') {
      completed = !!saved.completed;
      // Auto-check career missions from userStats
      if (!completed) {
        if (id === 'career_first_app'   && (userStats.totalApps  || 0) >= 1)  completed = true;
        if (id === 'career_5_apps'      && (userStats.totalApps  || 0) >= 5)  completed = true;
        if (id === 'career_10_apps'     && (userStats.totalApps  || 0) >= 10) completed = true;
        if (id === 'career_resume'      && wallet.earned?.resume_built)        completed = true;
        if (id === 'career_gap_analysis'&& wallet.earned?.career_gap_analysis) completed = true;
        if (id === 'career_profile_100' && (userStats.profilePct || 0) >= 100) completed = true;
        if (id === 'career_streak_7'    && (wallet.longestStreak || 0) >= 7)   completed = true;
      }
    } else if (def.type === 'weekly') {
      completed = saved.week === week && saved.completed;
    }

    const missionObj = { id, ...def, completed, locked };

    if (def.type === 'daily')  daily.push(missionObj);
    if (def.type === 'career') career.push(missionObj);
    if (def.type === 'weekly') weekly.push(missionObj);
  }

  return { daily, career, weekly, wallet };
}

// ─────────────────────────────────────────
// ✅ COMPLETE A MISSION
// ─────────────────────────────────────────
export async function completeMission(userId, missionId) {
  if (!userId || !missionId) return { success: false };

  const def = MISSIONS[missionId];
  if (!def) return { success: false, message: 'Mission not found' };

  try {
    const wallet  = await getWallet(userId);
    const missions = wallet.missions || {};
    const today    = todayStr();
    const week     = weekStr();
    const saved    = missions[missionId] || {};

    // Already completed check
    if (def.type === 'daily'  && saved.date === today && saved.completed)
      return { success: false, message: 'Already completed today' };
    if (def.type === 'career' && saved.completed)
      return { success: false, message: 'Mission already completed' };
    if (def.type === 'weekly' && saved.week === week && saved.completed)
      return { success: false, message: 'Already completed this week' };

    // Save completion
    const missionUpdate = { completed: true, completedAt: Date.now() };
    if (def.type === 'daily')  missionUpdate.date = today;
    if (def.type === 'weekly') missionUpdate.week = week;

    await updateDoc(doc(db, 'wallets', userId), {
      [`missions.${missionId}`]: missionUpdate,
      updatedAt: Date.now()
    });

    // Award coins
    const eventType = def.type === 'daily'  ? 'mission_daily'
                    : def.type === 'weekly' ? 'mission_weekly'
                    : 'mission_career';

    await earnCoins(userId, eventType, { missionId, label: def.label });

    return { success: true, coins: def.coins, xp: def.xp, label: def.label };
  } catch(e) {
    console.error('completeMission error:', e);
    return { success: false, message: 'Server error' };
  }
}

// ─────────────────────────────────────────
// 📊 GET TRANSACTION HISTORY
// ─────────────────────────────────────────
export async function getTransactionHistory(userId, limitCount = 50) {
  if (!userId) return [];
  try {
    const snap = await getDocs(collection(db, 'wallets', userId, 'transactions'));
    const txs  = [];
    snap.forEach(d => txs.push({ id: d.id, ...d.data() }));
    txs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return txs.slice(0, limitCount);
  } catch(e) {
    console.error('getTransactionHistory error:', e);
    return [];
  }
}

// ─────────────────────────────────────────
// 🌡️ TRUST SCORE COMPUTATION
// ─────────────────────────────────────────
export function computeTrustScore(wallet, profilePct = 0, totalApps = 0, successApps = 0) {
  let score = 0;
  score += Math.min(profilePct, 100) * 0.25;               // Profile completeness: 25 pts
  score += Math.min((wallet.streakDays || 0) * 2, 20);      // Streak: up to 20 pts
  score += Math.min((wallet.xp || 0) / 30, 20);             // XP activity: up to 20 pts
  score += Math.min(totalApps * 2, 20);                     // Applications: up to 20 pts
  score += successApps > 0 ? Math.min(successApps * 5, 15) : 0; // Success: up to 15 pts
  return Math.round(Math.min(score, 100));
}

// ─────────────────────────────────────────
// 📈 ADMIN — PLATFORM ECONOMY STATS
// ─────────────────────────────────────────
export async function getPlatformEconomyStats() {
  try {
    const snap = await getDocs(collection(db, 'wallets'));
    let totalCoins = 0, totalEarned = 0, totalSpent = 0, activeWallets = 0;
    const topEarners = [];

    snap.forEach(d => {
      const w = d.data();
      totalCoins  += w.balance      || 0;
      totalEarned += w.totalEarned  || 0;
      totalSpent  += w.totalSpent   || 0;
      if ((w.totalEarned || 0) > 0) {
        activeWallets++;
        topEarners.push({ userId: d.id, balance: w.balance || 0, totalEarned: w.totalEarned || 0, level: w.level || 1, xp: w.xp || 0 });
      }
    });

    topEarners.sort((a, b) => b.totalEarned - a.totalEarned);

    return {
      totalCoins, totalEarned, totalSpent,
      activeWallets, totalWallets: snap.size,
      topEarners: topEarners.slice(0, 10)
    };
  } catch(e) {
    console.error('getPlatformEconomyStats error:', e);
    return { totalCoins: 0, totalEarned: 0, totalSpent: 0, activeWallets: 0, topEarners: [] };
  }
}

// ─────────────────────────────────────────
// 🛡️ ADMIN — AWARD COINS MANUALLY
// ─────────────────────────────────────────
export async function adminAwardCoins(userId, amount, reason) {
  if (!userId || !amount || !reason) return { success: false };
  try {
    const wallet = await getWallet(userId);
    const newBal = (wallet.balance || 0) + amount;
    await updateDoc(doc(db, 'wallets', userId), {
      balance: newBal, totalEarned: (wallet.totalEarned || 0) + amount, updatedAt: Date.now()
    });
    await addDoc(collection(db, 'wallets', userId, 'transactions'), {
      type: 'earn', amount, reason: 'Admin Award: ' + reason,
      eventType: 'admin_award', balance: newBal, timestamp: Date.now()
    });
    return { success: true, newBalance: newBal };
  } catch(e) {
    return { success: false };
  }
}

// ─────────────────────────────────────────
// 🏷️ FORMAT HELPERS
// ─────────────────────────────────────────
export function formatCoins(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n || 0);
}

export function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60000)   return 'Just now';
  if (diff < 3600000) return Math.round(diff / 60000) + 'm ago';
  if (diff < 86400000)return Math.round(diff / 3600000) + 'h ago';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
