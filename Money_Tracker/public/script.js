const balance = document.getElementById('balance');
const moneyPlus = document.getElementById('money-plus');
const moneyMinus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const type = document.getElementById('type');
const amount = document.getElementById('amount');
const note = document.getElementById('note');
const date = document.getElementById('date');

let transactions = [];

form.addEventListener('submit', addTransaction);

// Fetch transactions from the server
async function fetchTransactions() {
    try {
        const res = await fetch('/transactions');
        const data = await res.json();
        transactions = data;
        init();
    } catch (err) {
        console.error("Error fetching transactions", err);
    }
}

// Add transaction
async function addTransaction(e) {
    e.preventDefault();

    if (amount.value.trim() === '' || note.value.trim() === '' || date.value.trim() === '') {
        alert('Please fill in all fields');
        return;
    }

    const transaction = {
        category_select: type.value,
        amount_input: amount.value,
        info: note.value,
        date_input: date.value
    };

    try {
        const res = await fetch('/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transaction)
        });

        if (res.ok) {
            transactions.push(transaction);
            fetchTransactions();
            clearInputs();
        } else {
            alert('Error in saving transaction');
        }
    } catch (err) {
        console.error("Error adding transaction", err);
        alert('Error in saving transaction');
    }
}

// Add transaction to DOM
function addTransactionDOM(transaction) {
    const sign = transaction.category === 'cash-in' ? '+' : '-';
    const item = document.createElement('li');

    item.classList.add(transaction.category === 'cash-in' ? 'plus' : 'minus');

    item.innerHTML = `
        ${transaction.note} <span>${sign}$${Math.abs(transaction.amount)}</span> <span>${transaction.date}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction._id})">x</button>
    `;

    list.appendChild(item);
}

// Update the balance, income, and expense
function updateValues() {
    const amounts = transactions.map(transaction => transaction.category === 'cash-in' ? transaction.amount : -transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = transactions
        .filter(transaction => transaction.category === 'cash-in')
        .reduce((acc, transaction) => (acc += transaction.amount), 0)
        .toFixed(2);
    const expense = transactions
        .filter(transaction => transaction.category === 'cash-out')
        .reduce((acc, transaction) => (acc += transaction.amount), 0)
        .toFixed(2);

    balance.innerText = `$${total}`;
    moneyPlus.innerText = `+$${income}`;
    moneyMinus.innerText = `-$${expense}`;
}

// Remove transaction
async function removeTransaction(id) {
    try {
        await fetch(`/delete/${id}`, { method: 'DELETE' });
        transactions = transactions.filter(transaction => transaction._id !== id);
        init();
    } catch (err) {
        console.error("Error deleting transaction", err);
    }
}

// Initialize the app
function init() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
}

// Clear input fields
function clearInputs() {
    type.value = 'cash-in';
    amount.value = '';
    note.value = '';
    date.value = '';
}

// Fetch transactions on page load
fetchTransactions();
