// GLOBAL DATABASE VARIABLES
let submissions = [];
let adminFilter = 'all';

// INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Submissions Database
  if (!localStorage.getItem('aqualife_submissions')) {
    localStorage.setItem('aqualife_submissions', JSON.stringify([]));
  }
  submissions = JSON.parse(localStorage.getItem('aqualife_submissions'));

  // 2. Scroll Fade-in logic
  initFadeIn();
});

// XSS PROTECTION ESCAPING HELPER FUNCTIONS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// MOBILE HAMBURGER MENU TOGGLER
function toggleMobileMenu() {
  const burger = document.getElementById('nav-hamburger');
  const menu = document.getElementById('mobile-menu');
  burger.classList.toggle('active');
  menu.classList.toggle('active');
}

// SCROLL ANIMATIONS (INTERSECTION OBSERVER)
function initFadeIn() {
  const items = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.12
  });

  items.forEach(item => observer.observe(item));
}

// TOAST NOTIFICATIONS SYSTEM (Auto-dismiss in 3.2s)
function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `💧 &nbsp;<span>${escapeHtml(msg)}</span>`;

  container.appendChild(toast);

  // Trigger animations
  setTimeout(() => toast.classList.add('active'), 50);

  // Dismiss
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// FORM TABS SWITCHER
function switchTab(name, btn) {
  // 1. Reset buttons styling
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // 2. Hide all panels
  document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));

  // 3. Show correct panel
  document.getElementById(`form-panel-${name}`).classList.add('active');
}

// STAR RATING FOR FEEDBACK
let userRating = 0;
function setRating(v) {
  userRating = v;
  const stars = document.querySelectorAll('.star-rating .star-icon');
  stars.forEach((star, index) => {
    if (index < v) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });

  const labels = ["Select Rating", "Poor 😡", "Fair 😐", "Good 🙂", "Very Good 😊", "Excellent! 🌟"];
  document.getElementById('rating-label').textContent = labels[v] || "Select Rating";
}

// AUXILIARY UTILITY TO SWAP FORM VIEW BINDINGS IN NAVBAR
function scrollToFormsTab(tabType) {
  const tabBtn = document.getElementById(`tab-btn-${tabType}`);
  if (tabBtn) {
    switchTab(tabType, tabBtn);
  }
  document.getElementById('forms').scrollIntoView({ behavior: 'smooth' });
}

// SUBMIT CUSTOMER FORMS
function submitForm(event, type) {
  event.preventDefault();

  let submissionData = {
    id: Date.now(),
    type: type,
    timestamp: new Date().toLocaleString()
  };

  const statusDiv = document.getElementById(`status-${type}`);
  statusDiv.className = 'form-status';
  statusDiv.textContent = '';

  if (type === 'complaint') {
    const name = document.getElementById('comp-name').value.trim();
    const phone = document.getElementById('comp-phone').value.trim();
    const model = document.getElementById('comp-model').value.trim();
    const issue = document.getElementById('comp-issue').value;
    const desc = document.getElementById('comp-desc').value.trim();

    if (!name || !phone || !issue || !desc) {
      statusDiv.className = 'form-status error';
      statusDiv.textContent = 'Please fill out all required fields marked with *';
      return;
    }

    submissionData.name = name;
    submissionData.phone = phone;
    submissionData.model = model;
    submissionData.issueType = issue;
    submissionData.desc = desc;

    // Reset Form
    document.getElementById('comp-name').value = '';
    document.getElementById('comp-phone').value = '';
    document.getElementById('comp-model').value = '';
    document.getElementById('comp-issue').value = '';
    document.getElementById('comp-desc').value = '';

  } else if (type === 'feedback') {
    const name = document.getElementById('feed-name').value.trim();
    const phone = document.getElementById('feed-phone').value.trim();
    const desc = document.getElementById('feed-desc').value.trim();

    if (!name || userRating === 0 || !desc) {
      statusDiv.className = 'form-status error';
      statusDiv.textContent = 'Please select a star rating and fill out all required fields *';
      return;
    }

    submissionData.name = name;
    submissionData.phone = phone;
    submissionData.rating = userRating;
    submissionData.desc = desc;

    // Reset Form
    document.getElementById('feed-name').value = '';
    document.getElementById('feed-phone').value = '';
    document.getElementById('feed-desc').value = '';
    setRating(0);

  } else if (type === 'enquiry') {
    const name = document.getElementById('enq-name').value.trim();
    const phone = document.getElementById('enq-phone').value.trim();
    const email = document.getElementById('enq-email').value.trim();
    const interest = document.getElementById('enq-product').value;
    const msg = document.getElementById('enq-msg').value.trim();

    if (!name || !phone || !interest) {
      statusDiv.className = 'form-status error';
      statusDiv.textContent = 'Please fill out all required fields marked with *';
      return;
    }

    submissionData.name = name;
    submissionData.phone = phone;
    submissionData.email = email;
    submissionData.model = interest; // Matches key mappings
    submissionData.desc = msg;

    // Reset Form
    document.getElementById('enq-name').value = '';
    document.getElementById('enq-phone').value = '';
    document.getElementById('enq-email').value = '';
    document.getElementById('enq-product').value = '';
    document.getElementById('enq-msg').value = '';
  }

  // Save submission data
  submissions.push(submissionData);
  localStorage.setItem('aqualife_submissions', JSON.stringify(submissions));

  statusDiv.className = 'form-status success';
  statusDiv.textContent = `Success! Your request has been recorded successfully.`;

  showToast(`Thank you! Your ${type} has been sent successfully.`);
}


/* ==========================================================================
   SECTION 9 — ADMIN DASHBOARD LOGIC
   ========================================================================== */

// PASSWORD PROTECTION
function promptAdmin() {
  const pwd = prompt("Enter Administration Access Password:");
  if (pwd === null) return; // Cancelled

  if (pwd === "aqualife2025") {
    document.getElementById('admin-panel').style.display = 'block';
    showToast("Access Granted. Welcome to the admin console.");

    // Refresh tables and stats
    renderAdminStats();
    renderAdminTable('all');

    // Scroll to admin dashboard
    document.getElementById('admin-panel').scrollIntoView({ behavior: 'smooth' });
  } else {
    alert("Incorrect password. Access denied!");
  }
}

function exitAdmin() {
  document.getElementById('admin-panel').style.display = 'none';
  showToast("Exited Admin mode successfully.");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// STATISTICS COUNTER
function renderAdminStats() {
  const total = submissions.length;
  const complaints = submissions.filter(s => s.type === 'complaint').length;
  const feedbacks = submissions.filter(s => s.type === 'feedback').length;
  const enquiries = submissions.filter(s => s.type === 'enquiry').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-complaints').textContent = complaints;
  document.getElementById('stat-feedback').textContent = feedbacks;
  document.getElementById('stat-enquiries').textContent = enquiries;
}

// RECORDS TABLE FILTER & RENDER
function setAdminFilter(filter) {
  adminFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`f-${filter}`).classList.add('active');
  renderAdminTable(filter);
}

function renderAdminTable(filter) {
  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = '';

  let filtered = submissions;
  if (filter !== 'all') {
    filtered = submissions.filter(s => s.type === filter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: var(--muted);">No records found.</td></tr>`;
    return;
  }

  // Sort by date newest first
  filtered.sort((a, b) => b.id - a.id);

  filtered.forEach(s => {
    let typeBadge = '';
    let details = '';

    if (s.type === 'complaint') {
      typeBadge = `<span class="admin-badge badge-complaint">Complaint</span>`;
      details = `Model: <strong>${escapeHtml(s.model || 'N/A')}</strong><br>Issue: <strong>${escapeHtml(s.issueType)}</strong>`;
    } else if (s.type === 'feedback') {
      typeBadge = `<span class="admin-badge badge-feedback">Feedback</span>`;
      details = `Rating: <strong>${'⭐'.repeat(s.rating)}</strong>`;
    } else if (s.type === 'enquiry') {
      typeBadge = `<span class="admin-badge badge-enquiry">Enquiry</span>`;
      details = `Interest: <strong>${escapeHtml(s.model || 'N/A')}</strong><br>Email: <strong>${escapeHtml(s.email || 'N/A')}</strong>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(s.timestamp)}</td>
      <td>${typeBadge}</td>
      <td><strong>${escapeHtml(s.name)}</strong></td>
      <td><a href="tel:${escapeAttr(s.phone)}">📞 ${escapeHtml(s.phone || 'N/A')}</a></td>
      <td>${details}</td>
      <td><div style="max-width: 320px; white-space: normal; word-wrap: break-word;">${escapeHtml(s.desc)}</div></td>
      <td style="text-align: center;">
        <button class="btn-delete-row" onclick="deleteEntry(${s.id})" title="Delete entry">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// DATA MODIFICATIONS (DELETE ROW, CLEAR ALL)
function deleteEntry(id) {
  if (confirm("Are you sure you want to permanently delete this customer record?")) {
    submissions = submissions.filter(s => s.id !== id);
    localStorage.setItem('aqualife_submissions', JSON.stringify(submissions));
    renderAdminStats();
    renderAdminTable(adminFilter);
    showToast("Record deleted successfully.");
  }
}

// Clear all confirmations
function clearAllData() {
  if (confirm("🚨 WARNING: Are you sure you want to delete ALL customer submissions? This action cannot be undone.")) {
    submissions = [];
    localStorage.setItem('aqualife_submissions', JSON.stringify([]));
    renderAdminStats();
    renderAdminTable(adminFilter);
    showToast("All customer records cleared successfully.");
  }
}

// EXPORT DATA TO CSV FILE WITH ESCAPING
function exportCSV() {
  let filtered = submissions;
  if (adminFilter !== 'all') {
    filtered = submissions.filter(s => s.type === adminFilter);
  }

  if (filtered.length === 0) {
    alert("No submissions available to export.");
    return;
  }

  // Build Headers
  let csvContent = "\uFEFF"; // UTF-8 BOM to handle special characters correctly in Excel
  csvContent += "ID,Timestamp,Type,Customer Name,Phone Number,Email,Star Rating,Product Model,Issue or Interest,Message Description\r\n";

  // Escape quotes and wrap csv columns helper
  const c = (val) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  filtered.forEach(s => {
    const row = [
      s.id,
      s.timestamp,
      s.type,
      s.name,
      s.phone || '',
      s.email || '',
      s.rating || '',
      s.model || '',
      s.issueType || '',
      s.desc || ''
    ];
    csvContent += row.map(c).join(",") + "\r\n";
  });

  // Download trigger
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const timestampString = new Date().toISOString().slice(0, 10).replace(/-/g, "") + "_" + new Date().toTimeString().slice(0, 8).replace(/:/g, "");

  link.setAttribute("href", url);
  link.setAttribute("download", `aqualife_records_${timestampString}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("CSV records exported successfully.");
}
