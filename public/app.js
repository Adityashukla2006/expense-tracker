async function fetchData(){
        const data = await fetch('http://localhost:3000/getdetails');
        const adata= await data.json();
        let pdata = Array.isArray(adata) ? adata[0] : adata;
        
        document.getElementById("budget").textContent= "$ "+pdata.budget;
        document.getElementById("balance").textContent= "$ "+pdata.balance;
        document.getElementById("expense").textContent= "$ "+pdata.expense;
        PieChart();
        fetchTransactions();
    }

window.onload=fetchData;

async function PieChart(){
const ctx= document.getElementById('myPieChart').getContext('2d');
const data = await fetch('http://localhost:3000/getdetails');
const adata= await data.json();
let pdata = Array.isArray(adata) ? adata[0] : adata;
new Chart(ctx,{
    type:'pie',
    data: {
        labels:['Food','Rent','Transport','Entertainment','Saving'],
        datasets:[{
            data:[pdata.food,pdata.rent,pdata.transport,pdata.entertainment,pdata.saving],
            backgroundColor:['#FF384','#36A2EB','#FFCE56','#4CAF50','#9966FF'],
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' 
            }
        }
    }
});
}

async function fetchTransactions(){
    const data = await fetch('http://localhost:3000/getTransactions');
    const pdata= await data.json();
    const table = document.querySelector(".transactionsTable");
    table.innerHTML = `
        <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Price</th>
            <th>Date</th>
        </tr>
    `;
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