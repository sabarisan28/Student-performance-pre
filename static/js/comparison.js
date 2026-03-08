let students = [];

const form = document.getElementById("compareForm");
const tableBody = document.getElementById("comparisonTableBody");

const barCtx = document.getElementById("barChart");
const radarCtx = document.getElementById("radarChart");

let barChart, radarChart;

form.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("studentName").value.trim();
  if (!name) return;

  // Example random scores for demo
  const scores = {
    "Professional Life": Math.floor(Math.random()*41 + 60),
    "General English": Math.floor(Math.random()*41 + 60),
    "English for IT": Math.floor(Math.random()*41 + 60),
    "Web Design": Math.floor(Math.random()*41 + 60),
    "Algorithm": Math.floor(Math.random()*41 + 60),
    "ESD": Math.floor(Math.random()*41 + 60)
  };
  const avg = Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/6);

  students.push({ name, ...scores, avg });

  document.getElementById("studentName").value = "";

  renderComparison();
});

function renderComparison() {
  tableBody.innerHTML = "";

  students.forEach(student => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student["Professional Life"]}</td>
      <td>${student["General English"]}</td>
      <td>${student["English for IT"]}</td>
      <td>${student["Web Design"]}</td>
      <td>${student["Algorithm"]}</td>
      <td>${student["ESD"]}</td>
      <td>${student.avg}</td>
    `;
    tableBody.appendChild(row);
  });

  const labels = ["Professional Life","General English","English for IT","Web Design","Algorithm","ESD"];
  
  // Bar Chart
  if(barChart) barChart.destroy();
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: students.map((s,i)=>({
        label: s.name,
        data: labels.map(l=>s[l]),
        backgroundColor: `rgba(${50+i*40}, ${100+i*20}, ${200-i*10}, 0.6)`
      }))
    },
    options: { responsive:true, scales: { y:{ beginAtZero:true, max:100 } } }
  });

  // Radar Chart
  if(radarChart) radarChart.destroy();
  radarChart = new Chart(radarCtx, {
    type: 'radar',
    data: {
      labels,
      datasets: students.map((s,i)=>({
        label: s.name,
        data: labels.map(l=>s[l]),
        fill: true,
        backgroundColor: `rgba(${50+i*40}, ${100+i*20}, ${200-i*10}, 0.2)`,
        borderColor: `rgba(${50+i*40}, ${100+i*20}, ${200-i*10}, 1)`,
        pointBackgroundColor: `rgba(${50+i*40}, ${100+i*20}, ${200-i*10}, 1)`
      }))
    },
    options: { responsive:true, scales:{ r:{ beginAtZero:true, max:100 } } }
  });
}
