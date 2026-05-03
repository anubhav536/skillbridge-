import { db } from "./firebase.js";
import {
  doc,
  setDoc,
  addDoc,
  collection
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

async function setupDatabase(){

  // 🚨 FLAGS
  await addDoc(collection(db, "flags"), {
    userEmail: "user@gmail.com",
    reason: "Multiple accounts",
    status: "pending",
    createdAt: Date.now()
  });

  // 📩 NOTIFICATIONS
  await addDoc(collection(db, "notifications"), {
    title: "New Jobs Available",
    message: "Check now",
    audience: "all",
    status: "sent",
    createdAt: Date.now()
  });

  // 📜 LOGS
  await addDoc(collection(db, "logs"), {
    action: "User Deleted",
    user: "admin@gmail.com",
    status: "success",
    time: "10:30 AM",
    createdAt: Date.now()
  });

  // ⚙️ SETTINGS (fixed doc)
  await setDoc(doc(db, "settings", "main"), {
    allowSignup: true,
    jobPosting: true,
    fraudDetection: true,
    maintenanceMode: false
  });

  // 🏆 LEADERBOARD
  await addDoc(collection(db, "leaderboard"), {
    name: "Anubhav",
    role: "jobseeker",
    score: 980,
    createdAt: Date.now()
  });

  // 🤖 AI CONFIG (fixed doc)
  await setDoc(doc(db, "aiConfig", "config"), {
    experienceWeight: 50,
    skillsWeight: 70,
    educationWeight: 40,
    fraudSensitivity: 60,
    minMatch: 70
  });

  // 📊 ANALYTICS
  await addDoc(collection(db, "analytics"), {
    totalUsers: 100,
    totalJobs: 50,
    applications: 200
  });

  // 🛠 MODERATION
  await addDoc(collection(db, "moderation"), {
    type: "user",
    targetId: "userId",
    action: "ban",
    reason: "spam",
    createdAt: Date.now()
  });

  console.log("🔥 All collections created successfully!");
}

setupDatabase();