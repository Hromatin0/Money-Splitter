# Money Splitter

A web app for splitting expenses between people. Add participants, log who paid for what, and the app automatically calculates who owes whom and how much.

---

## How It Works

Each person has a balance — the total amount they have paid. The app calculates the average spend across all participants. Anyone above the average is owed money, anyone below owes money. The algorithm then finds the minimum number of transfers needed to settle all debts.

**Example:** Alice paid 90, Bob paid 0, Carol paid 0. Average is 30. Bob and Carol each owe Alice 30.

---

## Features

- Add and remove people
- Log expenses with a description, amount and payer
- Automatic debt calculation — shows exactly who pays whom and how much to settle up
- Expense history with the ability to delete individual entries
- Daily spending chart
- Dark / light theme
- All data saved to localStorage — nothing is lost on refresh
- Responsive design

---

## Tech Stack

- HTML
- CSS
- JavaScript
- Chart.js
- Bootstrap Icons
- Jest

---
