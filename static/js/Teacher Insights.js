const form = document.getElementById("insightForm");
const table = document.getElementById("insightTable");
const clearBtn = document.getElementById("clearData");
const saveCommentsBtn = document.getElementById("saveComments");
const commentBox = document.getElementById("teacherComments");

// ====== Load Data ======
let insights = JSON.parse(localStorage.getItem("teacherInsights")) || [];
let teacherComment = localStorage.getItem("teacherComment") || "";
commentBox.value = teacherComment;

updateTable();
updateSummary();
updateCharts();

// ====== Add New Insight ======
form.addEventListener("submit", function(e) {
  e.preventDefault();

  const subject = document.getElementById("subject").value.trim();
  const avgScore = parseFloat(document.getElementById("averageScore").value);
  const topStudent = document.getElementById("topStudent").value.trim();
  const weakArea = document.getElementById("weakArea").value.trim() || "None";

  insights.push({ subject, avgScore, topStudent, weakArea });
  localStorage.setItem("teacherInsights", JSON.stringify(insights));

  updateTable();
  updateSummary();
  updateCharts();
  form.reset();
});

// ====== Table Update ======
function updateTable() {
  table.innerHTML = "";
  insights.forEach((i, index) => {
    table.innerHTML += `
      <tr>
        <td>${i.subject}</td>
        <td>${i.avgScore}%</td>
        <td>${i.topStudent}</td>
        <td>${i.weakArea}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteInsight(${index})">Delete</button>
        </td>
      </tr>`;
  });
}

// ====== Delete Insight ======
function deleteInsight(index) {
  insights.splice(index, 1);
  localStorage.setItem("teacherInsights", JSON.stringify(insights));
  updateTable();
  updateSummary();
  updateCharts();
}

// ====== Clear Data ======
clearBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all data?")) {
    insights = [];
    localStorage.removeItem("teacherInsights");
    updateTable();
    updateSummary();
    updateCharts();
  }
});

// ====== Save Comments ======
saveCommentsBtn.addEventListener("click", () => {
  localStorage.setItem("teacherComment", commentBox.value.trim());
  alert("✅ Comments saved successfully!");
});

// ====== Summary ======
function updateSummary() {
  if (insights.length === 0) {
    document.getElementById("avgClassScore").textContent = "-";
    document.getElementById("topSubject").textContent = "-";
    document.getElementById("lowestSubject").textContent = "-";
    document.getElementById("topPerformer").textContent = "-";
    return;
  }

  const avgClass = (insights.reduce((a,b)=>a+b.avgScore,0)/insights.length).toFixed(2);
  const topSub = insights.reduce((a,b)=>a.avgScore > b.avgScore ? a : b);
  const lowSub = insights.reduce((a,b)=>a.avgScore < b.avgScore ? a : b);

  document.getElementById("avgClassScore").textContent = avgClass + "%";
  document.getElementById("topSubject").textContent = topSub.subject;
  document.getElementById("lowestSubject").textContent = lowSub.subject;
  document.getElementById("topPerformer").textContent = topSub.topStudent;
}

// ====== Charts ======
let barChart, radarChart;

function updateCharts() {
  const labels = insights.map(i => i.subject);
  const data = insights.map(i => i.avgScore);

  if (barChart) barChart.destroy();
  if (radarChart) radarChart.destroy();

  const barCtx = document.getElementById("barChart").getContext("2d");
  barChart = new Chart(barCtx, {
    type: "bar",
    data: { labels, datasets: [{ label: "Average Score (%)", data, backgroundColor: "#0d6efd" }] },
    options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
  });

  const radarCtx = document.getElementById("radarChart").getContext("2d");
  radarChart = new Chart(radarCtx, {
    type: "radar",
    data: {
      labels,
      datasets: [{ label: "Performance Strength", data, backgroundColor: "rgba(13,110,253,0.2)", borderColor: "#0d6efd", fill: true }]
    },
    options: { responsive: true, scales: { r: { beginAtZero: true, max: 100 } } }
  });
}
