document.addEventListener("DOMContentLoaded", function() {
    let trends = JSON.parse(localStorage.getItem("studentTrends")) || [];

    const subjects = [
        {name:"BCU", t1:"t1BCU"},
        {name:"English for IT", t1:"t1EngIT", t2:"t2EngIT"},
        {name:"General English", t1:"t1GenEng", t2:"t2GenEng"},
        {name:"Logic", t1:"t1Logic"},
        {name:"PL", t1:"t1PL", t2:"t2PL"},
        {name:"Design", t1:"t1Design"},
        {name:"Algorithm", t2:"t2Algo"},
        {name:"Web Design", t2:"t2Web"}
    ];

    function saveTrends() {
        localStorage.setItem("studentTrends", JSON.stringify(trends));
    }

    function renderTable() {
        const tbody = document.getElementById("trendTableBody");
        tbody.innerHTML = "";
        trends.forEach(t => {
            tbody.innerHTML += `<tr>
                <td>${t.studentName}</td>
                <td>${t.studentID}</td>
                <td>${t.studentClass}</td>
                <td>${t.term}</td>
                <td>${t.subject}</td>
                <td>${t.term1}</td>
                <td>${t.term2}</td>
                <td>${t.average}</td>
                <td>${t.teacherComment}</td>
            </tr>`;
        });
        renderChart();
    }

    function renderChart() {
        const ctx = document.getElementById("trendChart").getContext("2d");
        const chartLabels = trends.map(t => t.subject);
        const chartData = trends.map(t => t.average);

        if(window.trendChartInstance) window.trendChartInstance.destroy();

        window.trendChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{ label: 'Average Score', data: chartData, backgroundColor: '#0d6efd' }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    }

    document.getElementById("trendForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const studentName = document.getElementById("studentName").value;
        const studentID = document.getElementById("studentID").value;
        const studentClass = document.getElementById("studentClass").value;
        const term = document.getElementById("term").value
