// GLOBAL DATABASE VARIABLES
let submissions = [];
let adminFilter = 'all';
let products = [];
let activeProductFilter = 'all';

// PRODUCT CATEGORY CONFIG
const PRODUCT_CATEGORIES = [
  { key: 'aquaguard', label: 'Aquaguard RO', icon: '💧' },
  { key: 'havells',   label: 'Havells RO',   icon: '🌊' },
  { key: 'glen',      label: 'Glen Appliances', icon: '🔥' },
  { key: 'other',     label: 'Other',         icon: '📦' }
];

// INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Submissions Database
  if (!localStorage.getItem('aqualife_submissions')) {
    localStorage.setItem('aqualife_submissions', JSON.stringify([]));
  }
  submissions = JSON.parse(localStorage.getItem('aqualife_submissions'));

  // 2. Initialize Products Database
  initProducts();

  // 3. Render public product section
  renderPublicProducts();

  // 4. Scroll Fade-in logic
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
    renderAdminProducts();


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


/* ==========================================================================
   SECTION 10 — PRODUCT CATALOG MANAGEMENT LOGIC
   ========================================================================== */

// INITIALIZE PRODUCTS FROM LOCALSTORAGE
function initProducts() {
  if (!localStorage.getItem('aqualife_products')) {
    localStorage.setItem('aqualife_products', JSON.stringify([]));
  }
  products = JSON.parse(localStorage.getItem('aqualife_products'));
}

// SAVE PRODUCTS TO LOCALSTORAGE
function saveProducts() {
  localStorage.setItem('aqualife_products', JSON.stringify(products));
}

// IMAGE PREVIEW HANDLER (shows live thumbnail before saving)
function handleProductImagePreview(input) {
  const preview = document.getElementById('product-img-preview');
  const placeholder = document.getElementById('product-img-placeholder');

  if (input.files && input.files[0]) {
    const file = input.files[0];

    // Security: Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Invalid file. Please select a valid image file (JPG, PNG, WEBP).');
      input.value = '';
      return;
    }

    // Security: Validate file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image too large! Please select an image under 5 MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
}

// ADD PRODUCT — Validate, encode image to Base64, save to localStorage
function addProduct(event) {
  event.preventDefault();

  const nameInput     = document.getElementById('prod-name');
  const priceInput    = document.getElementById('prod-price');
  const descInput     = document.getElementById('prod-desc');
  const imageInput    = document.getElementById('prod-image');
  const categoryInput = document.getElementById('prod-category');
  const statusDiv     = document.getElementById('status-product');

  const name     = nameInput.value.trim();
  const price    = priceInput.value.trim();
  const desc     = descInput.value.trim();
  const category = categoryInput.value;

  // Reset status
  statusDiv.className = 'form-status';
  statusDiv.textContent = '';

  // Validate required fields
  if (!name || !price || !desc || !category) {
    statusDiv.className = 'form-status error';
    statusDiv.textContent = 'Please fill in all required fields including Category.';
    return;
  }

  // Validate price is a positive number
  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    statusDiv.className = 'form-status error';
    statusDiv.textContent = 'Please enter a valid price (e.g. 4999).';
    return;
  }

  // If image is selected, encode it as Base64; otherwise save without image
  if (imageInput.files && imageInput.files[0]) {
    const file = imageInput.files[0];

    // Double-check security validations
    if (!file.type.startsWith('image/')) {
      statusDiv.className = 'form-status error';
      statusDiv.textContent = 'Invalid image file. Only JPG, PNG, WEBP formats allowed.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      statusDiv.className = 'form-status error';
      statusDiv.textContent = 'Image is too large. Maximum allowed size is 5 MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      saveNewProduct(name, price, desc, category, e.target.result, statusDiv, nameInput, priceInput, descInput, categoryInput, imageInput);
    };
    reader.readAsDataURL(file);
  } else {
    saveNewProduct(name, price, desc, category, null, statusDiv, nameInput, priceInput, descInput, categoryInput, imageInput);
  }
}

// INTERNAL: Save product data and refresh views
function saveNewProduct(name, price, desc, category, imageData, statusDiv, nameInput, priceInput, descInput, categoryInput, imageInput) {
  const newProduct = {
    id: Date.now(),
    name: name,
    price: price,
    desc: desc,
    category: category,   // e.g. 'aquaguard' | 'havells' | 'glen' | 'other'
    image: imageData,     // Base64 string or null
    timestamp: new Date().toLocaleString()
  };

  products.push(newProduct);
  saveProducts();

  // Refresh both admin and public views
  renderAdminProducts();
  renderPublicProducts();

  // Reset form fields
  nameInput.value     = '';
  priceInput.value    = '';
  descInput.value     = '';
  categoryInput.value = '';
  imageInput.value    = '';
  const preview = document.getElementById('product-img-preview');
  const placeholder = document.getElementById('product-img-placeholder');
  preview.src = '';
  preview.style.display = 'none';
  if (placeholder) placeholder.style.display = 'flex';

  statusDiv.className = 'form-status success';
  statusDiv.textContent = 'Product added successfully! It is now live on the website.';
  showToast(`Product "${name}" added to catalog successfully.`);
}

// DELETE A PRODUCT BY ID
function deleteProduct(id) {
  if (confirm('Are you sure you want to permanently remove this product from the catalog?')) {
    products = products.filter(p => p.id !== id);
    saveProducts();
    renderAdminProducts();
    renderPublicProducts();
    showToast('Product removed from catalog.');
  }
}

// CLEAR ALL PRODUCTS FROM CATALOG
function clearAllProducts() {
  if (products.length === 0) {
    showToast('No products in catalog to clear.');
    return;
  }
  if (confirm('🚨 Are you sure you want to permanently delete ALL products from the catalog? This cannot be undone.')) {
    products = [];
    saveProducts();

    // Reset category filter back to 'all'
    activeProductFilter = 'all';
    document.querySelectorAll('.prod-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === 'all');
    });

    renderAdminProducts();
    renderPublicProducts();
    showToast('All products have been cleared from the catalog.');
  }
}



// RENDER ADMIN PRODUCT GRID
function renderAdminProducts() {
  const grid = document.getElementById('admin-products-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="no-products-msg">
        <div class="no-products-icon">📦</div>
        <p>No products added yet. Use the form above to add your first product.</p>
      </div>`;
    // Update count badge
    const countBadge = document.getElementById('admin-products-count');
    if (countBadge) countBadge.textContent = 0;
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'admin-product-card';

    const imgHtml = p.image
      ? `<img src="${p.image}" alt="${escapeAttr(p.name)}" class="admin-product-img" />`
      : `<div class="admin-product-no-img">🖼️<span>No Image</span></div>`;

    // Category badge
    const catConfig = PRODUCT_CATEGORIES.find(c => c.key === p.category);
    const catLabel  = catConfig ? catConfig.label : 'Other';
    const catIcon   = catConfig ? catConfig.icon  : '📦';

    card.innerHTML = `
      ${imgHtml}
      <div class="admin-product-info">
        <span class="admin-cat-badge cat-${escapeAttr(p.category || 'other')}">${catIcon} ${escapeHtml(catLabel)}</span>
        <h5 class="admin-product-name">${escapeHtml(p.name)}</h5>
        <div class="admin-product-price">₹${escapeHtml(p.price)}</div>
        <p class="admin-product-desc">${escapeHtml(p.desc)}</p>
        <div class="admin-product-footer">
          <span class="admin-product-date">Added: ${escapeHtml(p.timestamp)}</span>
          <button class="btn-delete-row" onclick="deleteProduct(${p.id})" title="Delete product">🗑️ Remove</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  // Update product count badge
  const countBadge = document.getElementById('admin-products-count');
  if (countBadge) countBadge.textContent = products.length;
}

// SET ACTIVE PRODUCT CATEGORY FILTER (public page)
function setProductFilter(filterKey) {
  activeProductFilter = filterKey;

  // Update active button state
  document.querySelectorAll('.prod-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterKey);
  });

  renderPublicProducts();
}

// RENDER PUBLIC PRODUCTS SECTION (with category filter)
function renderPublicProducts() {
  const section = document.getElementById('public-products-section');
  const grid    = document.getElementById('public-products-grid');
  const noMsg   = document.getElementById('pub-no-products-msg');
  if (!grid || !section) return;

  // Show/hide the whole section
  if (products.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';

  // Build category filter tab counts
  PRODUCT_CATEGORIES.forEach(cat => {
    const countEl = document.getElementById(`prod-filter-count-${cat.key}`);
    if (countEl) countEl.textContent = products.filter(p => p.category === cat.key).length;
  });
  const allCountEl = document.getElementById('prod-filter-count-all');
  if (allCountEl) allCountEl.textContent = products.length;

  // Filter by active category
  const filtered = activeProductFilter === 'all'
    ? products
    : products.filter(p => p.category === activeProductFilter);

  grid.innerHTML = '';

  if (filtered.length === 0) {
    const catConfig = PRODUCT_CATEGORIES.find(c => c.key === activeProductFilter);
    grid.innerHTML = `
      <div class="pub-no-results">
        <div class="pub-no-results-icon">${catConfig ? catConfig.icon : '📦'}</div>
        <p>No <strong>${catConfig ? catConfig.label : ''}</strong> products have been added yet.</p>
      </div>`;
    initFadeIn();
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('a');
    card.className = 'pub-product-card fade-in';
    card.href = `product.html?id=${p.id}`;
    card.setAttribute('aria-label', `View details for ${p.name}`);

    const catConfig = PRODUCT_CATEGORIES.find(c => c.key === p.category);
    const catLabel  = catConfig ? catConfig.label : 'Other';
    const catIcon   = catConfig ? catConfig.icon  : '📦';
    const catKey    = p.category || 'other';

    const imgInner = p.image
      ? `<img src="${p.image}" alt="${escapeAttr(p.name)}" class="pub-product-img" />`
      : `<div class="pub-product-no-img-icon">${catIcon}</div>`;

    card.innerHTML = `
      <div class="pub-card-img-wrap">
        ${imgInner}
        <div class="pub-card-img-overlay"></div>
        <span class="pub-card-cat-badge pub-cat-${escapeAttr(catKey)}">${catIcon} ${escapeHtml(catLabel)}</span>
        <div class="pub-card-price-tag">₹${escapeHtml(p.price)}</div>
      </div>
      <div class="pub-card-body">
        <h4 class="pub-card-name">${escapeHtml(p.name)}</h4>
        <p class="pub-card-desc">${escapeHtml(p.desc)}</p>
        <div class="pub-card-footer">
          <div class="pub-card-view-btn">View Details <span class="pub-card-arrow">→</span></div>
          <button class="pub-card-quote-btn" onclick="event.preventDefault(); event.stopPropagation(); scrollToFormsTab('enquiry')">Get Quote</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  // Re-run fade-in observer for newly added cards
  initFadeIn();
}

