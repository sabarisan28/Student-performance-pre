let subjects = []; // store subjects dynamically

// Get form and table elements
const form = document.getElementById("subjectForm");
const tableBody = document.getElementById("subjectTableBody");

// Charts setup
const avgCtx = document.getElementById('avgScoreChart');
const passCtx = document.getElementById('passRateChart');
let avgChart, passChart;

// Function to render table and charts
function renderSubjects() {
    // Clear table
    tableBody.innerHTML = "";

    subjects.forEach(sub => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${sub.name}</td>
            <td>${sub.avg}</td>
            <td>${sub.high}</td>
            <td>${sub.low}</td>
            <td>${sub.pass}%</td>
        `;
        tableBody.appendChild(row);
    });

    const labels = subjects.map(s => s.name);
    const avgData = subjects.map(s => s.avg);
    const passData = subjects.map(s => s.pass);

    // Update Average Score Chart
    if (avgChart) avgChart.destroy();
    avgChart = new Chart(avgCtx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Average Score',
                data: avgData,
                backgroundColor: 'rgba(13,110,253,0.6)',
                borderRadius: 5
            }]
        },
        options: { scales: { y: { beginAtZero: true, max: 100 } } }
    });

    // Update Pass Rate Chart
    if (passChart) passChart.destroy();
    passChart = new Chart(passCtx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: passData,
                backgroundColor: [
                    'rgba(13,110,253,0.7)',
                    'rgba(25,135,84,0.7)',
                    'rgba(255,193,7,0.7)',
                    'rgba(220,53,69,0.7)',
                    'rgba(108,117,125,0.7)',
                    'rgba(13,202,240,0.7)',
                    'rgba(255,99,132,0.7)',
                    'rgba(75,192,192,0.7)'
                ]
            }]
        }
    });
}

// Handle form submission
form.addEventListener("submit", function(e){
    e.preventDefault();
    const name = document.getElementById("subjectName").value.trim();
    const avg = parseFloat(document.getElementById("avgScore").value);
    const high = parseFloat(document.getElementById("highestScore").value);
    const low = parseFloat(document.getElementById("lowestScore").value);
    const pass = parseFloat(document.getElementById("passRate").value);

    // Check if subject exists, update if yes
    const existing = subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
    if(existing){
        existing.avg = avg;
        existing.high = high;
        existing.low = low;
        existing.pass = pass;
    } else {
        subjects.push({ name, avg, high, low, pass });
    }

    // Reset form
    form.reset();

    // Render table and charts
    renderSubjects();
});
