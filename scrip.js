// ============================================================
// PERSONAL FINANCE TRACKER
// ============================================================


// ================= VARIABLES =================

let transactions = [];

let budget = 0;

let categoryChart = null;

let monthlyChart = null;


// ================= DOM ELEMENTS =================

const transactionForm =
    document.getElementById("transactionForm");

const descriptionInput =
    document.getElementById("description");

const amountInput =
    document.getElementById("amount");

const typeInput =
    document.getElementById("type");

const categoryInput =
    document.getElementById("category");

const dateInput =
    document.getElementById("date");

const transactionList =
    document.getElementById("transactionList");

const balanceDisplay =
    document.getElementById("balance");

const incomeDisplay =
    document.getElementById("income");

const expenseDisplay =
    document.getElementById("expense");

const savingsRateDisplay =
    document.getElementById("savingsRate");

const searchInput =
    document.getElementById("search");

const filterType =
    document.getElementById("filterType");

const filterCategory =
    document.getElementById("filterCategory");

const budgetInput =
    document.getElementById("budgetInput");

const setBudgetBtn =
    document.getElementById("setBudgetBtn");

const budgetAmount =
    document.getElementById("budgetAmount");

const budgetSpent =
    document.getElementById("budgetSpent");

const budgetRemaining =
    document.getElementById("budgetRemaining");

const budgetProgress =
    document.getElementById("budgetProgress");


// ============================================================
// LOCAL STORAGE
// ============================================================

function saveData() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        "budget",
        budget
    );

}


function loadData() {

    const savedTransactions =
        localStorage.getItem("transactions");

    const savedBudget =
        localStorage.getItem("budget");


    if (savedTransactions) {

        transactions =
            JSON.parse(savedTransactions);

    }


    if (savedBudget) {

        budget =
            Number(savedBudget);

    }

}


// ============================================================
// ADD TRANSACTION
// ============================================================

transactionForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const description =
            descriptionInput.value.trim();

        const amount =
            Number(amountInput.value);

        const type =
            typeInput.value;

        const category =
            categoryInput.value;

        const date =
            dateInput.value;


        if (
            description === "" ||
            amount <= 0 ||
            !date
        ) {

            alert(
                "Please enter valid transaction details."
            );

            return;

        }


        const transaction = {

            id: Date.now(),

            description: description,

            amount: amount,

            type: type,

            category: category,

            date: date

        };


        transactions.push(transaction);


        saveData();

        updateEverything();


        transactionForm.reset();

        setTodayDate();

    }
);


// ============================================================
// DELETE TRANSACTION
// ============================================================

function deleteTransaction(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmed) {

        return;

    }


    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveData();

    updateEverything();

}


// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {

    let totalIncome = 0;

    let totalExpense = 0;


    transactions.forEach(
        transaction => {

            if (transaction.type === "income") {

                totalIncome +=
                    transaction.amount;

            } else {

                totalExpense +=
                    transaction.amount;

            }

        }
    );


    const balance =
        totalIncome - totalExpense;


    let savingsRate = 0;


    if (totalIncome > 0) {

        savingsRate =
            (
                (totalIncome - totalExpense)
                /
                totalIncome
            ) * 100;

    }


    incomeDisplay.textContent =
        formatCurrency(totalIncome);

    expenseDisplay.textContent =
        formatCurrency(totalExpense);

    balanceDisplay.textContent =
        formatCurrency(balance);

    savingsRateDisplay.textContent =
        `${savingsRate.toFixed(1)}%`;

}


// ============================================================
// DISPLAY TRANSACTIONS
// ============================================================

function displayTransactions() {

    const searchTerm =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedType =
        filterType.value;

    const selectedCategory =
        filterCategory.value;


    let filteredTransactions =
        transactions.filter(
            transaction => {

                const matchesSearch =

                    transaction.description
                        .toLowerCase()
                        .includes(searchTerm)

                    ||

                    transaction.category
                        .toLowerCase()
                        .includes(searchTerm);


                const matchesType =

                    selectedType === "all"

                    ||

                    transaction.type === selectedType;


                const matchesCategory =

                    selectedCategory === "all"

                    ||

                    transaction.category ===
                    selectedCategory;


                return (

                    matchesSearch &&

                    matchesType &&

                    matchesCategory

                );

            }
        );


    filteredTransactions.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    transactionList.innerHTML = "";


    if (
        filteredTransactions.length === 0
    ) {

        transactionList.innerHTML = `

            <p class="empty-message">
                No transactions found.
            </p>

        `;

        return;

    }


    filteredTransactions.forEach(
        transaction => {

            const element =
                document.createElement("div");


            element.classList.add(
                "transaction",
                transaction.type
            );


            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            element.innerHTML = `

                <div class="transaction-info">

                    <h3>
                        ${escapeHTML(
                            transaction.description
                        )}
                    </h3>

                    <p>

                        ${escapeHTML(
                            transaction.category
                        )}

                        •

                        ${formatDate(
                            transaction.date
                        )}

                    </p>

                </div>


                <div class="transaction-right">

                    <span class="transaction-amount">

                        ${sign}

                        ${formatCurrency(
                            transaction.amount
                        )}

                    </span>


                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(
                            ${transaction.id}
                        )"
                    >

                        Delete

                    </button>

                </div>

            `;


            transactionList.appendChild(element);

        }
    );

}


// ============================================================
// CATEGORY CHART
// ============================================================

function updateCategoryChart() {

    const categoryTotals = {};


    transactions.forEach(
        transaction => {

            if (
                transaction.type !== "expense"
            ) {

                return;

            }


            if (
                !categoryTotals[
                    transaction.category
                ]
            ) {

                categoryTotals[
                    transaction.category
                ] = 0;

            }


            categoryTotals[
                transaction.category
            ] += transaction.amount;

        }
    );


    const labels =
        Object.keys(categoryTotals);

    const values =
        Object.values(categoryTotals);


    const canvas =
        document.getElementById(
            "categoryChart"
        );


    if (categoryChart) {

        categoryChart.destroy();

    }


    categoryChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            data: values,

                            backgroundColor: [

                                "#3b82f6",

                                "#22c55e",

                                "#f59e0b",

                                "#ef4444",

                                "#a855f7",

                                "#14b8a6",

                                "#f97316",

                                "#64748b"

                            ]

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    }

                }

            }
        );

}


// ============================================================
// MONTHLY CHART
// ============================================================

function updateMonthlyChart() {

    const monthlyIncome = {};

    const monthlyExpense = {};


    transactions.forEach(
        transaction => {

            const month =
                transaction.date.substring(
                    0,
                    7
                );


            if (
                transaction.type === "income"
            ) {

                monthlyIncome[month] =
                    (
                        monthlyIncome[month] || 0
                    )
                    +
                    transaction.amount;

            } else {

                monthlyExpense[month] =
                    (
                        monthlyExpense[month] || 0
                    )
                    +
                    transaction.amount;

            }

        }
    );


    const months =
        new Set(
            [
                ...Object.keys(monthlyIncome),
                ...Object.keys(monthlyExpense)
            ]
        );


    const sortedMonths =
        [...months].sort();


    const incomeValues =
        sortedMonths.map(
            month =>
                monthlyIncome[month] || 0
        );


    const expenseValues =
        sortedMonths.map(
            month =>
                monthlyExpense[month] || 0
        );


    const labels =
        sortedMonths.map(
            month => {

                const [year, monthNumber] =
                    month.split("-");

                const date =
                    new Date(
                        year,
                        Number(monthNumber) - 1
                    );

                return date.toLocaleString(
                    "en-IN",
                    {
                        month: "short",
                        year: "numeric"
                    }
                );

            }
        );


    const canvas =
        document.getElementById(
            "monthlyChart"
        );


    if (monthlyChart) {

        monthlyChart.destroy();

    }


    monthlyChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label: "Income",

                            data: incomeValues,

                            backgroundColor:
                                "#22c55e"

                        },

                        {

                            label: "Expenses",

                            data: expenseValues,

                            backgroundColor:
                                "#ef4444"

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }
        );

}


// ============================================================
// BUDGET
// ============================================================

setBudgetBtn.addEventListener(
    "click",
    function () {

        const value =
            Number(budgetInput.value);


        if (value < 0) {

            alert(
                "Budget cannot be negative."
            );

            return;

        }


        budget = value;


        saveData();

        updateBudget();


        budgetInput.value = "";

    }
);


function updateBudget() {

    const now =
        new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const currentMonthKey =
        `${currentYear}-${currentMonth}`;


    let spent = 0;


    transactions.forEach(
        transaction => {

            if (

                transaction.type === "expense"

                &&

                transaction.date.startsWith(
                    currentMonthKey
                )

            ) {

                spent +=
                    transaction.amount;

            }

        }
    );


    const remaining =
        budget - spent;


    budgetAmount.textContent =
        formatCurrency(budget);

    budgetSpent.textContent =
        formatCurrency(spent);

    budgetRemaining.textContent =
        formatCurrency(remaining);


    let percentage = 0;


    if (budget > 0) {

        percentage =
            (spent / budget) * 100;

    }


    percentage =
        Math.min(
            Math.max(percentage, 0),
            100
        );


    budgetProgress.style.width =
        `${percentage}%`;


    if (percentage >= 100) {

        budgetProgress.style.background =
            "#ef4444";

    }

    else if (percentage >= 80) {

        budgetProgress.style.background =
            "#f59e0b";

    }

    else {

        budgetProgress.style.background =
            "#22c55e";

    }

}


// ============================================================
// CURRENCY
// ============================================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {

            style: "currency",

            currency: "INR"

        }
    ).format(amount);

}


// ============================================================
// DATE
// ============================================================

function formatDate(date) {

    const parts =
        date.split("-");

    return (

        `${parts[2]}/${parts[1]}/${parts[0]}`

    );

}


// ============================================================
// TODAY
// ============================================================

function setTodayDate() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    dateInput.value =
        `${year}-${month}-${day}`;

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// ============================================================
// UPDATE EVERYTHING
// ============================================================

function updateEverything() {

    updateDashboard();

    displayTransactions();

    updateCategoryChart();

    updateMonthlyChart();

    updateBudget();

}


// ============================================================
// EVENTS
// ============================================================

searchInput.addEventListener(
    "input",
    displayTransactions
);


filterType.addEventListener(
    "change",
    displayTransactions
);


filterCategory.addEventListener(
    "change",
    displayTransactions
);


// ============================================================
// INITIALIZE
// ============================================================

loadData();

setTodayDate();

updateEverything();