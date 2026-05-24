import { db } from "./firebase.js";
import { collection, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function watchCount(collectionName, formatter) {
  const colRef = collection(db, collectionName);
  onSnapshot(colRef, (snap) => {
    const count = snap.size;
    formatter(count);
  }, (error) => {
    console.error(`Live count failed for ${collectionName}`, error);
  });
}

const POSITIVE_KEYWORDS = [
  "good", "great", "awesome", "excellent", "helpful", "amazing", "best", "fast", "quick",
  "thank", "love", "nice", "smooth", "easy", "internship", "job", "selected", "happy"
];

function isPositiveMessage(text) {
  const value = (text || "").toLowerCase();
  return value.length > 10 && POSITIVE_KEYWORDS.some((word) => value.includes(word));
}

function toMainPoint(text) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  const firstChunk = clean.split(/[.!?]/).find((part) => part.trim().length > 0) || clean;
  return firstChunk.slice(0, 100).trim();
}

function renderTestimonials(targetId, entries) {
  const el = document.getElementById(targetId);
  if (!el) return;

  if (!entries.length) {
    el.innerHTML = "<p>No positive feedback yet. Your message can be the first one 🚀</p>";
    return;
  }

  el.innerHTML = entries.map((item) => {
    const safeName = (item.name || "Anonymous").replace(/[<>]/g, "");
    const safePoint = toMainPoint(item.message).replace(/[<>]/g, "");
    return `<div class="card"><p>“${safePoint}.”</p><p class="muted mt">- ${safeName}</p></div>`;
  }).join("");
}

function watchTestimonials() {
  const contactsQuery = query(collection(db, "contacts"), orderBy("createdAt", "desc"), limit(40));

  onSnapshot(contactsQuery, (snap) => {
    const positive = snap.docs
      .map((doc) => doc.data())
      .filter((item) => isPositiveMessage(item.message))
      .slice(0, 3);

    renderTestimonials("liveTestimonials", positive);
    renderTestimonials("aboutLiveTestimonials", positive);
  }, (error) => {
    console.error("Live testimonials failed", error);
  });
}

watchCount("users", (count) => {
  setText("liveUsersCount", `${count.toLocaleString()}+`);
  setText("aboutLiveUsers", `${count.toLocaleString()}+`);
});

watchCount("jobs", (count) => {
  setText("liveJobsCount", `${count.toLocaleString()}+`);
  setText("aboutLiveJobs", `${count.toLocaleString()}+`);
});

watchCount("applications", (count) => {
  setText("liveApplicationsCount", `${count.toLocaleString()}+`);
  setText("aboutLiveApplications", `${count.toLocaleString()}+`);
  setText("contactSupportRate", `${count.toLocaleString()}+`);
});

watchCount("contacts", (count) => {
  setText("contactUsersHelped", `${count.toLocaleString()}+`);
  setText("contactLiveMessages", `${count.toLocaleString()}+`);
  setText("aboutLiveContacts", `${count.toLocaleString()}+`);
});

watchTestimonials();
