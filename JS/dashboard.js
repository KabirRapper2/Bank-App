document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const notifBtn = document.getElementById('notifBtn');
  const notifDot = document.getElementById('notifDot');
  const userBtn = document.getElementById('userBtn');
  const userDropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('logoutBtn');
  const navSearch = document.getElementById('navSearch');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  if (notifBtn) {
    notifBtn.addEventListener('click', function () {
      notifDot.style.display = 'none';
      renderNotifications();
    });
  }

  if (userBtn && userDropdown) {
    userBtn.addEventListener('click', function (e) {
      e.preventDefault();
      userDropdown.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('open');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      sessionStorage.clear();
      localStorage.clear();
      location.href = 'login.html';
    });
  }

  if (navSearch) {
    navSearch.addEventListener('input', function (e) {
      const q = e.target.value.trim().toLowerCase();
      document.dispatchEvent(new CustomEvent('app:search', { detail: q }));
    });
  }

  seedMockData();
  renderUser();
  renderAccountSummary();
  renderRecentTransactions();

  function seedMockData() {
    if (!localStorage.getItem('accounts')) {
      const accounts = {
        user: { name: 'Sanjay Patel', avatar: '', email: 'sanjay@example.com' },
        balances: [
          { id: 'CHK-001', type: 'Checking', balance: 4820.5 },
          { id: 'SAV-002', type: 'Savings', balance: 15230.75 }
        ],
        recent: [
          { id: 1, date: '2026-06-03', desc: 'Salary', amount: 2500, type: 'credit' },
          { id: 2, date: '2026-06-02', desc: 'Electricity Bill', amount: -120.45, type: 'debit' },
          { id: 3, date: '2026-05-30', desc: 'Grocery Store', amount: -85.2, type: 'debit' }
        ],
        notifications: [{ id: 1, text: 'Your statement is ready' }, { id: 2, text: 'Unusual login attempt blocked' }]
      };
      localStorage.setItem('accounts', JSON.stringify(accounts));
    }
  }

  function getData() {
    return JSON.parse(localStorage.getItem('accounts') || '{}');
  }

  function renderUser() {
    const data = getData();
    const nameEl = document.getElementById('username');
    if (nameEl && data.user) nameEl.textContent = data.user.name;
  }

  function renderAccountSummary() {
    const container = document.querySelector('.account-details');
    if (!container) return;
    const data = getData();
    container.innerHTML = '';
    (data.balances || []).forEach(function (b) {
      const card = document.createElement('div');
      card.className = 'detail';
      const title = document.createElement('h4');
      title.textContent = b.type;
      const value = document.createElement('p');
      value.textContent = formatCurrency(b.balance);
      card.appendChild(title);
      card.appendChild(value);
      container.appendChild(card);
    });
  }

  function renderRecentTransactions(filter) {
    const table = document.querySelector('#recentTransactions tbody');
    if (!table) return;
    const data = getData();
    const list = (data.recent || []).slice(0, 12).filter(function (t) {
      if (!filter) return true;
      const q = String(filter).toLowerCase();
      return String(t.desc).toLowerCase().includes(q) || String(t.amount).toLowerCase().includes(q) || String(t.date).includes(q);
    });
    table.innerHTML = '';
    list.forEach(function (t) {
      const tr = document.createElement('tr');
      const d1 = document.createElement('td'); d1.textContent = t.date; tr.appendChild(d1);
      const d2 = document.createElement('td'); d2.textContent = t.desc; tr.appendChild(d2);
      const d3 = document.createElement('td'); d3.textContent = formatCurrency(t.amount); tr.appendChild(d3);
      table.appendChild(tr);
    });
  }

  function renderNotifications() {
    const data = getData();
    const list = data.notifications || [];
    alert(list.map(function (n) { return n.text; }).join('\n'));
  }

  function formatCurrency(n) {
    const num = Number(n) || 0;
    return (num < 0 ? '-' : '') + '₹' + Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  document.addEventListener('app:search', function (e) {
    renderRecentTransactions(e.detail);
  });
});
