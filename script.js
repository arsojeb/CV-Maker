/* ===== STATE ===== */
var currentTemplate = 'classic';
var currentColor = '#c8a24e';
var currentFont = 'elegant';
var photoData = null;
var skills = [];
var dataEntries = { experience: [], education: [], language: [], project: [], certification: [] };

/* Color palette */
var colors = [
  { name: 'Gold', hex: '#c8a24e' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Sage', hex: '#65864b' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Slate', hex: '#475569' },
  { name: 'Rose', hex: '#be4a5c' },
  { name: 'Plum', hex: '#7c3aed' },
  { name: 'Rust', hex: '#c2410c' },
  { name: 'Charcoal', hex: '#333333' },
  { name: 'Crimson', hex: '#991b1b' }
];

/* Section definitions with order and visibility */
var sections = [
  { id: 'summary', label: 'Professional Summary', icon: 'fa-align-left', enabled: true },
  { id: 'experience', label: 'Work Experience', icon: 'fa-briefcase', enabled: true },
  { id: 'education', label: 'Education', icon: 'fa-graduation-cap', enabled: true },
  { id: 'skills', label: 'Skills', icon: 'fa-star', enabled: true },
  { id: 'languages', label: 'Languages', icon: 'fa-globe', enabled: true },
  { id: 'projects', label: 'Projects', icon: 'fa-diagram-project', enabled: true },
  { id: 'certifications', label: 'Certifications', icon: 'fa-certificate', enabled: true }
];

/* Field configs per entry type */
var entryConfigs = {
  experience: {
    fields: [
      { key: 'title', label: 'Job Title', placeholder: 'Software Engineer', full: false },
      { key: 'company', label: 'Company', placeholder: 'Google', full: false },
      { key: 'date', label: 'Period', placeholder: 'Jan 2020 — Present', full: true },
      { key: 'desc', label: 'Description', placeholder: 'Led a team of 5 engineers to build...', full: true, textarea: true }
    ]
  },
  education: {
    fields: [
      { key: 'degree', label: 'Degree', placeholder: 'B.Sc. Computer Science', full: false },
      { key: 'school', label: 'School', placeholder: 'MIT', full: false },
      { key: 'date', label: 'Period', placeholder: '2014 — 2018', full: true },
      { key: 'desc', label: 'Details', placeholder: 'Graduated with honors...', full: true, textarea: true }
    ]
  },
  language: {
    fields: [
      { key: 'name', label: 'Language', placeholder: 'Spanish', full: false },
      { key: 'level', label: 'Level', placeholder: '', full: false, select: ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'] }
    ]
  },
  project: {
    fields: [
      { key: 'name', label: 'Project Name', placeholder: 'E-Commerce Platform', full: false },
      { key: 'role', label: 'Role', placeholder: 'Lead Developer', full: false },
      { key: 'date', label: 'Period', placeholder: '2022 — 2023', full: true },
      { key: 'desc', label: 'Description', placeholder: 'Built a full-stack e-commerce platform...', full: true, textarea: true }
    ]
  },
  certification: {
    fields: [
      { key: 'name', label: 'Certification', placeholder: 'AWS Solutions Architect', full: false },
      { key: 'org', label: 'Organization', placeholder: 'Amazon Web Services', full: false },
      { key: 'date', label: 'Date', placeholder: 'March 2023', full: true }
    ]
  }
};

/* Section title mapping for CV output */
var cvSectionTitles = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  languages: 'Languages',
  projects: 'Projects',
  certifications: 'Certifications'
};

/* Count element IDs */
var countIds = {
  experience: 'expCount',
  education: 'eduCount',
  skills: 'skillCount',
  languages: 'langCount',
  project: 'projCount',
  certification: 'certCount'
};

/* ===== INIT ===== */
function init() {
  buildColorSwatches();
  renderSectionManager();
  updatePreview();
}

/* ===== TOGGLE SECTIONS ===== */
function toggleSection(header) {
  header.parentElement.classList.toggle('collapsed');
}

/* ===== TEMPLATE ===== */
function selectTemplate(tpl, el) {
  currentTemplate = tpl;
  document.querySelectorAll('.template-option').forEach(function(o) { o.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('cvPaper').setAttribute('data-template', tpl);
  updatePreview();
}

/* ===== COLOR ===== */
function buildColorSwatches() {
  var row = document.getElementById('colorRow');
  row.innerHTML = '';
  colors.forEach(function(c) {
    var sw = document.createElement('div');
    sw.className = 'color-swatch' + (c.hex === currentColor ? ' active' : '');
    sw.style.background = c.hex;
    sw.title = c.name;
    sw.setAttribute('role', 'button');
    sw.setAttribute('aria-label', c.name + ' color');
    sw.tabIndex = 0;
    sw.onclick = function() { selectColor(c.hex, sw); };
    row.appendChild(sw);
  });
}

function selectColor(hex, el) {
  currentColor = hex;
  document.querySelectorAll('.color-swatch').forEach(function(s) { s.classList.remove('active'); });
  el.classList.add('active');
  applyColorToPaper();
  updatePreview();
}

function applyColorToPaper() {
  var paper = document.getElementById('cvPaper');
  var tpl = currentTemplate;

  /* Reset inline styles that color sets */
  paper.style.removeProperty('--cv-accent');

  if (tpl === 'modern' || tpl === 'creative') {
    paper.querySelector('.cv-header, .cv-sidebar') && (paper.querySelector(tpl === 'creative' ? '.cv-sidebar' : '.cv-header').style.background = currentColor);
  }

  /* Remove old dynamic style elements */
  var oldStyle = document.getElementById('dynamicCvStyle');
  if (oldStyle) oldStyle.remove();

  var css = '';

  if (tpl === 'modern') {
    css = '.cv-paper[data-template="modern"] .cv-title{color:' + currentColor + '!important}' +
          '.cv-paper[data-template="modern"] .cv-section-title{color:' + currentColor + '!important}' +
          '.cv-paper[data-template="modern"] .cv-skill-chip{border-color:' + currentColor + '!important;color:' + currentColor + '!important;background:transparent!important}';
  } else if (tpl === 'creative') {
    css = '.cv-paper[data-template="creative"] .cv-sidebar{background:' + currentColor + '!important}' +
          '.cv-paper[data-template="creative"] .cv-main .cv-section-title{border-color:' + currentColor + '!important;color:' + currentColor + '!important}' +
          '.cv-paper[data-template="creative"] .cv-sidebar .cv-title{color:' + currentColor + '!important;opacity:1!important}';
  } else if (tpl === 'executive') {
    css = '.cv-paper[data-template="executive"] .cv-header{border-color:' + currentColor + '!important}' +
          '.cv-paper[data-template="executive"] .cv-section-title{color:' + currentColor + '!important}' +
          '.cv-paper[data-template="executive"] .cv-section-title::after{content:"";display:inline-block;width:20px;height:2px;background:' + currentColor + ';margin-left:0}' +
          '.cv-paper[data-template="executive"] .cv-skill-chip{border-color:' + currentColor + '!important}';
  } else if (tpl === 'compact') {
    css = '.cv-paper[data-template="compact"] .cv-header{border-color:' + currentColor + '!important}' +
          '.cv-paper[data-template="compact"] .cv-section-title{color:' + currentColor + '!important}';
  } else if (tpl === 'classic') {
    css = '.cv-paper[data-template="classic"] .cv-section-title{color:' + currentColor + '!important;border-color:' + currentColor + '!important}';
  } else if (tpl === 'minimal') {
    css = '.cv-paper[data-template="minimal"] .cv-section-title{color:' + currentColor + '!important}';
  }

  if (css) {
    var style = document.createElement('style');
    style.id = 'dynamicCvStyle';
    style.textContent = css;
    document.head.appendChild(style);
  }
}

/* ===== FONT ===== */
function selectFont(font, el) {
  currentFont = font;
  document.querySelectorAll('.font-option').forEach(function(o) { o.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('cvPaper').setAttribute('data-font', font);
}

/* ===== SECTION MANAGER ===== */
function renderSectionManager() {
  var container = document.getElementById('sectionManager');
  container.innerHTML = '';
  sections.forEach(function(sec, idx) {
    var item = document.createElement('div');
    item.className = 'section-manager-item';
    item.innerHTML =
      '<button class="btn-icon" onclick="moveSection(' + idx + ',-1)" aria-label="Move up"' + (idx === 0 ? ' disabled' : '') + '><i class="fa-solid fa-chevron-up"></i></button>' +
      '<button class="btn-icon" onclick="moveSection(' + idx + ',1)" aria-label="Move down"' + (idx === sections.length - 1 ? ' disabled' : '') + '><i class="fa-solid fa-chevron-down"></i></button>' +
      '<span class="sm-name"><i class="fa-solid ' + sec.icon + '" style="margin-right:5px;color:var(--accent);font-size:10px"></i>' + sec.label + '</span>' +
      '<button class="toggle-switch' + (sec.enabled ? ' active' : '') + '" onclick="toggleSectionVisibility(' + idx + ',this)" aria-label="Toggle ' + sec.label + '"></button>';
    container.appendChild(item);
  });
}

function moveSection(idx, dir) {
  var newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= sections.length) return;
  var temp = sections[idx];
  sections[idx] = sections[newIdx];
  sections[newIdx] = temp;
  renderSectionManager();
  updatePreview();
}

function toggleSectionVisibility(idx, el) {
  sections[idx].enabled = !sections[idx].enabled;
  el.classList.toggle('active');
  updatePreview();
}

/* ===== PHOTO ===== */
function handlePhoto(e) {
  var file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB', 'fa-triangle-exclamation', 'var(--danger)'); return; }
  var reader = new FileReader();
  reader.onload = function(ev) {
    photoData = ev.target.result;
    document.getElementById('photoPreview').innerHTML = '<img src="' + photoData + '" alt="Photo">';
    updatePreview();
    showToast('Photo uploaded');
  };
  reader.readAsDataURL(file);
}

/* ===== SKILLS ===== */
function addSkill() {
  var input = document.getElementById('skillInput');
  var val = input.value.trim();
  if (!val) return;
  if (skills.indexOf(val) !== -1) { showToast('Skill already added', 'fa-triangle-exclamation', 'var(--danger)'); return; }
  skills.push(val);
  input.value = '';
  renderSkillTags();
  updatePreview();
}

function removeSkill(i) {
  skills.splice(i, 1);
  renderSkillTags();
  updatePreview();
}

function renderSkillTags() {
  var c = document.getElementById('skillsTags');
  c.innerHTML = skills.map(function(s, i) {
    return '<span class="skill-tag">' + esc(s) + '<button onclick="removeSkill(' + i + ')" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button></span>';
  }).join('');
  var el = document.getElementById('skillCount');
  if (el) el.textContent = skills.length ? skills.length + ' skill' + (skills.length > 1 ? 's' : '') : 'No skills added';
}

/* ===== ENTRIES ===== */
function addEntry(type) {
  var id = Date.now();
  var entry = { id: id };
  entryConfigs[type].fields.forEach(function(f) { entry[f.key] = ''; });
  if (type === 'language') entry.level = 'Intermediate';
  dataEntries[type].push(entry);
  renderEntries(type);
  updatePreview();
}

function removeEntry(type, id) {
  dataEntries[type] = dataEntries[type].filter(function(e) { return e.id !== id; });
  renderEntries(type);
  updatePreview();
}

function updateEntry(type, id, key, value) {
  var entry = dataEntries[type].find(function(e) { return e.id === id; });
  if (entry) entry[key] = value;
  updatePreview();
}

function renderEntries(type) {
  var containerId = type + 'List';
  /* handle naming: language -> languages, project -> projects, certification -> certifications */
  if (type === 'language') containerId = 'languagesList';
  else if (type === 'project') containerId = 'projectsList';
  else if (type === 'certification') containerId = 'certificationsList';

  var container = document.getElementById(containerId);
  if (!container) return;
  var config = entryConfigs[type];

  container.innerHTML = dataEntries[type].map(function(e) {
    var html = '<div class="entry-block"><button class="btn btn-danger btn-sm remove-entry" onclick="removeEntry(\'' + type + '\',' + e.id + ')" aria-label="Remove"><i class="fa-solid fa-trash"></i></button><div class="form-grid">';

    config.fields.forEach(function(f) {
      var cls = f.full ? ' full' : '';
      if (f.textarea) {
        html += '<div class="field-group' + cls + '"><label class="field-label">' + f.label + '</label><textarea class="field-textarea" oninput="updateEntry(\'' + type + '\',' + e.id + ',\'' + f.key + '\',this.value)" placeholder="' + escA(f.placeholder) + '">' + esc(e[f.key] || '') + '</textarea></div>';
      } else if (f.select) {
        html += '<div class="field-group' + cls + '"><label class="field-label">' + f.label + '</label><select class="field-select" onchange="updateEntry(\'' + type + '\',' + e.id + ',\'' + f.key + '\',this.value)">' +
          f.select.map(function(opt) { return '<option value="' + opt + '"' + ((e[f.key] || 'Intermediate') === opt ? ' selected' : '') + '>' + opt + '</option>'; }).join('') +
          '</select></div>';
      } else {
        html += '<div class="field-group' + cls + '"><label class="field-label">' + f.label + '</label><input class="field-input" value="' + escA(e[f.key] || '') + '" oninput="updateEntry(\'' + type + '\',' + e.id + ',\'' + f.key + '\',this.value)" placeholder="' + escA(f.placeholder) + '"></div>';
      }
    });

    html += '</div></div>';
    return html;
  }).join('');

  /* Update count */
  var countEl = document.getElementById(countIds[type]);
  if (countEl) {
    var n = dataEntries[type].length;
    countEl.textContent = n ? n + ' entr' + (n > 1 ? 'ies' : 'y') : 'No entries yet';
  }
}

/* ===== BUILD PREVIEW ===== */
function updatePreview() {
  var name = document.getElementById('fullName').value.trim();
  var title = document.getElementById('jobTitle').value.trim();
  var email = document.getElementById('email').value.trim();
  var phone = document.getElementById('phone').value.trim();
  var loc = document.getElementById('location').value.trim();
  var web = document.getElementById('website').value.trim();
  var summary = document.getElementById('summary').value.trim();

  var hasContent = name || title || email || phone || loc || web || summary ||
    Object.keys(dataEntries).some(function(k) { return dataEntries[k].some(function(e) { return Object.values(e).some(function(v) { return v && v !== ''; }); }); }) ||
    skills.length > 0;

  var cvEmpty = document.getElementById('cvEmpty');
  var cvContent = document.getElementById('cvContent');

  if (!hasContent) { cvEmpty.style.display = 'flex'; cvContent.style.display = 'none'; return; }
  cvEmpty.style.display = 'none';
  cvContent.style.display = 'block';

  var tpl = currentTemplate;
  var isCreative = tpl === 'creative';
  var isModern = tpl === 'modern';
  var isCompact = tpl === 'compact';

  /* Contact items */
  var contacts = [];
  if (email) contacts.push('<span><i class="fa-solid fa-envelope"></i> ' + esc(email) + '</span>');
  if (phone) contacts.push('<span><i class="fa-solid fa-phone"></i> ' + esc(phone) + '</span>');
  if (loc) contacts.push('<span><i class="fa-solid fa-location-dot"></i> ' + esc(loc) + '</span>');
  if (web) contacts.push('<span class="cv-website"><i class="fa-solid fa-globe"></i> ' + esc(web) + '</span>');

  /* Photo HTML */
  var photoHtml = '';
  if (photoData) photoHtml = '<div class="cv-photo"><img src="' + photoData + '" alt="Photo"></div>';

  var html = '';

  if (isCreative) {
    /* Sidebar */
    html += '<div class="cv-sidebar">';
    html += photoHtml;
    html += '<div class="cv-name hf">' + esc(name || 'Your Name') + '</div>';
    if (title) html += '<div class="cv-title">' + esc(title) + '</div>';
    if (contacts.length) html += '<div class="cv-contact">' + contacts.join('') + '</div>';

    /* Sidebar sections: skills, languages, certifications */
    sections.forEach(function(sec) {
      if (!sec.enabled) return;
      if (sec.id === 'skills' && skills.length) {
        html += '<div class="cv-section"><div class="cv-section-title">' + cvSectionTitles.skills + '</div><div class="cv-skills-list">' + skills.map(function(s) { return '<span class="cv-skill-chip">' + esc(s) + '</span>'; }).join('') + '</div></div>';
      }
      if (sec.id === 'languages') {
        var valid = dataEntries.language.filter(function(l) { return l.name; });
        if (valid.length) {
          html += '<div class="cv-section"><div class="cv-section-title">' + cvSectionTitles.languages + '</div><div class="cv-skills-list">' + valid.map(function(l) { return '<span class="cv-skill-chip">' + esc(l.name) + ' — ' + esc(l.level) + '</span>'; }).join('') + '</div></div>';
        }
      }
      if (sec.id === 'certifications') {
        var valid = dataEntries.certification.filter(function(c) { return c.name; });
        if (valid.length) {
          html += '<div class="cv-section"><div class="cv-section-title">' + cvSectionTitles.certifications + '</div>';
          valid.forEach(function(c) {
            html += '<div class="cv-entry"><div class="cv-entry-title" style="font-size:9.5px">' + esc(c.name) + '</div>';
            if (c.org) html += '<div class="cv-entry-sub">' + esc(c.org) + '</div>';
            if (c.date) html += '<div class="cv-entry-date" style="font-size:9px">' + esc(c.date) + '</div>';
            html += '</div>';
          });
          html += '</div>';
        }
      }
    });
    html += '</div>';

    /* Main */
    html += '<div class="cv-main">';
    sections.forEach(function(sec) {
      if (!sec.enabled) return;
      if (sec.id === 'summary' && summary) {
        html += '<div class="cv-section"><div class="cv-section-title">' + cvSectionTitles.summary + '</div><div class="cv-entry-desc">' + esc(summary) + '</div></div>';
      }
      if (sec.id === 'experience') {
        var valid = dataEntries.experience.filter(function(e) { return e.title || e.company; });
        if (valid.length) {
          html += '<div class="cv-section"><div class="cv-section-title">' + cvSectionTitles.experience + '</div>';
          valid.forEach(function(e) { html += buildEntryHtml(e, 'title', 'company'); });
          html += '</div>';
        }
      }
      if (sec.id === 'education') {
        var valid = dataEntries.education.filter(function(e) { return e.degree || e.school; });
        if (valid.length) {
          html += '<div class="cv-section"><div class="cv-section-title">' + cvSectionTitles.education + '</div>';
          valid.forEach(function(e) { html += buildEntryHtml(e, 'degree', 'school'); });
          html += '</div>';
        }
      }
      if (sec.id === 'projects') {
        var valid = dataEntries.project.filter(function(e) { return e.name; });
        if (valid.length) {
          html += '<div class="cv-section"><div class="cv-section-title">' + cvSectionTitles.projects + '</div>';
          valid.forEach(function(e) { html += buildEntryHtml(e, 'name', 'role'); });
          html += '</div>';
        }
      }
    });
    html += '</div>';

  } else {
    /* Standard layout: header on top */
    html += '<div class="cv-header">';
    if (isCompact) {
      html += photoHtml + '<div class="cv-header-text">';
    } else {
      html += photoHtml;
    }
    html += '<div class="cv-name hf">' + esc(name || 'Your Name') + '</div>';
    if (title) html += '<div class="cv-title">' + esc(title) + '</div>';
    if (contacts.length) html += '<div class="cv-contact">' + contacts.join('') + '</div>';
    if (isCompact) html += '</div>';
    html += '</div>';

    /* Content sections in order */
    sections.forEach(function(sec) {
      if (!sec.enabled) return;

      if (sec.id === 'summary' && summary) {
        html += '<div class="cv-section"><div class="cv-section-title hf">' + cvSectionTitles.summary + '</div><div class="cv-entry-desc">' + esc(summary) + '</div></div>';
      }
      if (sec.id === 'experience') {
        var valid = dataEntries.experience.filter(function(e) { return e.title || e.company; });
        if (valid.length) {
          html += '<div class="cv-section"><div class="cv-section-title hf">' + cvSectionTitles.experience + '</div>';
          valid.forEach(function(e) { html += buildEntryHtml(e, 'title', 'company'); });
          html += '</div>';
        }
      }
      if (sec.id === 'education') {
        var valid = dataEntries.education.filter(function(e) { return e.degree || e.school; });
        if (valid.length) {
          html += '<div class="cv-section"><div class="cv-section-title hf">' + cvSectionTitles.education + '</div>';
          valid.forEach(function(e) { html += buildEntryHtml(e, 'degree', 'school'); });
          html += '</div>';
        }
      }
      if (sec.id === 'skills' && skills.length) {
        html += '<div class="cv-section"><div class="cv-section-title hf">' + cvSectionTitles.skills + '</div><div class="cv-skills-list">' + skills.map(function(s) { return '<span class="cv-skill-chip">' + esc(s) + '</span>'; }).join('') + '</div></div>';
      }
      if (sec.id === 'languages') {
        var valid = dataEntries.language.filter(function(l) { return l.name; });
        if (valid.length) {
          html += '<div class="cv-section"><div class="cv-section-title hf">' + cvSectionTitles.languages + '</div><div class="cv-skills-list">' + valid.map(function(l) { return '<span class="cv-skill-chip">' + esc(l.name) + ' — ' + esc(l.level) + '</span>'; }).join('') + '</div></div>';
        }
      }
      if (sec.id === 'projects') {
        var valid = dataEntries.project.filter(function(e) { return e.name; });
        if (valid.length) {
          html += '<div class="cv-section"><div class="cv-section-title hf">' + cvSectionTitles.projects + '</div>';
          valid.forEach(function(e) { html += buildEntryHtml(e, 'name', 'role'); });
          html += '</div>';
        }
      }
      if (sec.id === 'certifications') {
        var valid = dataEntries.certification.filter(function(c) { return c.name; });
        if (valid.length) {
          html += '<div class="cv-section"><div class="cv-section-title hf">' + cvSectionTitles.certifications + '</div>';
          valid.forEach(function(c) {
            html += '<div class="cv-entry"><div class="cv-entry-header"><span class="cv-entry-title">' + esc(c.name) + '</span>';
            if (c.date) html += '<span class="cv-entry-date">' + esc(c.date) + '</span>';
            html += '</div>';
            if (c.org) html += '<div class="cv-entry-sub">' + esc(c.org) + '</div>';
            html += '</div>';
          });
          html += '</div>';
        }
      }
    });
  }

  cvContent.innerHTML = html;
  applyColorToPaper();
}

function buildEntryHtml(e, titleKey, subKey) {
  var h = '<div class="cv-entry">';
  h += '<div class="cv-entry-header"><span class="cv-entry-title">' + esc(e[titleKey] || 'Untitled') + '</span>';
  if (e.date) h += '<span class="cv-entry-date">' + esc(e.date) + '</span>';
  h += '</div>';
  if (e[subKey]) h += '<div class="cv-entry-sub">' + esc(e[subKey]) + '</div>';
  if (e.desc) h += '<div class="cv-entry-desc">' + esc(e.desc) + '</div>';
  h += '</div>';
  return h;
}

/* ===== PRINT ===== */
function printCV() {
  if (!document.getElementById('fullName').value.trim()) {
    showToast('Please enter your name first', 'fa-triangle-exclamation', 'var(--danger)');
    return;
  }
  showToast('Opening print dialog...');
  var prevTitle = document.title || '';
  try { document.title = ''; } catch (e) {}
  setTimeout(function() { 
    window.print(); 
    setTimeout(function() { 
      try { document.title = prevTitle; } catch (e) {}
    }, 800);
  }, 400);
}

/* ===== RESET ===== */
function resetAll() {
  document.getElementById('fullName').value = '';
  document.getElementById('jobTitle').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('location').value = '';
  document.getElementById('website').value = '';
  document.getElementById('summary').value = '';
  document.getElementById('photoInput').value = '';
  document.getElementById('photoPreview').innerHTML = '<i class="fa-solid fa-camera"></i>';
  photoData = null;
  skills = [];
  dataEntries = { experience: [], education: [], language: [], project: [], certification: [] };
  sections.forEach(function(s, i) { s.enabled = true; });
  renderSkillTags();
  Object.keys(dataEntries).forEach(function(type) { renderEntries(type); });
  renderSectionManager();
  updatePreview();
  showToast('All fields cleared');
}

/* ===== EXPORT / IMPORT ===== */
function exportData() {
  var data = {
    template: currentTemplate,
    color: currentColor,
    font: currentFont,
    photo: photoData,
    skills: skills,
    entries: dataEntries,
    sections: sections.map(function(s) { return { id: s.id, enabled: s.enabled }; }),
    fields: {
      fullName: document.getElementById('fullName').value,
      jobTitle: document.getElementById('jobTitle').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      location: document.getElementById('location').value,
      website: document.getElementById('website').value,
      summary: document.getElementById('summary').value
    }
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'cv-forge-data.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('CV data exported');
}

function importData() {
  document.getElementById('importInput').click();
}

function handleImport(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var data = JSON.parse(ev.target.result);
      if (!data.fields) throw new Error('Invalid format');

      /* Restore fields */
      document.getElementById('fullName').value = data.fields.fullName || '';
      document.getElementById('jobTitle').value = data.fields.jobTitle || '';
      document.getElementById('email').value = data.fields.email || '';
      document.getElementById('phone').value = data.fields.phone || '';
      document.getElementById('location').value = data.fields.location || '';
      document.getElementById('website').value = data.fields.website || '';
      document.getElementById('summary').value = data.fields.summary || '';

      /* Style */
      if (data.template) {
        currentTemplate = data.template;
        document.querySelectorAll('.template-option').forEach(function(o) {
          o.classList.toggle('active', o.getAttribute('data-tpl') === data.template);
        });
        document.getElementById('cvPaper').setAttribute('data-template', data.template);
      }
      if (data.color) {
        currentColor = data.color;
        buildColorSwatches();
      }
      if (data.font) {
        currentFont = data.font;
        document.querySelectorAll('.font-option').forEach(function(o) {
          o.classList.toggle('active', o.getAttribute('data-font') === data.font);
        });
        document.getElementById('cvPaper').setAttribute('data-font', data.font);
      }
      if (data.photo) {
        photoData = data.photo;
        document.getElementById('photoPreview').innerHTML = '<img src="' + photoData + '" alt="Photo">';
      }
      if (data.skills) {
        skills = data.skills;
        renderSkillTags();
      }
      if (data.entries) {
        dataEntries = data.entries;
        /* Ensure all keys exist */
        ['experience', 'education', 'language', 'project', 'certification'].forEach(function(k) {
          if (!dataEntries[k]) dataEntries[k] = [];
        });
        Object.keys(dataEntries).forEach(function(type) { renderEntries(type); });
      }
      if (data.sections) {
        data.sections.forEach(function importedSec(is) {
          var sec = sections.find(function(s) { return s.id === is.id; });
          if (sec) sec.enabled = is.enabled;
        });
        renderSectionManager();
      }

      updatePreview();
      showToast('CV data imported successfully');
    } catch (err) {
      showToast('Invalid file format', 'fa-triangle-exclamation', 'var(--danger)');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

/* ===== TOAST ===== */
function showToast(msg, icon, color) {
  var c = document.getElementById('toastContainer');
  var t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<i class="fa-solid ' + (icon || 'fa-check-circle') + '" style="color:' + (color || 'var(--success)') + '"></i> ' + esc(msg);
  c.appendChild(t);
  setTimeout(function() { t.remove(); }, 3100);
}

/* ===== UTILITIES ===== */
function esc(str) {
  if (!str) return '';
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
function escA(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ===== START ===== */
init();