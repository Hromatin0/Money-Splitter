const { addPerson, addValue, refreshDebts, buildDaySums, formatDayLabel } = require('../logic.js');

describe('addPerson', () => {
    test('adds a person with zero balance and debt', () => {
        const people = [];
        addPerson(people, 'Alice');
        expect(people[0]).toEqual({ name: 'Alice', balance: 0, debt: 0 });
    });

    test('adds multiple people', () => {
        const people = [];
        addPerson(people, 'Alice');
        addPerson(people, 'Bob');
        expect(people).toHaveLength(2);
    });
});

describe('addValue', () => {
    test('increases balance by expense amount', () => {
        const people = [];
        addPerson(people, 'Alice');
        addValue(people, 'Alice', 90);
        expect(people[0].balance).toBe(90);
    });

    test('accumulates multiple expenses', () => {
        const people = [];
        addPerson(people, 'Alice');
        addValue(people, 'Alice', 30);
        addValue(people, 'Alice', 70);
        expect(people[0].balance).toBe(100);
    });
});

describe('refreshDebts', () => {
    test('equal balances -> all debts are 0', () => {
        const people = [];
        addPerson(people, 'Alice');
        addPerson(people, 'Bob');
        addValue(people, 'Alice', 50);
        addValue(people, 'Bob', 50);
        refreshDebts(people);
        people.forEach(p => expect(p.debt).toBe(0));
    });

    test('one person paid for all -> correct debts', () => {
        const people = [];
        addPerson(people, 'Alice');
        addPerson(people, 'Bob');
        addValue(people, 'Alice', 90);
        refreshDebts(people);
        expect(people.find(p => p.name === 'Alice').debt).toBe(45);
        expect(people.find(p => p.name === 'Bob').debt).toBe(-45);
    });

    test('total debt across all people always equals 0', () => {
        const people = [];
        addPerson(people, 'Alice');
        addPerson(people, 'Bob');
        addPerson(people, 'Carol');
        addValue(people, 'Alice', 120);
        addValue(people, 'Bob', 60);
        refreshDebts(people);
        const total = people.reduce((sum, p) => sum + p.debt, 0);
        expect(total).toBe(0);
    });
});

describe('buildDaySums', () => {
    test('sums amounts by iso date', () => {
        const expenses = [
            { isoDate: '2025-01-01', amount: '30.00' },
            { isoDate: '2025-01-01', amount: '20.00' },
            { isoDate: '2025-01-02', amount: '50.00' },
        ];
        const sums = buildDaySums(expenses);
        expect(sums.get('2025-01-01')).toBe(50);
        expect(sums.get('2025-01-02')).toBe(50);
    });
});

describe('formatDayLabel', () => {
    test('formats ISO date to DD.MM', () => {
        expect(formatDayLabel('2025-03-07')).toBe('07.03');
    });
});