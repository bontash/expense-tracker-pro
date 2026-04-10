// ==================== DATA MANAGEMENT ====================
class ExpenseTrackerApp {
    constructor() {
        this.accounts = [];
        this.categories = [];
        this.transactions = [];
        this.budgets = [];
        this.savings = [];
        this.currentMonth = new Date().toISOString().substring(0, 7);
        this.selectedAccount = null;
        this.selectedCategory = null;
        this.loadData();
        this.initializeApp();
    }

    loadData() {
        const saved = localStorage.getItem('expenseTrackerData');
        if (saved) {
            const data = JSON.parse(saved);
            this.accounts = data.accounts || [];
            this.categories = data.categories || [];
            this.transactions = data.transactions || [];
            this.budgets = data.budgets || [];
            this.savings = data.savings || [];
        } else {
            this.initializeDefaultData();
        }
    }

    initializeDefaultData() {
        // Updated categories
        this.categories = [
            { id: 1,  name: 'Groceries',     icon: '🛒', desc: 'Supermarket and food shopping' },
            { id: 2,  name: 'Restaurants',   icon: '🍽️', desc: 'Eating out, deliveries' },
            { id: 3,  name: 'Shopping',      icon: '🛍️', desc: 'Clothes, electronics, other shopping' },
            { id: 4,  name: 'Travel',        icon: '✈️', desc: 'Transport, trips, holidays' },
            { id: 5,  name: 'Entertainment', icon: '🎭', desc: 'Movies, games, subscriptions, going out' },
            { id: 6,  name: 'Loans',         icon: '💳', desc: 'Loan payments, credit installments' },
            { id: 7,  name: 'Salary',        icon: '💼', desc: 'Income from work' },
            { id: 8,  name: 'Utilities',     icon: '💡', desc: 'Electricity, gas, internet, phone' },
            { id: 9,  name: 'Beauty',        icon: '💄', desc: 'Cosmetics, hair, grooming' },
            { id: 10, name: 'Health',        icon: '🩺', desc: 'Medical, pharmacy, insurance' },
            { id: 11, name: 'Sport',         icon: '🏋️', desc: 'Gym, sports, equipment' },
            { id: 12, name: 'Savings',       icon: '🏦', desc: 'Money moved into savings' }
        ];

        // Pre-loaded accounts
        this.accounts = [
            { id: 1, name: 'Edenred',     type: 'Credit Card', balance: 0 },
            { id: 2, name: 'Trading 212', type: 'Investment',  balance: 0 },
            { id: 3, name: 'Cash',        type: 'Cash',        balance: 0 },
            { id: 4, name: 'BCR',         type: 'Checking',    balance: 0 },
            { id: 5, name: 'Revolut',     type: 'Checking',    balance: 0 }
        ];

        this.saveData();
    }

    saveData() {
        localStorage.setItem('expenseTrackerData', JSON.stringify({
            accounts: this.accounts,
            categories: this.categories,
            transactions: this.transactions,
            budgets: this.budgets,
            savings: this.savings
        }));
    }

    initializeApp() {
        this.renderAccounts();
        this.renderCategories();
        this.initializeMonthlyTabs();
        this.setCurrentDate();
        this.updateYearlyStats();
        this.renderBudgets();
        this.renderSavings();
    }

    addAccount(name, initialBalance, type) {
        const account = {
            id: Date.now(),
            name,
            type,
            balance: parseFloat(initialBalance)
        };
        this.accounts.push(account);
        this.saveData();
        this.renderAccounts();
    }

    addCategory(name, icon, desc) {
        const category = {
            id: Date.now(),
            name,
            icon: icon || '📁',
            desc
        };
        this.categories.push(category);
        this.saveData();
        this.renderCategories();
    }

    addTransaction(accountId, categoryId, amount, type, date, note) {
        const transaction = {
            id: Date.now(),
            accountId: parseInt(accountId),
            categoryId: parseInt(categoryId),
            amount: parseFloat(amount),
            type,
            date,
            note
        };

        const account = this.accounts.find(a => a.id === transaction.accountId);
        if (type === 'expense') {
            account.balance -= transaction.amount;
        } else {
            account.balance += transaction.amount;
        }

        this.transactions.push(transaction);
        this.saveData();
        this.updateMonthlyView();
        this.updateYearlyStats();
        this.renderBudgets();
        this.renderAccounts();
    }

    deleteTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        const account = this.accounts.find(a => a.id === transaction.accountId);
        if (transaction.type === 'expense') {
            account.balance += transaction.amount;
        } else {
            account.balance -= transaction.amount;
        }

        this.transactions = this.transactions.filter(t => t.id !== transactionId);
        this.saveData();
        this.updateMonthlyView();
        this.updateYearlyStats();
        this.renderBudgets();
        this.renderAccounts();
    }

    updateTransaction(transactionId, updates) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        const account = this.accounts.find(a => a.id === transaction.accountId);
        
        if (transaction.type === 'expense') {
            account.balance += transaction.amount;
        } else {
            account.balance -= transaction.amount;
        }

        Object.assign(transaction, updates);

        if (transaction.type === 'expense') {
            account.balance -= transaction.amount;
        } else {
            account.balance += transaction.amount;
        }

        this.saveData();
        this.updateMonthlyView();
        this.updateYearlyStats();
        this.renderBudgets();
        this.renderAccounts();
    }

    addBudget(categoryId, amount, period) {
        const budget = {
            id: Date.now(),
            categoryId: parseInt(categoryId),
            amount: parseFloat(amount),
            period,
            createdDate: new Date().toISOString()
        };
        this.budgets.push(budget);
        this.saveData();
        this.renderBudgets();
    }

    addSavingsGoal(name, target, current, deadline) {
        const goal = {
            id: Date.now(),
            name,
            target: parseFloat(target),
            current: parseFloat(current),
            deadline,
            createdDate: new Date().toISOString()
        };
        this.savings.push(goal);
        this.saveData();
        this.renderSavings();
    }

    renderAccounts() {
        const accountsList = document.getElementById('accountsList');
        accountsList.innerHTML = this.accounts.map(acc => `
            <div class="card" onclick="app.selectAccount(${acc.id})">
                <div class="card-header">
                    <div class="card-title">${acc.name}</div>
                    <div class="card-icon">👛</div>
                </div>
                <div class="card-amount">RON ${acc.balance.toFixed(2)}</div>
                <div class="card-subtitle">${acc.type}</div>
            </div>
        `).join('');
    }

    selectAccount(accountId) {
        this.selectedAccount = accountId;
        document.getElementById('accountsList').style.display = 'none';
        document.getElementById('accountDetail').style.display = 'block';

        const account = this.accounts.find(a => a.id === accountId);
        document.getElementById('accountDetailName').textContent = account.name;
        document.getElementById('accountBalance').textContent = `RON ${account.balance.toFixed(2)}`;

        this.renderAccountTransactions(accountId);
        this.renderAccountCategoryFilter(accountId);
        this.setupAccountBalanceEdit(accountId);
    }

    setupAccountBalanceEdit(accountId) {
        const account = this.accounts.find(a => a.id === accountId);
        const balanceContainer = document.getElementById('accountBalance').parentElement;
        
        let existingBtn = balanceContainer.querySelector('.edit-balance-btn');
        if (existingBtn) existingBtn.remove();
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-small edit-balance-btn';
        editBtn.style.cssText = 'background: var(--light-pink); color: var(--dark-pink); margin-left: 10px; display: inline-flex;';
        editBtn.textContent = '✏️ Edit Balance';
        editBtn.type = 'button';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editAccountBalance(accountId);
        });
        
        balanceContainer.appendChild(editBtn);
    }

    editAccountBalance(accountId) {
        const account = this.accounts.find(a => a.id === accountId);
        const newBalance = prompt(`Edit balance for ${account.name} (RON):`, account.balance.toFixed(2));
        
        if (newBalance !== null && newBalance.trim() !== '') {
            const parsedBalance = parseFloat(newBalance);
            if (!isNaN(parsedBalance)) {
                account.balance = parsedBalance;
                this.saveData();
                this.selectAccount(accountId);
                this.renderAccounts();
                this.updateYearlyStats();
            }
        }
    }

    renderAccountTransactions(accountId) {
        const transactions = this.transactions.filter(t => t.accountId === accountId);
        const tbody = document.getElementById('accountTransactionsList');
        
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No transactions yet</td></tr>';
            return;
        }

        tbody.innerHTML = transactions.map(t => {
            const category = this.categories.find(c => c.id === t.categoryId);
            return `
                <tr>
                    <td>${t.date}</td>
                    <td>${category.icon} ${category.name}</td>
                    <td class="amount-${t.type}">RON ${t.amount.toFixed(2)}</td>
                    <td><span class="badge badge-${t.type}">${t.type}</span></td>
                    <td>${t.note || '-'}</td>
                </tr>
            `;
        }).join('');
    }

    renderAccountCategoryFilter(accountId) {
        const select = document.getElementById('accountCategoryFilter');
        select.innerHTML = '<option value="">All Categories</option>';
        select.innerHTML += this.categories.map(cat => `
            <option value="${cat.id}">${cat.icon} ${cat.name}</option>
        `).join('');
    }

    renderCategories() {
        const categoriesList = document.getElementById('categoriesList');
        categoriesList.innerHTML = this.categories.map(cat => `
            <div class="card" onclick="app.selectCategory(${cat.id})">
                <div class="card-header">
                    <div class="card-title">${cat.name}</div>
                    <div class="card-icon">${cat.icon}</div>
                </div>
                <div class="card-subtitle">${cat.desc}</div>
            </div>
        `).join('');
    }

    selectCategory(categoryId) {
        this.selectedCategory = categoryId;
        document.getElementById('categoriesList').style.display = 'none';
        document.getElementById('categoryDetail').style.display = 'block';

        const category = this.categories.find(c => c.id === categoryId);
        document.getElementById('categoryDetailName').textContent = `${category.icon} ${category.name}`;

        this.renderCategoryTransactions(categoryId);
    }

    renderCategoryTransactions(categoryId) {
        const transactions = this.transactions.filter(t => t.categoryId === categoryId);
        const tbody = document.getElementById('categoryTransactionsList');
        
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No transactions yet</td></tr>';
            return;
        }

        tbody.innerHTML = transactions.map(t => {
            const account = this.accounts.find(a => a.id === t.accountId);
            return `
                <tr>
                    <td>${t.date}</td>
                    <td>${account.name}</td>
                    <td class="amount-${t.type}">RON ${t.amount.toFixed(2)}</td>
                    <td><span class="badge badge-${t.type}">${t.type}</span></td>
                    <td>${t.note || '-'}</td>
                </tr>
            `;
        }).join('');
    }

    initializeMonthlyTabs() {
        const monthlyTabs = document.getElementById('monthlyTabs');
        const months = this.getMonthsList();
        
        monthlyTabs.innerHTML = months.map((month, index) => `
            <button class="month-tab ${index === months.length - 1 ? 'active' : ''}" 
                    onclick="app.switchMonth('${month}')">${this.getMonthName(month)}</button>
        `).join('');

        this.updateMonthlyView();
    }

    getMonthsList() {
        const months = [];
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push(date.toISOString().substring(0, 7));
        }
        return months;
    }

    getMonthName(monthStr) {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    switchMonth(month) {
        this.currentMonth = month;
        document.querySelectorAll('.month-tab').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.updateMonthlyView();
    }

    updateMonthlyView() {
        const monthTransactions = this.transactions.filter(t => t.date.startsWith(this.currentMonth));
        const sortBy = document.querySelector('input[name="sortBy"]:checked')?.value || 'date';

        let sorted = [...monthTransactions];
        if (sortBy === 'date') {
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortBy === 'account') {
            sorted.sort((a, b) => {
                const accA = this.accounts.find(ac => ac.id === a.accountId)?.name || '';
                const accB = this.accounts.find(ac => ac.id === b.accountId)?.name || '';
                return accA.localeCompare(accB);
            });
        } else if (sortBy === 'category') {
            sorted.sort((a, b) => {
                const catA = this.categories.find(c => c.id === a.categoryId)?.name || '';
                const catB = this.categories.find(c => c.id === b.categoryId)?.name || '';
                return catA.localeCompare(catB);
            });
        }

        const tbody = document.getElementById('monthlyTransactionsList');
        if (sorted.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-light); padding: 40px;">No transactions for this month</td></tr>';
            return;
        }

        tbody.innerHTML = sorted.map(t => {
            const account = this.accounts.find(a => a.id === t.accountId);
            const category = this.categories.find(c => c.id === t.categoryId);
            return `
                <tr>
                    <td>${t.date}</td>
                    <td>${account.name}</td>
                    <td>${category.icon} ${category.name}</td>
                    <td class="amount-${t.type}">RON ${t.amount.toFixed(2)}</td>
                    <td><span class="badge badge-${t.type}">${t.type}</span></td>
                    <td>${t.note || '-'}</td>
                    <td>
                        <button class="btn btn-small" onclick="app.editTransaction(${t.id})" style="background: var(--light-pink); color: var(--dark-pink);">✏️</button>
                        <button class="btn btn-small btn-danger" onclick="app.deleteTransaction(${t.id})">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    editTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        document.getElementById('transactionAccount').value = transaction.accountId;
        document.getElementById('transactionCategory').value = transaction.categoryId;
        document.getElementById('transactionAmount').value = transaction.amount;
        document.getElementById('transactionType').value = transaction.type;
        document.getElementById('transactionDate').value = transaction.date;
        document.getElementById('transactionNote').value = transaction.note;

        document.getElementById('newTransactionModal').dataset.editId = transactionId;
        openModal('newTransactionModal');
    }

    updateYearlyStats() {
        let income = 0;
        let expenses = 0;

        this.transactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expenses += t.amount;
        });

        document.getElementById('yearlyIncome').textContent = `RON ${income.toFixed(2)}`;
        document.getElementById('yearlyExpenses').textContent = `RON ${expenses.toFixed(2)}`;
        document.getElementById('yearlySavings').textContent = `RON ${(income - expenses).toFixed(2)}`;

        this.renderCategoryStats();
    }

    renderCategoryStats() {
        const categorySpending = {};
        this.categories.forEach(cat => {
            categorySpending[cat.id] = { name: cat.name, icon: cat.icon, total: 0 };
        });

        this.transactions.forEach(t => {
            if (t.type === 'expense' && categorySpending[t.categoryId]) {
                categorySpending[t.categoryId].total += t.amount;
            }
        });

        const maxSpending = Math.max(...Object.values(categorySpending).map(c => c.total)) || 1;

        const statsHtml = Object.values(categorySpending)
            .filter(c => c.total > 0)
            .sort((a, b) => b.total - a.total)
            .map(cat => {
                const percentage = (cat.total / maxSpending) * 100;
                return `
                    <div class="category-bar">
                        <div class="category-bar-label">
                            <span>${cat.icon} ${cat.name}</span>
                            <span>RON ${cat.total.toFixed(2)}</span>
                        </div>
                        <div class="category-bar-fill">
                            <div class="category-bar-progress" style="width: ${percentage}%;"></div>
                        </div>
                    </div>
                `;
            }).join('');

        document.getElementById('categoryStats').innerHTML = statsHtml || '<p style="color: var(--text-light);">No expense data yet</p>';
    }

    renderBudgets() {
        const budgetsList = document.getElementById('budgetsList');
        
        if (this.budgets.length === 0) {
            budgetsList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💰</div><h3>No Budgets Yet</h3><p>Create your first budget to track spending limits</p></div>';
            return;
        }

        budgetsList.innerHTML = this.budgets.map(budget => {
            const category = this.categories.find(c => c.id === budget.categoryId);
            const spent = this.getBudgetSpent(budget);
            const percentage = (spent / budget.amount) * 100;
            const isOver = percentage > 100;

            return `
                <div class="budget-progress">
                    <div class="budget-header">
                        <div class="budget-label">${category.icon} ${category.name}</div>
                        <div class="budget-amount">RON ${spent.toFixed(2)} / RON ${budget.amount.toFixed(2)}</div>
                    </div>
                    <div class="budget-bar">
                        <div class="budget-bar-fill ${isOver ? 'over' : ''}" style="width: ${Math.min(percentage, 100)}%;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.85em; color: var(--text-light);">
                        <span>${budget.period}</span>
                        <button class="btn btn-small" onclick="app.deleteBudget(${budget.id})" style="background: transparent; border: 1px solid var(--light-pink); color: var(--text-light); padding: 4px 8px;">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getBudgetSpent(budget) {
        const today = new Date();
        let startDate, endDate;

        if (budget.period === 'daily') {
            startDate = new Date(today);
            endDate = new Date(today);
            endDate.setDate(endDate.getDate() + 1);
        } else if (budget.period === 'weekly') {
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - startDate.getDay());
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);
        } else if (budget.period === 'monthly') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        } else {
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear() + 1, 0, 1);
        }

        return this.transactions
            .filter(t => t.categoryId === budget.categoryId && 
                       t.type === 'expense' &&
                       new Date(t.date) >= startDate && 
                       new Date(t.date) < endDate)
            .reduce((sum, t) => sum + t.amount, 0);
    }

    deleteBudget(budgetId) {
        this.budgets = this.budgets.filter(b => b.id !== budgetId);
        this.saveData();
        this.renderBudgets();
    }

    renderSavings() {
        const savingsList = document.getElementById('savingsList');
        
        if (this.savings.length === 0) {
            savingsList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎯</div><h3>No Savings Goals Yet</h3><p>Create a savings goal to track your progress</p></div>';
            return;
        }

        savingsList.innerHTML = this.savings.map(goal => {
            const percentage = (goal.current / goal.target) * 100;
            const remaining = goal.target - goal.current;

            return `
                <div class="stat-card" style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h3 style="color: var(--dark-pink); margin-bottom: 5px;">${goal.name}</h3>
                            <p style="color: var(--text-light); font-size: 0.9em;">Remaining: RON ${remaining.toFixed(2)}</p>
                        </div>
                        <button class="btn btn-small" onclick="app.deleteSavingsGoal(${goal.id})" style="background: transparent; border: 1px solid var(--light-pink); color: var(--text-light);">Delete</button>
                    </div>
                    <div class="budget-bar">
                        <div class="budget-bar-fill" style="width: ${Math.min(percentage, 100)}%;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 0.85em; color: var(--text-light);">
                        <span>RON ${goal.current.toFixed(2)} / RON ${goal.target.toFixed(2)}</span>
                        <span>${Math.round(percentage)}%</span>
                    </div>
                    ${goal.deadline ? `<p style="color: var(--text-light); font-size: 0.85em; margin-top: 8px;">Target: ${goal.deadline}</p>` : ''}
                </div>
            `;
        }).join('');
    }

    deleteSavingsGoal(goalId) {
        this.savings = this.savings.filter(s => s.id !== goalId);
        this.saveData();
        this.renderSavings();
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('transactionDate').value = today;
        document.getElementById('savingsDeadline').value = today;
    }
}

// ==================== UI FUNCTIONS ====================
let app;

window.addEventListener('DOMContentLoaded', () => {
    app = new ExpenseTrackerApp();
    populateFormSelects();
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (modalId === 'newTransactionModal') {
        delete document.getElementById(modalId).dataset.editId;
    }
}

function addAccount(e) {
    e.preventDefault();
    const name = document.getElementById('accountName').value;
    const balance = document.getElementById('accountInitialBalance').value;
    const type = document.getElementById('accountType').value;

    app.addAccount(name, balance, type);
    closeModal('newAccountModal');
    document.getElementById('accountName').value = '';
    document.getElementById('accountInitialBalance').value = '';
    document.getElementById('accountType').value = 'Checking';
    populateFormSelects();
}

function addCategory(e) {
    e.preventDefault();
    const name = document.getElementById('categoryName').value;
    const icon = document.getElementById('categoryIcon').value;
    const desc = document.getElementById('categoryDesc').value;

    app.addCategory(name, icon, desc);
    closeModal('newCategoryModal');
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryIcon').value = '';
    document.getElementById('categoryDesc').value = '';
    populateFormSelects();
}

function addTransaction(e) {
    e.preventDefault();
    const accountId = document.getElementById('transactionAccount').value;
    const categoryId = document.getElementById('transactionCategory').value;
    const amount = document.getElementById('transactionAmount').value;
    const type = document.getElementById('transactionType').value;
    const date = document.getElementById('transactionDate').value;
    const note = document.getElementById('transactionNote').value;

    const editId = document.getElementById('newTransactionModal').dataset.editId;
    if (editId) {
        app.updateTransaction(parseInt(editId), { accountId: parseInt(accountId), categoryId: parseInt(categoryId), amount: parseFloat(amount), type, date, note });
    } else {
        app.addTransaction(accountId, categoryId, amount, type, date, note);
    }

    closeModal('newTransactionModal');
    document.getElementById('transactionForm')?.reset?.();
    populateFormSelects();
}

function addBudget(e) {
    e.preventDefault();
    const categoryId = document.getElementById('budgetCategory').value;
    const amount = document.getElementById('budgetAmount').value;
    const period = document.getElementById('budgetPeriod').value;

    app.addBudget(categoryId, amount, period);
    closeModal('newBudgetModal');
    document.getElementById('budgetCategory').value = '';
    document.getElementById('budgetAmount').value = '';
}

function addSavingsGoal(e) {
    e.preventDefault();
    const name = document.getElementById('savingsName').value;
    const target = document.getElementById('savingsTarget').value;
    const current = document.getElementById('savingsCurrent').value;
    const deadline = document.getElementById('savingsDeadline').value;

    app.addSavingsGoal(name, target, current, deadline);
    closeModal('newSavingsModal');
    document.getElementById('savingsName').value = '';
    document.getElementById('savingsTarget').value = '';
    document.getElementById('savingsCurrent').value = '0';
    document.getElementById('savingsDeadline').value = '';
}

function populateFormSelects() {
    document.getElementById('transactionAccount').innerHTML = app.accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    document.getElementById('transactionCategory').innerHTML = app.categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
    document.getElementById('budgetCategory').innerHTML = app.categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
}

function backToAccountsList() {
    document.getElementById('accountsList').style.display = 'grid';
    document.getElementById('accountDetail').style.display = 'none';
    app.selectedAccount = null;
}

function backToCategoriesList() {
    document.getElementById('categoriesList').style.display = 'grid';
    document.getElementById('categoryDetail').style.display = 'none';
    app.selectedCategory = null;
}

function filterAccountTransactions() {
    const categoryId = document.getElementById('accountCategoryFilter').value;
    if (!categoryId) {
        app.renderAccountTransactions(app.selectedAccount);
        return;
    }

    const transactions = app.transactions.filter(t => t.accountId === app.selectedAccount && t.categoryId === parseInt(categoryId));
    const tbody = document.getElementById('accountTransactionsList');
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No transactions in this category</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.map(t => {
        const category = app.categories.find(c => c.id === t.categoryId);
        return `
            <tr>
                <td>${t.date}</td>
                <td>${category.icon} ${category.name}</td>
                <td class="amount-${t.type}">$${t.amount.toFixed(2)}</td>
                <td><span class="badge badge-${t.type}">${t.type}</span></td>
                <td>${t.note || '-'}</td>
            </tr>
        `;
    }).join('');
}