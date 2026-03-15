// logic.js - pure functions, no DOM

// ========== People ==========

function addPerson(people, name) {
    people.push({ name, balance: 0, debt: 0 });
}

function addValue(people, person, amount) {
    const personObj = people.find(p => p.name === person);
    if (personObj) personObj.balance += Number(amount);
}

function deletePerson(people, expensesHistory, name) {
    return {
        people: people.filter(p => p.name !== name),
        expensesHistory: expensesHistory.filter(exp => exp.person !== name)
    };
}

// ========== Expenses ==========

function createExpense(person, goal, amount) {
    const now = new Date();
    return {
        person,
        goal,
        amount: Number(amount).toFixed(2),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isoDate: now.toISOString().slice(0, 10),
    };
}

function deleteExpense(people, expensesHistory, index) {
    const expense = expensesHistory[index];
    const personObj = people.find(p => p.name === expense.person);
    if (personObj) personObj.balance -= Number(expense.amount);
    const updated = [...expensesHistory];
    updated.splice(index, 1);
    return updated;
}

// ========== Debts ==========

function refreshDebts(people) {
    const average = people.reduce((sum, p) => sum + p.balance, 0) / people.length;
    people.forEach(p => { p.debt = p.balance - average; });

    const creditors = people.filter(p => p.debt > 0).map(p => ({ name: p.name, debt: p.debt }));
    const debtors = people.filter(p => p.debt < 0).map(p => ({ name: p.name, debt: p.debt }));
    creditors.sort((a, b) => b.debt - a.debt);
    debtors.sort((a, b) => a.debt - b.debt);

    const result = new Map();

    function addDebt(name, value) {
        if (!result.has(name)) result.set(name, []);
        result.get(name).push(`<li>${value}</li>`);
    }

    for (let creditor of creditors) {
        for (let debtor of debtors) {
            if (creditor.debt === 0) break;
            if (debtor.debt === 0) continue;

            const amount = Math.min(creditor.debt, -debtor.debt);
            addDebt(creditor.name, `<i class="bi bi-arrow-left-circle"></i> <div><span>${debtor.name}</span>${amount.toFixed(2)}</div>`);
            addDebt(debtor.name, `<i class="bi bi-arrow-right-circle"></i> <div><span>${creditor.name}</span> ${amount.toFixed(2)}</div>`);
            creditor.debt -= amount;
            debtor.debt += amount;
        }
    }

    return result;
}

// ========== Chart helpers ==========

function buildDaySums(expensesHistory) {
    const sums = new Map();
    for (const exp of expensesHistory) {
        const iso = exp.isoDate || (() => {
            const d = new Date(exp.date);
            return isNaN(d) ? null : d.toISOString().slice(0, 10);
        })();
        if (!iso) continue;
        sums.set(iso, (sums.get(iso) || 0) + Number(exp.amount));
    }
    return sums;
}

function formatDayLabel(isoDate) {
    const [, m, d] = isoDate.split('-');
    return `${d}.${m}`;
}

// ========== Export (Jest, Node.js, browser ignores this) ==========

if (typeof module !== 'undefined') {
    module.exports = { addPerson, addValue, deletePerson, createExpense, deleteExpense, refreshDebts, buildDaySums, formatDayLabel };
}