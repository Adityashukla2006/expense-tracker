async function fetchData(){
        const data = await fetch('http://localhost:3000/getdetails');
        const adata= await data.json();
        let pdata = Array.isArray(adata) ? adata[0] : adata;
        
        document.getElementById("budget").textContent= "₹ "+pdata.budget;
        document.getElementById("balance").textContent= "₹ "+pdata.balance;
        document.getElementById("expense").textContent= "₹ "+pdata.expense;
}

let myChart; 
async function PieChart() {
    try {
        const canvas = document.getElementById('myPieChart');

        if (!canvas) {
            console.error("Canvas element not found!");
            return;
        }

        const ctx = canvas.getContext('2d');
        if (Chart.getChart("myPieChart")) {
            Chart.getChart("myPieChart").destroy();
        }

        const response = await fetch('http://localhost:3000/getdetails');
        if (!response.ok) throw new Error("Network response was not ok");

        const adata = await response.json();
        let pdata = Array.isArray(adata) ? adata[0] : adata;
        console.log(pdata.entertainment);
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



async function fetchTransactions(){
    const data = await fetch('http://localhost:3000/getTransactions');
    const pdata= await data.json();
    const table = document.querySelector(".transactionsTable");
    pdata.slice(0,4).forEach(function (element) {
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

async function setBudget(){
    const budget= prompt("Enter your budget");
    if (!budget || isNaN(budget) || budget <= 0) {
        alert("Please enter a valid budget.");
        return;
    }
    const response= await fetch("http://localhost:3000/setbudget",{
        method: "POST",
        headers: { 
            "Content-Type":"application/json"
        },
        body:JSON.stringify({budget})
    });
    alert("Budget set successfully!");
    window.location.reload();
}

function goToAddTran(){
    window.location.href="/addtransaction";
}

