if (!localStorage.getItem("student")) {
  localStorage.setItem("student", JSON.stringify({
    name: "Demo",
    skills: "html"
  }));
}

let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
let applied = JSON.parse(localStorage.getItem("applied")) || [];
let currentUser = {};

function login() {
  let role = document.getElementById("role").value;
  let username = document.getElementById("username").value;
  
  currentUser = { role, username };
  
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("app").style.display = "block";
  
  if (role === "student") {
    document.getElementById("studentPanel").style.display = "block";
    document.getElementById("recruiterPanel").style.display = "none";
    displayJobs();
    displayApplied();
  } else {
    document.getElementById("studentPanel").style.display = "none";
    document.getElementById("recruiterPanel").style.display = "block";
    displayApplicants();
  }
}

function postJob() {
  let title = document.getElementById("jobTitle").value;
  let desc = document.getElementById("jobDesc").value;
  
  jobs.push({ title, desc });
  localStorage.setItem("jobs", JSON.stringify(jobs));
  
  alert("Job Posted!");
}

function displayJobs() {
  let list = document.getElementById("jobList");
  list.innerHTML = "";
  
  jobs.forEach((job, index) => {
    let li = document.createElement("li");
    
    let match = matchSkill(job.title);
    
    li.innerHTML = `${job.title} - ${job.desc} ${match}
    <button onclick="applyJob(${index})">Apply</button>`;
    
    list.appendChild(li);
  });
}

function applyJob(index) {
  applied.push({
    user: currentUser.username,
    job: jobs[index].title,
    status: "Pending"
  });
  
  localStorage.setItem("applied", JSON.stringify(applied));
  displayApplied();
}

function displayApplied() {
  let list = document.getElementById("appliedJobs");
  list.innerHTML = "";
  
  applied
    .filter(a => a.user === currentUser.username)
    .forEach(a => {
      let li = document.createElement("li");
      li.innerHTML = `${a.job} - ${a.status}`;
      list.appendChild(li);
    });
}

function displayApplicants() {
  let list = document.getElementById("applicants");
  list.innerHTML = "";
  
  applied.forEach((a, i) => {
    let li = document.createElement("li");
    li.innerHTML = `
      ${a.user} → ${a.job} (${a.status})
      <button onclick="updateStatus(${i}, 'Selected')">✔</button>
      <button onclick="updateStatus(${i}, 'Rejected')">❌</button>
    `;
    list.appendChild(li);
  });
}

function updateStatus(index, newStatus) {
  applied[index].status = newStatus;
  localStorage.setItem("applied", JSON.stringify(applied));
  displayApplicants();
}

function matchSkill(title) {
  let student = JSON.parse(localStorage.getItem("student"));
  
  if (!student || !student.skills) return "";
  
  if (title.toLowerCase().includes(student.skills.toLowerCase())) {
    return "🔥 Match!";
  }
  
  return "";
}
function searchJobs() {
  let query = document.getElementById("search").value.toLowerCase();

  let list = document.getElementById("jobList");
  list.innerHTML = "";

  jobs
    .filter(job => job.title.toLowerCase().includes(query))
    .forEach((job, index) => {
      let li = document.createElement("li");
      li.innerHTML = `${job.title} - ${job.desc}
      <button onclick="applyJob(${index})">Apply</button>`;
      list.appendChild(li);
    });
}
function updateStatus(index, newStatus) {
  applied[index].status = newStatus;
  localStorage.setItem("applied", JSON.stringify(applied));

  alert(`Status updated to ${newStatus}`);
  displayApplicants();
}
function getTopStudent() {
  let counts = {};

  applied.forEach(a => {
    counts[a.user] = (counts[a.user] || 0) + 1;
  });

  let top = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "");

  return top;
}
function showStats() {
  let totalJobs = jobs.length;
  let totalApps = applied.length;

  alert(`Jobs: ${totalJobs} | Applications: ${totalApps}`);
}
function logout() {
  location.reload();
}