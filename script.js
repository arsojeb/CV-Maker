const accentColors = [
  { name: "Gold", hex: "#d4a843" },
  { name: "Copper", hex: "#c47a5a" },
  { name: "Slate", hex: "#5a7a8a" },
  { name: "Forest", hex: "#4a8a5a" },
  { name: "Wine", hex: "#8a4a5a" },
  { name: "Navy", hex: "#3a5a8a" },
  { name: "Charcoal", hex: "#4a4a4a" },
  { name: "Rose", hex: "#b06080" },
];
const sectionOrder = [
  { id: "summary", label: "Career Objective", icon: "fa-bullseye" },
  { id: "experience", label: "Experience", icon: "fa-briefcase" },
  { id: "education", label: "Education", icon: "fa-graduation-cap" },
  { id: "languages", label: "Languages", icon: "fa-language" },
  { id: "skills", label: "Skills", icon: "fa-star" },
  { id: "projects", label: "Projects", icon: "fa-folder-open" },
  { id: "certifications", label: "Certifications", icon: "fa-certificate" },
];
let state = {
  template: "executive",
  font: "professional",
  // FIX #2: default accent now matches the swatch renderColorSwatches()
  // marks as active on load (accentColors[0]), instead of an arbitrary
  // hex that didn't correspond to any swatch.
  accent: accentColors[0].hex,
  photo: null,
  sections: sectionOrder.map((s, i) => ({ ...s, visible: true, order: i })),
  experience: [],
  education: [],
  languages: [],
  skills: [],
  projects: [],
  certifications: [],
};

function ensureLanguageSection() {
  if (!Array.isArray(state.sections)) state.sections = [];
  let lang = state.sections.find((s) => s.id === "languages");
  if (!lang) {
    const maxOrder = state.sections.reduce(
      (m, s) => Math.max(m, Number(s.order) || 0),
      -1,
    );
    lang = {
      id: "languages",
      label: "Languages",
      icon: "fa-language",
      visible: true,
      order: maxOrder + 1,
    };
    state.sections.push(lang);
    // FIX #1: the "force visible when languages exist" correction below
    // used to run unconditionally on every call (i.e. on every single
    // updatePreview()), which meant toggling the Languages section off
    // was immediately undone on the next render. It's now scoped to
    // only the moment the section is created/missing (e.g. migrating
    // older imported data), so a user's explicit visibility choice
    // sticks afterwards.
    if (
      Array.isArray(state.languages) &&
      state.languages.some((l) => l && String(l.name || "").trim())
    ) {
      lang.visible = true;
    }
  }
}

function init() {
  ensureLanguageSection();
  renderColorSwatches();
  renderSectionManager();
  updatePreview();
}
function renderColorSwatches() {
  document.getElementById("colorRow").innerHTML = accentColors
    .map(
      (c, i) =>
        `<div class="color-swatch${c.hex === state.accent ? " active" : ""}" style="background:${c.hex}" data-color="${c.hex}" title="${c.name}" onclick="selectColor('${c.hex}',this)"></div>`,
    )
    .join("");
}
function selectColor(hex, el) {
  state.accent = hex;
  document
    .querySelectorAll(".color-swatch")
    .forEach((s) => s.classList.remove("active"));
  el.classList.add("active");
  updatePreview();
}
function selectTemplate(tpl, el) {
  state.template = tpl;
  document
    .querySelectorAll(".template-option")
    .forEach((o) => o.classList.remove("active"));
  el.classList.add("active");
  updatePreview();
}
function selectFont(font, el) {
  state.font = font;
  document
    .querySelectorAll(".font-option")
    .forEach((o) => o.classList.remove("active"));
  el.classList.add("active");
  updatePreview();
}
function toggleSection(header) {
  header.closest(".form-section").classList.toggle("collapsed");
}

function renderSectionManager() {
  const c = document.getElementById("sectionManager");
  const sorted = [...state.sections].sort(
    (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
  );
  // FIX: styles.css defines a .btn-icon:disabled state for exactly this
  // case, but it was never wired up — the top item's "move up" and the
  // bottom item's "move down" buttons looked identical to every other
  // arrow button while silently doing nothing (moveSection() just
  // returns early past the array bounds).
  c.innerHTML = sorted
    .map(
      (s, i) =>
        `<div class="section-manager-item"><i class="fa-solid ${s.icon}" style="color:var(--accent);font-size:11px"></i><span class="sm-name">${s.label}</span><div class="sm-arrows"><button class="btn-icon" onclick="moveSection('${s.id}',-1)"${i === 0 ? " disabled" : ""}><i class="fa-solid fa-chevron-up"></i></button><button class="btn-icon" onclick="moveSection('${s.id}',1)"${i === sorted.length - 1 ? " disabled" : ""}><i class="fa-solid fa-chevron-down"></i></button></div><button class="toggle-switch${s.visible ? " active" : ""}" onclick="toggleSectionVisibility('${s.id}',this)"></button></div>`,
    )
    .join("");
}
function moveSection(id, dir) {
  const sorted = [...state.sections].sort(
    (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
  );
  const idx = sorted.findIndex((s) => s.id === id);
  const si = idx + dir;
  if (si < 0 || si >= sorted.length) return;
  const tmp = sorted[idx].order;
  sorted[idx].order = sorted[si].order;
  sorted[si].order = tmp;
  renderSectionManager();
  updatePreview();
}
function toggleSectionVisibility(id, el) {
  const sec = state.sections.find((s) => s.id === id);
  sec.visible = !sec.visible;
  el.classList.toggle("active");
  updatePreview();
}

function handlePhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast("Image must be under 2MB");
    return;
  }
  const reader = new FileReader();
  reader.onload = function (ev) {
    state.photo = ev.target.result;
    document.getElementById("photoPreview").innerHTML =
      `<img src="${ev.target.result}" alt="Photo" />`;
    updatePreview();
  };
  reader.readAsDataURL(file);
}

function addEntry(type) {
  if (type === "experience") {
    state.experience.push({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    renderExperienceEntries();
  } else if (type === "education") {
    state.education.push({
      degree: "",
      institution: "",
      startDate: "",
      endDate: "",
      grade: "",
      field: "",
      description: "",
    });
    renderEducationEntries();
  } else if (type === "languages") {
    state.languages.push({ name: "", level: "Intermediate" });
    ensureLanguageSection();
    renderLanguageEntries();
  } else if (type === "projects") {
    state.projects.push({ title: "", tech: "", link: "", description: "" });
    renderProjectEntries();
  } else if (type === "certifications") {
    state.certifications.push({ name: "", issuer: "", date: "", id: "" });
    renderCertEntries();
  }
  updatePreview();
}
function removeEntry(type, idx) {
  if (type === "experience") {
    state.experience.splice(idx, 1);
    renderExperienceEntries();
  } else if (type === "education") {
    state.education.splice(idx, 1);
    renderEducationEntries();
  } else if (type === "languages") {
    state.languages.splice(idx, 1);
    renderLanguageEntries();
  } else if (type === "projects") {
    state.projects.splice(idx, 1);
    renderProjectEntries();
  } else if (type === "certifications") {
    state.certifications.splice(idx, 1);
    renderCertEntries();
  }
  updatePreview();
}

/* Helper: build dash list HTML from multiline text */
function buildDashList(text) {
  if (!text) return "";
  const lines = text.split("\n").filter((l) => l.trim());
  if (!lines.length) return "";
  let h = `<ul class="cv-detail-list">`;
  lines.forEach((line) => {
    h += `<li>${esc(line.trim())}</li>`;
  });
  h += `</ul>`;
  return h;
}

function renderExperienceEntries() {
  const list = document.getElementById("experienceList");
  document.getElementById("expCount").textContent = state.experience.length
    ? state.experience.length +
      " entr" +
      (state.experience.length > 1 ? "ies" : "y")
    : "No entries yet";
  list.innerHTML = state.experience
    .map(
      (e, i) => `
          <div class="entry-block">
            <button class="btn btn-danger btn-sm remove-entry" onclick="removeEntry('experience',${i})"><i class="fa-solid fa-trash"></i></button>
            <div class="form-grid">
              <div class="field-group full"><label class="field-label">Job Title</label><input class="field-input" type="text" value="${esc(e.title)}" placeholder="Software Engineer" oninput="state.experience[${i}].title=this.value;updatePreview()" /></div>
              <div class="field-group full"><label class="field-label">Company</label><input class="field-input" type="text" value="${esc(e.company)}" placeholder="Google" oninput="state.experience[${i}].company=this.value;updatePreview()" /></div>
              <div class="field-group"><label class="field-label">Start Date</label><input class="field-input" type="text" value="${esc(e.startDate)}" placeholder="Jan 2020" oninput="state.experience[${i}].startDate=this.value;updatePreview()" /></div>
              <div class="field-group"><label class="field-label">End Date</label><input class="field-input" type="text" value="${esc(e.endDate)}" placeholder="Present" oninput="state.experience[${i}].endDate=this.value;updatePreview()" /></div>
              <div class="field-group full"><label class="field-label">Additional Details</label><textarea class="field-textarea" placeholder="One detail per line, e.g.:&#10;Led a team of 12 engineers across 3 time zones&#10;Reduced API latency by 40% through caching optimization&#10;Migrated monolith to microservices architecture" oninput="state.experience[${i}].description=this.value;updatePreview()">${esc(e.description)}</textarea></div>
            </div>
          </div>`,
    )
    .join("");
}

function renderEducationEntries() {
  const list = document.getElementById("educationList");
  document.getElementById("eduCount").textContent = state.education.length
    ? state.education.length +
      " entr" +
      (state.education.length > 1 ? "ies" : "y")
    : "No entries yet";
  list.innerHTML = state.education
    .map(
      (e, i) => `
          <div class="entry-block">
            <button class="btn btn-danger btn-sm remove-entry" onclick="removeEntry('education',${i})"><i class="fa-solid fa-trash"></i></button>
            <div class="form-grid">
              <div class="field-group full"><label class="field-label">Degree / Certificate</label><input class="field-input" type="text" value="${esc(e.degree)}" placeholder="Bachelor of Science" oninput="state.education[${i}].degree=this.value;updatePreview()" /></div>
              <div class="field-group full"><label class="field-label">Institution</label><input class="field-input" type="text" value="${esc(e.institution)}" placeholder="MIT" oninput="state.education[${i}].institution=this.value;updatePreview()" /></div>
              <div class="field-group"><label class="field-label">Field of Study</label><input class="field-input" type="text" value="${esc(e.field)}" placeholder="Computer Science" oninput="state.education[${i}].field=this.value;updatePreview()" /></div>
              <div class="field-group"><label class="field-label">Grade / GPA</label><input class="field-input" type="text" value="${esc(e.grade)}" placeholder="3.9 / 4.0" oninput="state.education[${i}].grade=this.value;updatePreview()" /></div>
              <div class="field-group"><label class="field-label">Start Date</label><input class="field-input" type="text" value="${esc(e.startDate)}" placeholder="Sep 2016" oninput="state.education[${i}].startDate=this.value;updatePreview()" /></div>
              <div class="field-group"><label class="field-label">End Date</label><input class="field-input" type="text" value="${esc(e.endDate)}" placeholder="Jun 2020" oninput="state.education[${i}].endDate=this.value;updatePreview()" /></div>
              <div class="field-group full"><label class="field-label">Additional Details</label><textarea class="field-textarea" placeholder="One detail per line, e.g.:&#10;Relevant Coursework: Algorithms, Databases&#10;Dean's List 2018-2020" oninput="state.education[${i}].description=this.value;updatePreview()">${esc(e.description)}</textarea></div>
            </div>
          </div>`,
    )
    .join("");
}

function renderLanguageEntries() {
  const list = document.getElementById("languagesList");
  document.getElementById("langCount").textContent = state.languages.length
    ? state.languages.length +
      " entr" +
      (state.languages.length > 1 ? "ies" : "y")
    : "No entries yet";
  list.innerHTML = state.languages
    .map(
      (e, i) => `
          <div class="entry-block">
            <button class="btn btn-danger btn-sm remove-entry" onclick="removeEntry('languages',${i})"><i class="fa-solid fa-trash"></i></button>
            <div class="form-grid">
              <div class="field-group"><label class="field-label">Language</label><input class="field-input" type="text" value="${esc(e.name)}" placeholder="English" oninput="state.languages[${i}].name=this.value;updatePreview()" /></div>
              <div class="field-group"><label class="field-label">Proficiency</label><select class="field-select" onchange="state.languages[${i}].level=this.value;updatePreview()">
                <option value="Native"${e.level === "Native" ? " selected" : ""}>Native</option>
                <option value="Fluent"${e.level === "Fluent" ? " selected" : ""}>Fluent</option>
                <option value="Advanced"${e.level === "Advanced" ? " selected" : ""}>Advanced</option>
                <option value="Intermediate"${e.level === "Intermediate" ? " selected" : ""}>Intermediate</option>
                <option value="Basic"${e.level === "Basic" ? " selected" : ""}>Basic</option>
              </select></div>
            </div>
          </div>`,
    )
    .join("");
}

function renderProjectEntries() {
  const list = document.getElementById("projectsList");
  document.getElementById("projCount").textContent = state.projects.length
    ? state.projects.length +
      " entr" +
      (state.projects.length > 1 ? "ies" : "y")
    : "No entries yet";
  list.innerHTML = state.projects
    .map(
      (e, i) => `
          <div class="entry-block">
            <button class="btn btn-danger btn-sm remove-entry" onclick="removeEntry('projects',${i})"><i class="fa-solid fa-trash"></i></button>
            <div class="form-grid">
              <div class="field-group full"><label class="field-label">Project Name</label><input class="field-input" type="text" value="${esc(e.title)}" placeholder="Open Source CLI Tool" oninput="state.projects[${i}].title=this.value;updatePreview()" /></div>
              <div class="field-group"><label class="field-label">Tech Stack</label><input class="field-input" type="text" value="${esc(e.tech)}" placeholder="React, Node.js" oninput="state.projects[${i}].tech=this.value;updatePreview()" /></div>
              <div class="field-group"><label class="field-label">Link</label><input class="field-input" type="text" value="${esc(e.link)}" placeholder="github.com/..." oninput="state.projects[${i}].link=this.value;updatePreview()" /></div>
              <div class="field-group full"><label class="field-label">Additional Details</label><textarea class="field-textarea" placeholder="One detail per line, e.g.:&#10;Built real-time collaboration engine&#10;Achieved 10k+ daily active users&#10;Open-sourced with 500+ GitHub stars" oninput="state.projects[${i}].description=this.value;updatePreview()">${esc(e.description)}</textarea></div>
            </div>
          </div>`,
    )
    .join("");
}

function renderCertEntries() {
  const list = document.getElementById("certificationsList");
  document.getElementById("certCount").textContent = state.certifications.length
    ? state.certifications.length +
      " entr" +
      (state.certifications.length > 1 ? "ies" : "y")
    : "No entries yet";
  list.innerHTML = state.certifications
    .map(
      (e, i) => `
          <div class="entry-block">
            <button class="btn btn-danger btn-sm remove-entry" onclick="removeEntry('certifications',${i})"><i class="fa-solid fa-trash"></i></button>
            <div class="form-grid">
              <div class="field-group full"><label class="field-label">Certification Name</label><input class="field-input" type="text" value="${esc(e.name)}" placeholder="AWS Solutions Architect" oninput="state.certifications[${i}].name=this.value;updatePreview()" /></div>
              <div class="field-group"><label class="field-label">Issuer</label><input class="field-input" type="text" value="${esc(e.issuer)}" placeholder="Amazon" oninput="state.certifications[${i}].issuer=this.value;updatePreview()" /></div>
              <div class="field-group"><label class="field-label">Date</label><input class="field-input" type="text" value="${esc(e.date)}" placeholder="Mar 2023" oninput="state.certifications[${i}].date=this.value;updatePreview()" /></div>
              <div class="field-group full"><label class="field-label">Credential ID</label><input class="field-input" type="text" value="${esc(e.id)}" placeholder="ABC-123" oninput="state.certifications[${i}].id=this.value;updatePreview()" /></div>
            </div>
          </div>`,
    )
    .join("");
}

function handleSkillKey(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addSkill();
  }
}
function addSkill() {
  const input = document.getElementById("skillInput");
  const val = input.value.trim();
  if (!val) return;
  if (state.skills.includes(val)) {
    showToast("Skill already added");
    return;
  }
  state.skills.push(val);
  input.value = "";
  renderSkills();
  updatePreview();
}
function removeSkill(idx) {
  state.skills.splice(idx, 1);
  renderSkills();
  updatePreview();
}
function renderSkills() {
  const tags = document.getElementById("skillsTags");
  document.getElementById("skillsCount").textContent = state.skills.length
    ? state.skills.length + " skill" + (state.skills.length > 1 ? "s" : "")
    : "No skills yet";
  tags.innerHTML = state.skills
    .map(
      (s, i) =>
        `<span class="skill-tag">${esc(s)}<button onclick="removeSkill(${i})"><i class="fa-solid fa-xmark"></i></button></span>`,
    )
    .join("");
}

function esc(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function showToast(msg) {
  const c = document.getElementById("toastContainer");
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg}`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ===== BUILD CV PREVIEW ===== */
function updatePreview() {
  ensureLanguageSection();
  const paper = document.getElementById("cvPaper");
  paper.setAttribute("data-template", state.template);
  paper.setAttribute("data-font", state.font);
  paper.style.setProperty("--cv-accent", state.accent);
  const name = document.getElementById("fullName").value,
    title = document.getElementById("jobTitle").value,
    email = document.getElementById("email").value,
    phone = document.getElementById("phone").value,
    loc = document.getElementById("location").value,
    web = document.getElementById("website").value,
    summary = document.getElementById("summary").value;
  const sortedSections = [...state.sections].sort(
    (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
  );
  let html = "";

  if (state.template === "creative") {
    html += `<div class="cv-sidebar" style="background:${state.accent}">`;
    html += `<div class="cv-photo">${state.photo ? `<img src="${state.photo}" alt="Photo" />` : `<i class="fa-solid fa-user"></i>`}</div>`;
    html += `<div class="cv-name hf">${esc(name) || "Your Name"}</div><div class="cv-title">${esc(title) || "Job Title"}</div><div class="cv-contact">`;
    if (email)
      html += `<span><i class="fa-solid fa-envelope"></i> ${esc(email)}</span>`;
    if (phone)
      html += `<span><i class="fa-solid fa-phone"></i> ${esc(phone)}</span>`;
    if (loc)
      html += `<span><i class="fa-solid fa-location-dot"></i> ${esc(loc)}</span>`;
    if (web)
      html += `<span><i class="fa-solid fa-globe"></i> ${esc(web)}</span>`;
    html += `</div>`;
    const skillSec = sortedSections.find((s) => s.id === "skills");
    if (skillSec && skillSec.visible && state.skills.length) {
      html += `<div class="cv-section"><div class="cv-section-title">Skills</div><div class="cv-skills-list">`;
      state.skills.forEach((s) => {
        html += `<span class="cv-skill-chip">${esc(s)}</span>`;
      });
      html += `</div></div>`;
    }
    const langSec = sortedSections.find((s) => s.id === "languages");
    if (
      langSec &&
      langSec.visible &&
      state.languages.some((l) => l && String(l.name || "").trim())
    ) {
      html += `<div class="cv-section"><div class="cv-section-title">Languages</div>${buildLanguages()}</div>`;
    }
    html += `</div><div class="cv-main">`;
    sortedSections.forEach((sec) => {
      if (!sec.visible) return;
      if (sec.id === "summary" && summary)
        html += buildSection(
          "Career Objective",
          `<div class="cv-entry-desc">${esc(summary)}</div>`,
        );
      else if (sec.id === "experience" && state.experience.length)
        html += buildSection("Experience", buildExperience());
      else if (sec.id === "education" && state.education.length)
        html += buildSection("Education", buildEducation());
      else if (sec.id === "projects" && state.projects.length)
        html += buildSection("Projects", buildProjects());
      else if (sec.id === "certifications" && state.certifications.length)
        html += buildSection("Certifications", buildCerts());
    });
    html += `</div>`;
  } else {
    html += `<div class="cv-header"`;
    if (state.template === "modern")
      html += ` style="background:${state.accent}"`;
    html += `>`;
    if (state.template === "compact")
      html += `<div class="cv-photo">${state.photo ? `<img src="${state.photo}" alt="Photo" />` : `<i class="fa-solid fa-user"></i>`}</div><div class="cv-header-text">`;
    html += `<div class="cv-name hf">${esc(name) || "Your Name"}</div><div class="cv-title">${esc(title) || "Job Title"}</div><div class="cv-contact">`;
    if (email)
      html += `<span><i class="fa-solid fa-envelope"></i> ${esc(email)}</span>`;
    if (phone)
      html += `<span><i class="fa-solid fa-phone"></i> ${esc(phone)}</span>`;
    if (loc)
      html += `<span><i class="fa-solid fa-location-dot"></i> ${esc(loc)}</span>`;
    if (web)
      html += `<span class="cv-website"><i class="fa-solid fa-globe"></i> ${esc(web)}</span>`;
    html += `</div>`;
    if (state.template === "compact") html += `</div>`;
    html += `</div>`;
    sortedSections.forEach((sec) => {
      if (!sec.visible) return;
      if (sec.id === "summary" && summary)
        html += buildSection(
          "Career Objective",
          `<div class="cv-entry-desc">${esc(summary)}</div>`,
        );
      else if (sec.id === "experience" && state.experience.length)
        html += buildSection("Experience", buildExperience());
      else if (sec.id === "education" && state.education.length)
        html += buildSection("Education", buildEducation());
      else if (
        sec.id === "languages" &&
        state.languages.some((l) => l && String(l.name || "").trim())
      )
        html += buildSection("Languages", buildLanguages());
      else if (sec.id === "skills" && state.skills.length) {
        let sh = `<div class="cv-skills-list">`;
        state.skills.forEach((s) => {
          sh += `<span class="cv-skill-chip" style="${chipStyle()}">${esc(s)}</span>`;
        });
        sh += `</div>`;
        html += buildSection("Skills", sh);
      } else if (sec.id === "projects" && state.projects.length)
        html += buildSection("Projects", buildProjects());
      else if (sec.id === "certifications" && state.certifications.length)
        html += buildSection("Certifications", buildCerts());
    });
  }
  paper.innerHTML =
    html ||
    `<div class="cv-empty"><i class="fa-solid fa-file-lines"></i><p>Start filling in your details to see the preview</p></div>`;
  applyAccentColors();
}

function chipStyle() {
  if (state.template === "modern")
    return `border-color:${state.accent};color:${state.accent}`;
  if (state.template === "executive")
    return `border-left-color:${state.accent}`;
  return "";
}
function langChipStyle() {
  return chipStyle();
}
function buildSection(title, content) {
  let ts = "";
  if (state.template === "modern" || state.template === "executive")
    ts = ` style="color:${state.accent}"`;
  return `<div class="cv-section"><div class="cv-section-title hf"${ts}>${title}</div>${content}</div>`;
}

/* Experience — dash list for Additional Details */
function buildExperience() {
  return state.experience
    .map((e) => {
      const ds = [e.startDate, e.endDate].filter(Boolean).join(" — ");
      let h = `<div class="cv-entry"><div class="cv-entry-header"><div class="cv-entry-title">${esc(e.title)}</div>`;
      if (ds) h += `<div class="cv-entry-date">${esc(ds)}</div>`;
      h += `</div>`;
      if (e.company) h += `<div class="cv-entry-sub">${esc(e.company)}</div>`;
      h += buildDashList(e.description);
      h += `</div>`;
      return h;
    })
    .join("");
}

/* Education — dash list for Additional Details */
function buildEducation() {
  return state.education
    .map((e) => {
      const ds = [e.startDate, e.endDate].filter(Boolean).join(" — ");
      let h = `<div class="cv-entry">`;
      h += `<div class="cv-entry-header"><div class="cv-entry-title">${esc(e.degree)}</div>`;
      if (ds) h += `<div class="cv-entry-date">${esc(ds)}</div>`;
      h += `</div>`;
      const subParts = [];
      if (e.institution) subParts.push(esc(e.institution));
      if (e.field) subParts.push(esc(e.field));
      if (e.grade) subParts.push("GPA: " + esc(e.grade));
      if (subParts.length)
        h += `<div class="cv-entry-sub">${subParts.join(" | ")}</div>`;
      h += buildDashList(e.description);
      h += `</div>`;
      return h;
    })
    .join("");
}

/* Languages — chips */
function buildLanguages() {
  const languages = (state.languages || []).filter(
    (l) => l && String(l.name || "").trim(),
  );
  if (!languages.length) return "";
  let h = `<div class="cv-lang-list">`;
  languages.forEach((l) => {
    const name = String(l.name || "").trim();
    const level = String(l.level || "").trim();
    h += `<span class="cv-lang-chip" style="${langChipStyle()}"><span class="cv-lang-name">${esc(name)}</span>${level ? `<span class="cv-lang-level"> (${esc(level)})</span>` : ""}</span>`;
  });
  h += `</div>`;
  return h;
}

/* Projects — dash list for Additional Details */
function buildProjects() {
  return state.projects
    .map((e) => {
      let h = `<div class="cv-entry"><div class="cv-entry-header"><div class="cv-entry-title">${esc(e.title)}</div></div>`;
      const sub = [];
      if (e.tech) sub.push(esc(e.tech));
      if (e.link) sub.push(esc(e.link));
      if (sub.length) h += `<div class="cv-entry-sub">${sub.join(" | ")}</div>`;
      h += buildDashList(e.description);
      h += `</div>`;
      return h;
    })
    .join("");
}

/* Certifications — no description field, stays as-is */
function buildCerts() {
  return state.certifications
    .map((e) => {
      let h = `<div class="cv-entry"><div class="cv-entry-header"><div class="cv-entry-title">${esc(e.name)}</div>`;
      if (e.date) h += `<div class="cv-entry-date">${esc(e.date)}</div>`;
      h += `</div>`;
      const sub = [];
      if (e.issuer) sub.push(esc(e.issuer));
      if (e.id) sub.push("ID: " + esc(e.id));
      if (sub.length) h += `<div class="cv-entry-sub">${sub.join(" | ")}</div>`;
      h += `</div>`;
      return h;
    })
    .join("");
}

function applyAccentColors() {
  const paper = document.getElementById("cvPaper");
  if (state.template === "modern") {
    const hdr = paper.querySelector(".cv-header");
    if (hdr) hdr.style.background = state.accent;
  }
  if (state.template === "executive" || state.template === "compact") {
    const hdr = paper.querySelector(".cv-header");
    if (hdr) hdr.style.borderBottomColor = state.accent;
  }
  paper.querySelectorAll(".cv-section-title").forEach((el) => {
    if (state.template === "modern" || state.template === "executive")
      el.style.color = state.accent;
  });
  if (state.template === "executive") {
    paper.querySelectorAll(".cv-section-title").forEach((el) => {
      if (!el.dataset.dashed) {
        el.innerHTML =
          `<span style="display:inline-block;width:18px;height:2px;background:${state.accent};margin-right:6px;vertical-align:middle"></span>` +
          el.innerHTML;
        el.dataset.dashed = "1";
      }
    });
  }
  if (state.template === "creative") {
    paper.querySelectorAll(".cv-main .cv-section-title").forEach((el) => {
      el.style.borderBottomColor = state.accent;
      el.style.color = state.accent;
    });
  }
  paper.querySelectorAll(".cv-skill-chip").forEach((el) => {
    if (state.template === "modern") {
      el.style.borderColor = state.accent;
      el.style.color = state.accent;
    }
    if (state.template === "executive") el.style.borderLeftColor = state.accent;
  });
  paper.querySelectorAll(".cv-lang-chip").forEach((el) => {
    if (state.template === "modern") {
      el.style.borderColor = state.accent;
      el.style.color = state.accent;
    }
    if (state.template === "executive") el.style.borderLeftColor = state.accent;
  });
  paper.querySelectorAll(".cv-detail-list li").forEach((el) => {
    el.style.setProperty("--dash-color", state.accent);
  });
}

function exportData() {
  const data = {
    fullName: document.getElementById("fullName").value,
    jobTitle: document.getElementById("jobTitle").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    location: document.getElementById("location").value,
    website: document.getElementById("website").value,
    summary: document.getElementById("summary").value,
    template: state.template,
    font: state.font,
    accent: state.accent,
    // FIX #3: photo was previously omitted from the export entirely,
    // so exporting + reimporting a CV silently dropped the profile photo.
    photo: state.photo,
    sections: state.sections,
    experience: state.experience,
    education: state.education,
    languages: state.languages,
    skills: state.skills,
    projects: state.projects,
    certifications: state.certifications,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cv-forge-data.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Data exported successfully");
}
function importData() {
  document.getElementById("importInput").click();
}
function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const d = JSON.parse(ev.target.result);
      document.getElementById("fullName").value = d.fullName || "";
      document.getElementById("jobTitle").value = d.jobTitle || "";
      document.getElementById("email").value = d.email || "";
      document.getElementById("phone").value = d.phone || "";
      document.getElementById("location").value = d.location || "";
      document.getElementById("website").value = d.website || "";
      document.getElementById("summary").value = d.summary || "";
      if (d.template) {
        state.template = d.template;
        document
          .querySelectorAll(".template-option")
          .forEach((o) =>
            o.classList.toggle("active", o.dataset.tpl === d.template),
          );
      }
      if (d.font) {
        state.font = d.font;
        document
          .querySelectorAll(".font-option")
          .forEach((o) =>
            o.classList.toggle("active", o.dataset.font === d.font),
          );
      }
      if (d.accent) {
        state.accent = d.accent;
        document
          .querySelectorAll(".color-swatch")
          .forEach((s) =>
            s.classList.toggle("active", s.dataset.color === d.accent),
          );
      }
      // FIX #3 (continued): restore the photo on import, and clear the
      // preview back to the placeholder when the imported file has none,
      // so a previously-set photo doesn't linger after importing data
      // that shouldn't have one.
      if (d.photo) {
        state.photo = d.photo;
        document.getElementById("photoPreview").innerHTML =
          `<img src="${d.photo}" alt="Photo" />`;
      } else {
        state.photo = null;
        document.getElementById("photoPreview").innerHTML =
          `<i class="fa-solid fa-camera"></i>`;
      }
      if (d.sections) state.sections = d.sections;
      if (d.experience) state.experience = d.experience;
      if (d.education) state.education = d.education;
      if (d.languages) state.languages = d.languages;
      if (d.skills) state.skills = d.skills;
      if (d.projects) state.projects = d.projects;
      if (d.certifications) state.certifications = d.certifications;
      ensureLanguageSection();
      renderExperienceEntries();
      renderEducationEntries();
      renderLanguageEntries();
      renderProjectEntries();
      renderCertEntries();
      renderSkills();
      renderSectionManager();
      updatePreview();
      showToast("Data imported successfully");
    } catch (err) {
      showToast("Invalid file format");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}
function resetAll() {
  state.experience = [];
  state.education = [];
  state.languages = [];
  state.skills = [];
  state.projects = [];
  state.certifications = [];
  state.photo = null;
  document.getElementById("fullName").value = "";
  document.getElementById("jobTitle").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("location").value = "";
  document.getElementById("website").value = "";
  document.getElementById("summary").value = "";
  document.getElementById("photoPreview").innerHTML =
    `<i class="fa-solid fa-camera"></i>`;
  // FIX #4: the photo file input's value wasn't cleared, so re-selecting
  // the exact same file right after a reset wouldn't fire a change event
  // in some browsers (no detectable value change), silently failing to
  // re-attach the photo.
  const photoInput = document.getElementById("photoInput");
  if (photoInput) photoInput.value = "";
  renderExperienceEntries();
  renderEducationEntries();
  renderLanguageEntries();
  renderProjectEntries();
  renderCertEntries();
  renderSkills();
  updatePreview();
  showToast("All data reset");
}
function printCV() {
  window.print();
}
init();