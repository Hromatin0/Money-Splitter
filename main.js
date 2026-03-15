// main.js - DOM + events

let people = [];
let expensesHistory = [];
let lineChartInstance = null;

const peopleList = document.querySelector('.people-list');
const expensesList = document.querySelector('.expenses-list');
const amountInput = document.querySelector('.amount');
const goalInput = document.querySelector('.goal');
const themeToggle = document.getElementById('themeToggle');
const addPeopleInput = document.querySelector('.add-person input');
const addPeopleBtn = document.querySelector('.add-person button');
const addExpenseBtn = document.querySelector('.addExpense-btn');
const expenseForm = document.querySelector('.expense-form select');
const reset = document.querySelector('.reset-btn');
const navItems = document.querySelectorAll('.nav-item');
const screens = document.querySelectorAll('.tab-screen');

// ========== Render ==========

function renderPeopleList(result) {
    function addRes(name) {
        const debts = result.get(name);
        return debts ? debts.join('') : '';
    }

    peopleList.innerHTML = people.map(p =>
        `<li class="person-item">
            <div class="person-row">
                <div class="personName">
                    <span class="personName-name">${p.name}</span>
                    <span class="personName-balance ${p.debt < 0 ? 'danger' : 'accent'}">${p.debt.toFixed(2)}</span>
                </div>
                <div class="debtsBox ${p.debt < 0 ? 'danger' : 'accent'}">
                    ${addRes(p.name)}
                </div>
            </div>
            <div class="delete-panel">
                <button class="delete-person" data-name="${p.name}">
                    <i class="bi bi-trash3"></i> Delete: ${p.name}
                </button>
            </div>
        </li>`).join('');
}

function renderExpensesList() {
    document.querySelector('.expensesCount').textContent = expensesHistory.length;
    if (expensesHistory.length === 0) {
        expensesList.innerHTML = '<li class="empty-state">No expenses yet</li>';
        return;
    }
    expensesList.innerHTML = expensesHistory.map((p, i) =>
        `<li data-index="${i}">
            <div class="time"><span>${p.time}</span> ${p.date}</div>
            <div class="items">Person: <span>${p.person}</span></div>
            <div class="items">Goal: <span>${p.goal}</span></div>
            <div class="items">Amount: <span class="accent">${p.amount}</span></div>
            <div class="delete-panel">
                <button class="delete-expense">
                    <i class="bi bi-trash3"></i> Delete this expense
                </button>
            </div>
        </li>`).reverse().join('');
}

function refreshAndRender() {
    const result = refreshDebts(people);
    renderPeopleList(result);
}

// ========== Chart ==========

function drawLineChart() {
    const ctx = document.getElementById('lineChart').getContext('2d');
    if (lineChartInstance) lineChartInstance.destroy();

    const daySums = buildDaySums(expensesHistory);

    if (daySums.size === 0) {
        lineChartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ data: [], borderColor: '#22c55e', backgroundColor: 'transparent' }] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { color: '#334155' } },
                    y: { beginAtZero: true, grid: { color: '#334155' } }
                },
                plugins: { legend: { display: false } }
            }
        });
        return;
    }

    const allKeys = [...daySums.keys()].sort();
    const firstIso = allKeys[0];
    const todayIso = new Date().toISOString().slice(0, 10);
    const labels = [];
    const data = [];
    const cur = new Date(firstIso);
    const end = new Date(todayIso);

    while (cur <= end) {
        const iso = cur.toISOString().slice(0, 10);
        labels.push(formatDayLabel(iso));
        data.push(Number(daySums.get(iso) || 0).toFixed(2));
        cur.setDate(cur.getDate() + 1);
    }

    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data,
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34,197,94,0.08)',
                borderWidth: 3,
                tension: 0.35,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 7
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { color: '#334155' },
                    ticks: { color: '#8b949e', maxRotation: 45, autoSkip: true, maxTicksLimit: 14 }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: '#334155' },
                    ticks: { color: '#8b949e' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            const d = new Date(firstIso);
                            d.setDate(d.getDate() + items[0].dataIndex);
                            return d.toLocaleDateString();
                        }
                    }
                }
            }
        }
    });
}

// ========== Theme ==========

function applyTheme(name) {
    if (name === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="bi bi-brightness-high"></i>';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
    }
}

// ========== Storage ==========

function saveToStorage() {
    localStorage.setItem('splitPeople', JSON.stringify(people));
    localStorage.setItem('splitExpenses', JSON.stringify(expensesHistory));
}

function loadFromStorage() {
    const savedPeople = localStorage.getItem('splitPeople');
    const savedExpenses = localStorage.getItem('splitExpenses');
    if (savedPeople) people = JSON.parse(savedPeople);
    if (savedExpenses) expensesHistory = JSON.parse(savedExpenses);
}

function restoreUI() {
    document.querySelector('.addedPeopleCounter').textContent = people.length;
    expenseForm.innerHTML = people.length
        ? people.map(p => `<option>${p.name}</option>`).join('')
        : '<option>—</option>';
    if (people.length === 0) {
        peopleList.innerHTML = '<li class="empty-state">No people added yet</li>';
    } else {
        refreshAndRender();
    }
    renderExpensesList();
}

function resetAllElements() { 
    people = [];
    expensesHistory = [];
    document.querySelector('.addedPeopleCounter').textContent = 0;
    document.querySelector('.expensesCount').textContent = 0;
    peopleList.innerHTML = '<li class="empty-state">No people added yet</li>';
    expensesList.innerHTML = '<li class="empty-state">No expenses yet</li>';
    expenseForm.innerHTML = '<option>—</option>';
    goalInput.value = '';
    amountInput.value = '';
    saveToStorage();
    drawLineChart();
}

// ========== Init ==========

(function init() {
    applyTheme(localStorage.getItem('theme') || 'dark');
    loadFromStorage();
    restoreUI();
    drawLineChart();
})();

// ========== Events ==========

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
});

function flashInvalid(el) {
    el.classList.add('input-invalid');
    el.addEventListener('animationend', () => el.classList.remove('input-invalid'), { once: true });
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('input-invalid'));
});

addPeopleBtn.addEventListener('click', () => {
    const name = addPeopleInput.value.trim();
    if (!name || people.find(p => p.name === name)) { flashInvalid(addPeopleInput); return; }

    addPeopleInput.value = '';
    addPerson(people, name);
    saveToStorage();
    refreshAndRender();
    document.querySelector('.addedPeopleCounter').textContent = people.length;
    expenseForm.innerHTML = people.map(p => `<option>${p.name}</option>`).join('');
    drawLineChart();
});

addExpenseBtn.addEventListener('click', () => {
    let invalid = false;
    if (people.length === 0) { flashInvalid(expenseForm); invalid = true; }
    if (!goalInput.value.trim()) { flashInvalid(goalInput); invalid = true; }
    if (amountInput.value <= 0) { flashInvalid(amountInput); invalid = true; }
    if (invalid) return;

    const expense = createExpense(expenseForm.value, goalInput.value.trim(), amountInput.value.trim());
    expensesHistory.push(expense);
    addValue(people, expense.person, expense.amount);
    goalInput.value = '';
    amountInput.value = '';
    refreshAndRender();
    renderExpensesList();
    drawLineChart();
    saveToStorage();
});

peopleList.addEventListener('click', (e) => {
    if (e.target.closest('.delete-person')) {
        const name = e.target.closest('.delete-person').dataset.name;
        const res = deletePerson(people, expensesHistory, name);
        people = res.people;
        expensesHistory = res.expensesHistory;
        document.querySelector('.addedPeopleCounter').textContent = people.length;
        expenseForm.innerHTML = people.length
            ? people.map(p => `<option>${p.name}</option>`).join('')
            : '<option>—</option>';
        if (!people.length) {
            peopleList.innerHTML = '<li class="empty-state">No people added yet</li>';
        } else {
            refreshAndRender();
        }
        renderExpensesList();
        drawLineChart();
        saveToStorage();
        return;
    }

    const li = e.target.closest('li[class="person-item"]');
    if (!li) return;
    const panel = li.querySelector('.delete-panel');
    const isOpen = panel.classList.contains('visible');
    document.querySelectorAll('.people-list .delete-panel, .expenses-list .delete-panel').forEach(p => p.classList.remove('visible'));
    if (!isOpen) panel.classList.add('visible');
});

expensesList.addEventListener('click', (e) => {
    if (e.target.closest('.delete-expense')) {
        const index = Number(e.target.closest('li[data-index]').dataset.index);
        expensesHistory = deleteExpense(people, expensesHistory, index);
        renderExpensesList();
        refreshAndRender();
        drawLineChart();
        saveToStorage();
        return;
    }

    const li = e.target.closest('li[data-index]');
    if (!li) return;
    const panel = li.querySelector('.delete-panel');
    const isOpen = panel.classList.contains('visible');
    document.querySelectorAll('.people-list .delete-panel, .expenses-list .delete-panel').forEach(p => p.classList.remove('visible'));
    if (!isOpen) panel.classList.add('visible');
});

navItems.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        navItems.forEach(b => b.classList.remove('active'));
        screens.forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(target).classList.add('active');
    });
});

reset.addEventListener('click', () => resetAllElements());