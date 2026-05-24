import { db } from "./firebase.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

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

watchCount("users", (count) => {
  setText("liveUsersCount", `${count.toLocaleString()}+`);
  setText("aboutLiveUsers", `${count.toLocaleString()}+`);
});

watchCount("jobs", (count) => {
  setText("liveJobsCount", `${count.toLocaleString()}+`);
});

watchCount("applications", (count) => {
  setText("liveApplicationsCount", `${count.toLocaleString()}+`);
  const supportRate = count > 0 ? Math.min(99, 85 + Math.floor(count / 50)) : 85;
  setText("contactSupportRate", `${supportRate}%`);
});

watchCount("contacts", (count) => {
  setText("contactUsersHelped", `${count.toLocaleString()}+`);
});
