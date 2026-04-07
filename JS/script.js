// JavaScript for Bank App Dashboard - Enhanced for the Best Bank App Ever!

// Initialize app data
let balance = parseFloat(localStorage.getItem('balance')) || 5432.10;
let transactions = JSON.parse(localStorage.getItem('transactions')) || [
    { description: 'Grocery Store Purchase', amount: -45.67, date: 'April 5, 2026', category: 'Food' },
    { description: 'Salary Deposit', amount: 3200.00, date: 'April 1, 2026', category: 'Income' },
    { description: 'Online Payment', amount: -120.00, date: 'March 28, 2026', category: 'Bills' },
    { description: 'ATM Withdrawal', amount: -50.00, date: 'March 25, 2026', category: 'Cash' },
    { description: 'Utility Bill Payment', amount: -89.45, date: 'March 20, 2026', category: 'Bills' }
];

let user = JSON.parse(localStorage.getItem('user')) || null;
let registeredUser = JSON.parse(localStorage.getItem('registeredUser')) || null;
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 5000;
let darkMode = localStorage.getItem('darkMode') === 'true';

if (user && user.balance !== undefined) {
    balance = parseFloat(user.balance);
}

// Check login on dashboard
if (window.location.pathname.includes('dashboad.html') && !user) {
    window.location.href = 'login.html';
}

// Update UI on load
document.addEventListener('DOMContentLoaded', function() {
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
    updateBalanceDisplay();
    updateTransactionsDisplay();
    updateUserInfo();
    updateBudgetDisplay();
    renderChart();
});

// Refresh data when page becomes visible (user returns from other pages)
window.addEventListener('focus', function() {
    updateBalanceDisplay();
    updateTransactionsDisplay();
    updateBudgetDisplay();
    renderChart();
});

// Toggle dark mode
function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkMode);
}

// Update balance display
function updateBalanceDisplay() {
    const balanceElement = document.querySelector('.account-summary .detail:nth-child(3) p');
    if (balanceElement) {
        balanceElement.textContent = '$' + balance.toFixed(2);
        balanceElement.style.color = balance < 0 ? '#dc3545' : '#28a745';
    }
    localStorage.setItem('balance', balance);
}

// Update transactions display
function updateTransactionsDisplay(filter = '') {
    const ul = document.getElementById('transaction-list');
    if (!ul) return;
    ul.innerHTML = '';
    const filteredTransactions = transactions.filter(t => 
        t.description.toLowerCase().includes(filter.toLowerCase()) ||
        t.category.toLowerCase().includes(filter.toLowerCase())
    );
    filteredTransactions.slice(0, 10).forEach(transaction => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${transaction.description} (${transaction.category})</span>
            <span style="color: ${transaction.amount < 0 ? '#dc3545' : '#28a745'}">$${transaction.amount.toFixed(2)}</span>
            <small>${transaction.date}</small>
        `;
        ul.appendChild(li);
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateBudgetDisplay();
}

// Filter transactions
function filterTransactions() {
    const searchTerm = document.getElementById('transaction-search').value;
    updateTransactionsDisplay(searchTerm);
}

// Update user info
function updateUserInfo() {
    if (!user) return;
    document.querySelector('.account-summary .detail:nth-child(1) p').textContent = user.accountNumber;
    document.querySelector('.account-summary .detail:nth-child(2) p').textContent = user.name;
    document.querySelector('.account-summary .detail:nth-child(4) p').textContent = user.accountType || 'Checking';
}

// Set budget
function setBudget() {
    const budgetInput = document.getElementById('monthly-budget');
    monthlyBudget = parseFloat(budgetInput.value) || 5000;
    localStorage.setItem('monthlyBudget', monthlyBudget);
    updateBudgetDisplay();
}

// Update budget display
function updateBudgetDisplay() {
    const spent = transactions.filter(t => t.amount < 0 && new Date(t.date) > new Date(new Date().getFullYear(), new Date().getMonth(), 1)).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    document.getElementById('monthly-spent').textContent = spent.toFixed(2);
    document.getElementById('monthly-budget-display').textContent = monthlyBudget.toFixed(2);
    const progressFill = document.getElementById('progress-fill');
    const percentage = Math.min((spent / monthlyBudget) * 100, 100);
    progressFill.style.width = percentage + '%';
    progressFill.style.backgroundColor = percentage > 90 ? '#dc3545' : '#28a745';
}

// Add transaction
function addTransaction(description, amount, date = new Date().toLocaleDateString(), category = 'Other') {
    transactions.unshift({ description, amount, date, category });
    balance += amount;
    updateBalanceDisplay();
    updateTransactionsDisplay();
    renderChart();
}

// Export transactions to CSV
function exportTransactions() {
    const csvContent = 'data:text/csv;charset=utf-8,' + 
        'Description,Amount,Date,Category\n' + 
        transactions.map(t => `${t.description},${t.amount},${t.date},${t.category}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Update user info
function updateUserInfo() {
    document.querySelector('.account-summary .detail:nth-child(1) p').textContent = user.accountNumber;
    document.querySelector('.account-summary .detail:nth-child(2) p').textContent = user.name;
    document.querySelector('.account-summary .detail:nth-child(4) p').textContent = user.accountType || 'Checking';
}

// Make a kid account
function Make_a_kid_account() {
    const kidName = prompt('Enter kid\'s name:');
    if (kidName) {
        addTransaction(`Kid Account Created for ${kidName}`, -10); // Small fee
        alert(`Kid account created for ${kidName}!`);
    }
}

// Transfer funds
function transferFunds() {
    const amount = parseFloat(prompt('Enter transfer amount:'));
    const recipient = prompt('Enter recipient account:');
    if (amount && recipient && amount <= balance) {
        addTransaction(`Transfer to ${recipient}`, -amount);
        alert(`Transferred $${amount} to ${recipient}`);
    } else {
        alert('Invalid transfer amount or insufficient funds');
    }
}

// Pay bills
function payBills() {
    const billType = prompt('Enter bill type (e.g., Electricity, Water):');
    const amount = parseFloat(prompt('Enter bill amount:'));
    if (billType && amount && amount <= balance) {
        addTransaction(`${billType} Bill Payment`, -amount);
        alert(`Paid $${amount} for ${billType}`);
    } else {
        alert('Invalid bill payment');
    }
}

// Add balance to account
function addBalance() {
    const amount = parseFloat(prompt('Enter amount to add to your account:'));
    if (amount && amount > 0 && amount <= 10000) { // Max $10,000 per deposit for security
        addTransaction(`Balance Deposit`, amount, new Date().toLocaleDateString(), 'Deposit');
        alert(`Successfully added $${amount.toFixed(2)} to your account!`);
    } else if (amount > 10000) {
        alert('Maximum deposit amount is $10,000. Please contact support for larger deposits.');
    } else {
        alert('Please enter a valid positive amount.');
    }
}

// View statements (placeholder)
function viewStatements() {
    alert('Statement feature coming soon. Current transactions:\n' + transactions.map(t => `${t.description}: $${t.amount}`).join('\n'));
}

// Apply for loan
function applyForLoan() {
    const amount = parseFloat(prompt('Enter loan amount:'));
    if (amount) {
        addTransaction(`Loan Application for $${amount}`, 0); // No immediate change
        alert(`Loan application submitted for $${amount}`);
    }
}

// Contact support
function contactSupport() {
    const message = prompt('Enter your message:');
    if (message) {
        alert('Support ticket created. We\'ll get back to you soon.');
    }
}

// Render chart
function renderChart() {
    const ctx = document.getElementById('spendingChart');
    if (!ctx) return;

    const labels = transactions.slice(0, 7).map(t => t.date).reverse();
    const data = transactions.slice(0, 7).map(t => Math.abs(t.amount)).reverse();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Transaction Amounts',
                data: data,
                borderColor: '#004080',
                backgroundColor: 'rgba(0, 64, 128, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Recent Transaction Amounts'
                }
            }
        }
    });
}

// Simulate login
function login() {
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    if (username && password) {
        user = { name: username, accountNumber: '1234567890' };
        localStorage.setItem('user', JSON.stringify(user));
        updateUserInfo();
        alert('Logged in successfully!');
    }
}

// Logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}