const API_BASE = '/api';
let token = localStorage.getItem('token') || null;
let currentAlumniList = [];

function navigate(viewName) {
  if ((viewName === 'admin' || viewName === 'cms') && !token) {
    viewName = 'admin-login';
  }

  document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (viewName === 'directory') loadAlumni();
  if (viewName === 'events') loadEvents();
  if (viewName === 'gallery') loadGallery();
  if (viewName === 'admin') loadAlumni();
  lucide.createIcons();
}

async function loadCMS() {
  try {
    const res = await fetch(`${API_BASE}/cms`);
    const cms = await res.json();
    if (cms.hero_title) document.getElementById('cms-render-hero-title').textContent = cms.hero_title;
    if (cms.hero_desc) document.getElementById('cms-render-hero-desc').textContent = cms.hero_desc;
    if (cms.hero_banner) document.getElementById('home-banner-img').src = cms.hero_banner;
    if (cms.notice_title) document.getElementById('home-notice-title').textContent = cms.notice_title;
    if (cms.notice_date) document.getElementById('home-notice-date').textContent = cms.notice_date;
    if (cms.notice_desc) document.getElementById('home-notice-desc').textContent = cms.notice_desc;
    if (cms.contact_address) document.getElementById('disp-contact-address').innerHTML = cms.contact_address.replace(/\n/g, '<br>');
    if (cms.contact_emails) document.getElementById('disp-contact-email').innerHTML = cms.contact_emails.replace(/\n/g, '<br>');
    if (cms.contact_phone) document.getElementById('disp-contact-phone').textContent = cms.contact_phone;
  } catch (err) {
    console.error('CMS fetch failed:', err);
  }
}

async function loadAlumni() {
  try {
    const url = token ? `${API_BASE}/alumni?status=all` : `${API_BASE}/alumni`;
    const res = await fetch(url);
    currentAlumniList = await res.json();
    renderDirectory(currentAlumniList.filter(a => a.status === 'Approved'));
    if (token) renderAdminTable(currentAlumniList);
  } catch (err) {
    console.error('Alumni fetch failed:', err);
  }
}

function renderDirectory(items) {
  const grid = document.getElementById('directory-grid');
  if (!grid) return;
  grid.innerHTML = items.map(a => `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition">
      <div class="flex items-center gap-4">
        <img src="${a.avatar}" alt="${a.name}" class="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0">
        <div>
          <h3 class="font-bold text-slate-900 leading-tight">${a.name}</h3>
          <p class="text-xs text-slate-500 font-medium">Reg: ${a.reg_no}</p>
          <p class="text-xs text-slate-600 mt-1"><span class="font-semibold">Batch:</span> ${a.batch} • <span class="font-semibold">Dept:</span> ${a.dept}</p>
        </div>
      </div>
      <button onclick="viewUserProfile(${a.id})" class="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg transition">
        View
      </button>
    </div>
  `).join('');
  lucide.createIcons();
}

function viewUserProfile(id) {
  const user = currentAlumniList.find(u => u.id === id);
  if (!user) return;
  document.getElementById('prof-name').textContent = user.name;
  document.getElementById('prof-reg').textContent = user.reg_no;
  document.getElementById('prof-batch').textContent = user.batch;
  document.getElementById('prof-dept').textContent = user.dept;
  document.getElementById('prof-email').textContent = user.email;
  document.getElementById('prof-phone').textContent = user.phone || 'N/A';
  document.getElementById('prof-address').textContent = user.address || 'Dhaka, Bangladesh';
  document.getElementById('prof-img').src = user.avatar;
  navigate('profile');
}

function renderAdminTable(items) {
  const tbody = document.getElementById('admin-table-body');
  if (!tbody) return;
  tbody.innerHTML = items.map(user => `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-4 py-3 font-medium text-slate-900 flex items-center gap-2.5">
        <img src="${user.avatar}" class="w-7 h-7 rounded-full object-cover">
        <div>
          <p class="leading-none font-bold">${user.name}</p>
          <span class="text-[11px] text-slate-400">${user.reg_no}</span>
        </div>
      </td>
      <td class="px-4 py-3 text-slate-600">${user.dept}</td>
      <td class="px-4 py-3 text-slate-600">${user.batch}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${user.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          ${user.status}
        </span>
      </td>
      <td class="px-4 py-3 text-xs space-x-1">
        ${user.status === 'Pending' 
          ? `<button onclick="approveAlumnus(${user.id})" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium">Approve</button>` 
          : `<span class="text-slate-400">Verified</span>`
        }
      </td>
    </tr>
  `).join('');
}

async function approveAlumnus(id) {
  await fetch(`${API_BASE}/alumni/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status: 'Approved' })
  });
  loadAlumni();
}

async function loadEvents() {
  const res = await fetch(`${API_BASE}/events`);
  const events = await res.json();
  const container = document.getElementById('events-grid-container');
  if (!container) return;
  container.innerHTML = events.map(e => `
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
      <img src="${e.image}" class="w-full h-44 object-cover">
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold text-brand-600 uppercase tracking-wide">${e.category}</span>
          <h3 class="font-bold text-slate-900 text-lg mt-1">${e.title}</h3>
          <p class="text-xs text-slate-500 mt-1">${e.event_date} • ${e.location}</p>
          <p class="text-xs text-slate-600 mt-2">${e.description}</p>
        </div>
        <button onclick="alert('RSVP confirmed for ' + '${e.title}')" class="mt-4 w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition">
          RSVP Attendance
        </button>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

async function loadGallery() {
  const res = await fetch(`${API_BASE}/gallery`);
  const photos = await res.json();
  const container = document.getElementById('gallery-container');
  if (!container) return;
  container.innerHTML = photos.map(p => `
    <div class="rounded-xl overflow-hidden shadow-sm aspect-video bg-slate-100 group relative">
      <img src="${p.url}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-end text-white">
        <p class="font-bold text-sm">${p.title}</p>
        <span class="text-xs text-slate-300">${p.category}</span>
      </div>
    </div>
  `).join('');
}

async function handleRegister(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('reg-name').value,
    reg_no: document.getElementById('reg-no').value,
    email: document.getElementById('reg-email').value,
    phone: document.getElementById('reg-phone').value,
    batch: document.getElementById('reg-batch').value,
    dept: document.getElementById('reg-dept').value,
    address: document.getElementById('reg-address').value,
    avatar: document.getElementById('reg-avatar').value
  };

  const res = await fetch(`${API_BASE}/alumni/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (res.ok) {
    alert('Registration submitted successfully! Your account is queued for admin approval.');
    e.target.reset();
    navigate('home');
  } else {
    alert(data.error);
  }
}

function fillDemoCredentials() {
  document.getElementById('login-email').value = 'admin@alumni.org';
  document.getElementById('login-password').value = 'admin123';
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    token = data.token;
    localStorage.setItem('token', token);
    updateAuthUI();
    navigate('admin');
  } else {
    document.getElementById('login-error-alert').classList.remove('hidden');
    document.getElementById('login-error-text').textContent = data.error;
  }
}

function logoutAdmin() {
  token = null;
  localStorage.removeItem('token');
  updateAuthUI();
  navigate('home');
}

function updateAuthUI() {
  const loggedOut = document.getElementById('nav-logged-out');
  const loggedIn = document.getElementById('nav-logged-in');
  if (token) {
    loggedOut.classList.add('hidden');
    loggedIn.classList.remove('hidden');
    loggedIn.classList.add('flex');
  } else {
    loggedOut.classList.remove('hidden');
    loggedIn.classList.add('hidden');
    loggedIn.classList.remove('flex');
  }
}

async function saveCmsHero() {
  const settings = {
    hero_title: document.getElementById('cms-hero-title').value,
    hero_desc: document.getElementById('cms-hero-desc').value,
    hero_banner: document.getElementById('cms-hero-banner').value
  };
  await fetch(`${API_BASE}/cms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(settings)
  });
  alert('CMS updated successfully!');
  loadCMS();
}

document.addEventListener('DOMContentLoaded', () => {
  loadCMS();
  updateAuthUI();
  lucide.createIcons();
});
