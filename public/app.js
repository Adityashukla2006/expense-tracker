async function fetchData() {
    const data = await fetch('http://localhost:3000/getdetails');
    const adata = await data.json();
    let pdata = Array.isArray(adata) ? adata[0] : adata;

    document.getElementById("budget").textContent = "₹ " + pdata.budget;
    document.getElementById("balance").textContent = "₹ " + pdata.balance;
    document.getElementById("expense").textContent = "₹ " + pdata.expense;
}

let myChart;
async function PieChart() {
    try {
        const canvas = document.getElementById('myPieChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (Chart.getChart("myPieChart")) {
            Chart.getChart("myPieChart").destroy();
        }

        const response = await fetch('http://localhost:3000/getdetails');
        if (!response.ok) throw new Error("Network response was not ok");

        const adata = await response.json();
        let pdata = Array.isArray(adata) ? adata[0] : adata;

        const chartData = {
            food: pdata.Food,
            rent: pdata.Rent,
            transport: pdata.Transport,
            entertainment: pdata.Entertainment,
            saving: pdata.Others
        };

        myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Food', 'Rent', 'Transport', 'Entertainment', 'Others'],
                datasets: [{
                    data: Object.values(chartData),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9966FF'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

    } catch (error) {
        console.error("Error creating PieChart:", error);
    }
}

document.addEventListener("DOMContentLoaded", fetchData);
document.addEventListener("DOMContentLoaded", PieChart);
document.addEventListener("DOMContentLoaded", fetchTransactions);

async function fetchTransactions() {
    const data = await fetch('http://localhost:3000/getTransactions');
    const pdata = await data.json();
    const table = document.querySelector(".transactionsTable");

    pdata.slice(0, 4).forEach(function (element) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${element.item}</td>
            <td>${element.category}</td>
            <td>${element.cost}</td>
            <td>${element.Date}</td>
        `;
        table.appendChild(row);
    });
}

async function setBudget() {
    const budget = prompt("Enter your budget");
    if (!budget || isNaN(budget) || budget <= 0) {
        alert("Please enter a valid budget.");
        return;
    }
    const response = await fetch("http://localhost:3000/setbudget", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ budget })
    });
    alert("Budget set successfully!");
    window.location.reload();
}

function goToAddTran() {
    window.location.href = "/addtransaction";
}

async function fetchSpendingData() {
    try {
        const response = await fetch('http://localhost:3000/getdetails');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        let bankingData = Array.isArray(data) ? data[0] : data;

        return {
            initialBalance: Number(bankingData.budget) || 0,
            currentBalance: Number(bankingData.balance) || 0,
            categories: {
                "Food": Number(bankingData.Food) || 0,
                "Transport": Number(bankingData.Transport) || 0,
                "Entertainment": Number(bankingData.Entertainment) || 0,
                "Rent": Number(bankingData.Rent) || 0,
                "Others": Number(bankingData.Others) || 0
            }
        };
    } catch (error) {
        console.error('Error fetching spending data:', error);
        throw error;
    }
}

function analyzeSpending(data) {
    const feedbackContainer = document.getElementById('spending-feedback');
    if (!feedbackContainer) return;

    const initialBalance = data.initialBalance || 0;
    const currentBalance = data.currentBalance || 0;
    const spendingByCategory = data.categories || {};

    feedbackContainer.innerHTML = '';

    const header = document.createElement('h2');
    header.textContent = 'Spending Insights';
    feedbackContainer.appendChild(header);

    if (currentBalance < initialBalance * 0.5) {
        const warningMessages = [
            'Your money is running out!',
            'Warning: Your balance is below 50% of your initial amount.',
            'Time to consider adjusting your spending habits!',
            'Your finances need attention - balance dropping quickly.',
            'Budget alert: You\'ve used more than half of your funds.'
        ];
        const randomMessage = warningMessages[Math.floor(Math.random() * warningMessages.length)];

        const warning = document.createElement('div');
        warning.className = 'warning-message';
        warning.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#FF5252" stroke-width="2"/>
            <path d="M12 8V12" stroke="#FF5252" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="16" r="1" fill="#FF5252"/>
        </svg>
        <span>${randomMessage}</span>`;
        feedbackContainer.appendChild(warning);
    }

    if (Object.keys(spendingByCategory).length > 0) {
        const categoryFeedback = document.createElement('div');
        categoryFeedback.className = 'category-feedback';

        const totalSpending = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);

        if (totalSpending > 0) {
            const highestCategory = Object.keys(spendingByCategory).reduce((a, b) =>
                spendingByCategory[a] > spendingByCategory[b] ? a : b
            );

            const highestPercent = Math.round((spendingByCategory[highestCategory] / totalSpending) * 100);
            if (highestPercent > 40) {
                const categoryHighlight = document.createElement('p');
                categoryHighlight.className = 'category-highlight';
                categoryHighlight.textContent = `${highestPercent}% of your spending is on ${highestCategory}. Consider balancing your budget more evenly.`;
                categoryFeedback.appendChild(categoryHighlight);
            }

            const categories = ['Food', 'Transport', 'Entertainment', 'Rent', 'Others'];
            const categoryTips = {
                'Food': 'Try meal prepping to reduce food expenses.',
                'Transport': 'Consider using public transportation more often.',
                'Entertainment': 'Look for free or low-cost entertainment options.',
                'Rent': 'Rent typically takes a large portion of income. Ensure it stays below 30% of your budget.',
                'Others': 'Review your miscellaneous expenses to identify unnecessary spending.'
            };

            categories.forEach(category => {
                if (spendingByCategory[category] && spendingByCategory[category] / totalSpending > 0.2) {
                    const tip = document.createElement('p');
                    tip.className = 'category-tip';
                    tip.innerHTML = `<strong>${category}:</strong> ${categoryTips[category]}`;
                    categoryFeedback.appendChild(tip);
                }
            });

            feedbackContainer.appendChild(categoryFeedback);
        }
    }

    if (currentBalance < initialBalance * 0.7) {
        const savingsTip = document.createElement('div');
        savingsTip.className = 'savings-tip';
        savingsTip.innerHTML = `<h3>Savings Tip</h3>
        <p>Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.</p>`;
        feedbackContainer.appendChild(savingsTip);
    }
}

async function updateFeedbackSection() {
    try {
        const data = await fetchSpendingData();
        analyzeSpending(data);
    } catch (error) {
        const feedbackContainer = document.getElementById('spending-feedback');
        if (feedbackContainer) {
            feedbackContainer.innerHTML = `<div class="error-message">Failed to load spending insights. Please try again later.</div>`;
        }
    }
}

function addFeedbackStyles() {
    if (!document.getElementById('spending-feedback-styles')) {
        const style = document.createElement('style');
        style.id = 'spending-feedback-styles';
        style.textContent = `
            #spending-feedback {
                background-color: #171A23;
                border: 2px solid white;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 38px;
                color: white;
            }
            #spending-feedback h2 {
                color: #00E5B7;
                margin-top: 0;
                margin-bottom: 15px;
            }
            .warning-message {
                background-color: rgba(255, 82, 82, 0.1);
                border-left: 4px solid #FF5252;
                padding: 15px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .warning-message span {
                font-weight: bold;
                color: #FF5252;
            }
            .category-feedback {
                margin-top: 20px;
            }
            .category-highlight {
                font-weight: bold;
                color: #FFD700;
            }
            .category-tip {
                margin: 8px 0;
            }
            .savings-tip {
                margin-top: 20px;
                background-color: rgba(0, 229, 183, 0.1);
                border-left: 4px solid #00E5B7;
                padding: 15px;
            }
            .savings-tip h3 {
                margin-top: 0;
                color: #00E5B7;
            }
            .error-message {
                color: #FF5252;
                padding: 15px;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }
}

function initFeedbackSection() {
    addFeedbackStyles();
    updateFeedbackSection();
    setInterval(updateFeedbackSection, 300000);
}

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(initFeedbackSection, 500);

    const budgetButton = document.querySelector('button[onclick="setBudget()"]');
    if (budgetButton) {
        const originalSetBudget = window.setBudget;
        window.setBudget = function () {
            if (typeof originalSetBudget === 'function') {
                originalSetBudget();
            }
            setTimeout(updateFeedbackSection, 500);
        };
    }
});

async function resetBudget() {
    const confirmed = confirm("Are you sure you want to reset your budget?");
    if (!confirmed) return;
  
    const res = await fetch("http://localhost:3000/resetBudget", {
      method: "POST"
    });
  
    const data = await res.json();
    alert(data.message);
    window.location.reload();
  }