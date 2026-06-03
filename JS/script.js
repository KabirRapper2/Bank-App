// ============================================
// PREMIUM BANK APP - ENHANCED JAVASCRIPT
// ============================================

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format currency values
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format dates
 */
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    
    const container = document.querySelector('body');
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInUp 0.4s ease-out reverse';
        setTimeout(() => notification.remove(), 400);
    }, duration);
}

/**
 * Debounce function for search
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Validate email
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate amount
 */
function validateAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
}

/**
 * Animate element
 */
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = formatCurrency(end);
            clearInterval(timer);
        } else {
            element.textContent = formatCurrency(current);
        }
    }, 16);
}

// ============================================
// DATA MANAGEMENT
// ============================================

class StorageManager {
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from storage:', e);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to storage:', e);
            showNotification('Storage error. Some data may not be saved.', 'error');
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from storage:', e);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing storage:', e);
            return false;
        }
    }
}

// ============================================
// GLOBAL APPLICATION STATE
// ============================================

const AppState = {
    balance: StorageManager.get('balance', 5432.10),
    transactions: StorageManager.get('transactions', [
        { description: 'Grocery Store Purchase', amount: -45.67, date: new Date(2026, 3, 5).toLocaleDateString(), category: 'Food' },
        { description: 'Salary Deposit', amount: 3200.00, date: new Date(2026, 3, 1).toLocaleDateString(), category: 'Income' },
        { description: 'Online Payment', amount: -120.00, date: new Date(2026, 2, 28).toLocaleDateString(), category: 'Bills' },
        { description: 'ATM Withdrawal', amount: -50.00, date: new Date(2026, 2, 25).toLocaleDateString(), category: 'Cash' },
        { description: 'Utility Bill Payment', amount: -89.45, date: new Date(2026, 2, 20).toLocaleDateString(), category: 'Bills' }
    ]),
    user: StorageManager.get('user', null),
    monthlyBudget: StorageManager.get('monthlyBudget', 5000),
    darkMode: StorageManager.get('darkMode', false),
    transactionHistory: StorageManager.get('transactionHistory', [])
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Apply dark mode if enabled
    if (AppState.darkMode) {
        document.body.classList.add('dark-mode');
    }

    // Check authentication
    if (window.location.pathname.includes('dashboad.html') && !AppState.user) {
        showNotification('Please log in to access the dashboard', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    // Update UI elements
    updateBalanceDisplay();
    updateTransactionsDisplay();
    updateUserInfo();
    updateBudgetDisplay();
    renderChart();
}

function setupEventListeners() {
    // Search with debounce
    const searchInput = document.getElementById('transaction-search');
    if (searchInput) {
        searchInput.addEventListener('keyup', debounce(filterTransactions, 300));
    }

    // Window focus to refresh data
    window.addEventListener('focus', refreshAppData);
}

function refreshAppData() {
    updateBalanceDisplay();
    updateTransactionsDisplay();
    updateBudgetDisplay();
}

// ============================================
// BALANCE MANAGEMENT
// ============================================

function updateBalanceDisplay() {
    const displayElements = [
        document.querySelector('.account-summary .detail:nth-child(3) p'),
        document.getElementById('displayBalance')
    ];

    displayElements.forEach(element => {
        if (element) {
            const currentBalance = parseFloat(AppState.balance);
            element.textContent = formatCurrency(currentBalance);
            element.style.color = currentBalance < 0 ? '#dc3545' : '#28a745';
            element.classList.add('animate-pulse');
            setTimeout(() => element.classList.remove('animate-pulse'), 600);
        }
    });

    StorageManager.set('balance', AppState.balance);
}

function addBalance() {
    const amount = parseFloat(prompt('Enter amount to add to your account ($0 - $10,000):'));
    
    if (!amount) return;
    
    if (!validateAmount(amount)) {
        showNotification('Please enter a valid positive amount', 'error');
        return;
    }
    
    if (amount > 10000) {
        showNotification('Maximum deposit amount is $10,000. Contact support for larger deposits.', 'warning');
        return;
    }

    addTransaction(`Balance Deposit`, amount, new Date().toLocaleDateString(), 'Deposit');
    showNotification(`Successfully added ${formatCurrency(amount)} to your account!`, 'success');
}

// ============================================
// TRANSACTION MANAGEMENT
// ============================================

function addTransaction(description, amount, date = new Date().toLocaleDateString(), category = 'Other') {
    if (!description || !validateAmount(Math.abs(amount))) {
        showNotification('Invalid transaction data', 'error');
        return;
    }

    const transaction = {
        description,
        amount: parseFloat(amount),
        date,
        category,
        id: Date.now(),
        timestamp: new Date().toISOString()
    };

    AppState.transactions.unshift(transaction);
    AppState.balance += parseFloat(amount);
    
    // Keep transaction history for undo
    AppState.transactionHistory.push({
        action: 'add',
        transaction: transaction,
        previousBalance: AppState.balance - parseFloat(amount)
    });

    StorageManager.set('transactions', AppState.transactions);
    StorageManager.set('balance', AppState.balance);
    StorageManager.set('transactionHistory', AppState.transactionHistory);

    updateBalanceDisplay();
    updateTransactionsDisplay();
    updateBudgetDisplay();
    renderChart();
}

function updateTransactionsDisplay(filter = '') {
    const ul = document.getElementById('transaction-list');
    if (!ul) return;

    ul.innerHTML = '';
    
    const filteredTransactions = AppState.transactions.filter(t => 
        t.description.toLowerCase().includes(filter.toLowerCase()) ||
        t.category.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredTransactions.length === 0) {
        ul.innerHTML = '<li style="text-align:center; border: none;">No transactions found</li>';
        return;
    }

    filteredTransactions.slice(0, 15).forEach((transaction, index) => {
        const li = document.createElement('li');
        const isIncome = transaction.amount > 0;
        
        li.innerHTML = `
            <div style="flex: 1;">
                <strong>${transaction.description}</strong>
                <br>
                <small class="text-muted">${transaction.category} • ${transaction.date}</small>
            </div>
            <div style="text-align: right;">
                <span class="${isIncome ? 'text-success' : 'text-danger'}" style="font-weight: bold; font-size: 1.1em;">
                    ${isIncome ? '+' : ''}${formatCurrency(transaction.amount)}
                </span>
            </div>
        `;
        
        ul.appendChild(li);
    });

    // Show total count
    if (filteredTransactions.length > 15) {
        const moreInfo = document.createElement('li');
        moreInfo.style.textAlign = 'center';
        moreInfo.style.border = 'none';
        moreInfo.innerHTML = `<small class="text-muted">+${filteredTransactions.length - 15} more transactions</small>`;
        ul.appendChild(moreInfo);
    }
}

function filterTransactions() {
    const searchTerm = document.getElementById('transaction-search')?.value || '';
    updateTransactionsDisplay(searchTerm);
}

// ============================================
// USER INFORMATION
// ============================================

function updateUserInfo() {
    if (!AppState.user) return;

    const accountNumberEl = document.querySelector('.account-summary .detail:nth-child(1) p') || 
                            document.getElementById('displayAccountNumber');
    const accountHolderEl = document.querySelector('.account-summary .detail:nth-child(2) p') || 
                            document.getElementById('displayAccountHolder');
    const accountTypeEl = document.querySelector('.account-summary .detail:nth-child(4) p') || 
                          document.getElementById('displayAccountType');

    if (accountNumberEl) accountNumberEl.textContent = AppState.user.accountNumber;
    if (accountHolderEl) accountHolderEl.textContent = AppState.user.name;
    if (accountTypeEl) accountTypeEl.textContent = AppState.user.accountType || 'Checking';
}

// ============================================
// BUDGET MANAGEMENT
// ============================================

function setBudget() {
    const budgetInput = document.getElementById('monthly-budget');
    const amount = parseFloat(budgetInput?.value);

    if (!validateAmount(amount)) {
        showNotification('Please enter a valid budget amount', 'error');
        return;
    }

    AppState.monthlyBudget = amount;
    StorageManager.set('monthlyBudget', AppState.monthlyBudget);
    updateBudgetDisplay();
    showNotification(`Budget set to ${formatCurrency(amount)}`, 'success');
}

function updateBudgetDisplay() {
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const spent = AppState.transactions
        .filter(t => t.amount < 0 && new Date(t.date) >= monthStart)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const elements = {
        spent: document.getElementById('monthly-spent'),
        budget: document.getElementById('monthly-budget-display'),
        fill: document.getElementById('progress-fill')
    };

    if (elements.spent) {
        elements.spent.textContent = spent.toFixed(2);
    }

    if (elements.budget) {
        elements.budget.textContent = AppState.monthlyBudget.toFixed(2);
    }

    if (elements.fill) {
        const percentage = Math.min((spent / AppState.monthlyBudget) * 100, 100);
        elements.fill.style.width = percentage + '%';
        elements.fill.style.backgroundColor = percentage > 90 ? '#dc3545' : percentage > 75 ? '#ffc107' : '#28a745';
    }
}

// ============================================
// CHART RENDERING
// ============================================

let chartInstance = null;

function renderChart() {
    const ctx = document.getElementById('spendingChart');
    if (!ctx) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const labels = AppState.transactions.slice(0, 12).map(t => formatDate(t.date)).reverse();
    const incomeData = AppState.transactions.slice(0, 12).map(t => t.amount > 0 ? t.amount : 0).reverse();
    const expenseData = AppState.transactions.slice(0, 12).map(t => t.amount < 0 ? Math.abs(t.amount) : 0).reverse();

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: '#28a745',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: '#dc3545',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Income vs Expenses (Last 12 Transactions)',
                    font: { size: 14, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================

function transferFunds() {
    const amount = parseFloat(prompt('Enter transfer amount:'));
    const recipient = prompt('Enter recipient account number:');

    if (!amount || !recipient) return;

    if (!validateAmount(amount)) {
        showNotification('Invalid transfer amount', 'error');
        return;
    }

    if (amount > AppState.balance) {
        showNotification('Insufficient funds for this transfer', 'error');
        return;
    }

    addTransaction(`Transfer to ${recipient}`, -amount, new Date().toLocaleDateString(), 'Transfer');
    showNotification(`Successfully transferred ${formatCurrency(amount)} to account ${recipient}`, 'success');
}

function payBills() {
    const billType = prompt('Enter bill type (Electricity, Water, Gas, Internet, Phone, Other):');
    const amount = parseFloat(prompt('Enter bill amount:'));

    if (!billType || !amount) return;

    if (!validateAmount(amount)) {
        showNotification('Invalid bill amount', 'error');
        return;
    }

    if (amount > AppState.balance) {
        showNotification('Insufficient funds to pay this bill', 'error');
        return;
    }

    addTransaction(`${billType} Bill Payment`, -amount, new Date().toLocaleDateString(), 'Bills');
    showNotification(`Successfully paid ${formatCurrency(amount)} for ${billType}`, 'success');
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

function exportTransactions() {
    const csvContent = 'Description,Amount,Date,Category\n' +
        AppState.transactions
            .map(t => `"${t.description}",${t.amount},"${t.date}","${t.category}"`)
            .join('\n');

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
    link.download = `transactions_${formatDate(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Transactions exported successfully', 'success');
}

// ============================================
// THEME MANAGEMENT
// ============================================

function toggleDarkMode() {
    AppState.darkMode = !AppState.darkMode;
    document.body.classList.toggle('dark-mode');
    StorageManager.set('darkMode', AppState.darkMode);
    showNotification(`Dark mode ${AppState.darkMode ? 'enabled' : 'disabled'}`, 'info');
}

// ============================================
// MISCELLANEOUS FUNCTIONS
// ============================================

function Make_a_kid_account() {
    const kidName = prompt('Enter kid\'s name:');
    if (kidName) {
        addTransaction(`Kid Account Created for ${kidName}`, -10, new Date().toLocaleDateString(), 'Fees');
        showNotification(`Kid account created for ${kidName}!`, 'success');
    }
}

function applyForLoan() {
    const amount = parseFloat(prompt('Enter loan amount ($1,000 - $50,000):'));
    if (amount) {
        if (amount < 1000 || amount > 50000) {
            showNotification('Loan amount must be between $1,000 and $50,000', 'error');
            return;
        }
        addTransaction(`Loan Application for ${formatCurrency(amount)}`, 0, new Date().toLocaleDateString(), 'Loan');
        showNotification(`Loan application submitted for ${formatCurrency(amount)}. We'll review it within 2-3 business days.`, 'success');
    }
}

function contactSupport() {
    const message = prompt('Describe your issue:');
    if (message) {
        showNotification('Support ticket #' + Date.now() + ' created. We\'ll respond within 24 hours.', 'success');
    }
}

function logout() {
    StorageManager.remove('user');
    showNotification('You have been logged out', 'info');
    setTimeout(() => window.location.href = 'login.html', 1500);
}

function viewStatements() {
    if (AppState.transactions.length === 0) {
        showNotification('No transactions found', 'warning');
        return;
    }
    showNotification(`Showing ${AppState.transactions.length} transactions`, 'info');
}