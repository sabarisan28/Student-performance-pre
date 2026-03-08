import { Chart } from "@/components/ui/chart"
// Student Performance Dashboard JavaScript
// Chart.js is loaded via CDN in the HTML file

let students = []
let currentStudentId = null
const charts = {}

// Load students on page load
document.addEventListener("DOMContentLoaded", () => {
  loadStudents()
  setupEventListeners()
  setTodayDate()
})

// Set today's date as default
function setTodayDate() {
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("assessmentDate").value = today
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById("studentSelect").addEventListener("change", handleStudentChange)
  document.getElementById("termSelect").addEventListener("change", handleTermChange)
  document.getElementById("assessmentForm").addEventListener("submit", handleAssessmentSubmit)
}

// Load all students
async function loadStudents() {
  try {
    const response = await fetch("/api/students")
    students = await response.json()

    const select = document.getElementById("studentSelect")
    select.innerHTML = '<option value="">-- Select a student --</option>'

    students.forEach((student) => {
      const option = document.createElement("option")
      option.value = student.id
      option.textContent = `${student.name} (${student.student_id})`
      select.appendChild(option)
    })
  } catch (error) {
    console.error("Error loading students:", error)
    alert("Error loading students. Please refresh the page.")
  }
}

// Handle student selection change
async function handleStudentChange(e) {
  currentStudentId = e.target.value

  if (currentStudentId) {
    await loadStudentPerformance(currentStudentId)
    document.getElementById("chartsContainer").style.display = "block"
  } else {
    document.getElementById("chartsContainer").style.display = "none"
  }
}

// Handle term selection change
async function handleTermChange(e) {
  const term = e.target.value
  await loadSubjects(term)
}

// Load subjects for selected term
async function loadSubjects(term) {
  try {
    const response = await fetch(`/api/subjects/${term}`)
    const subjects = await response.json()

    const select = document.getElementById("subjectSelect")
    select.innerHTML = '<option value="">-- Select a subject --</option>'

    subjects.forEach((subject) => {
      const option = document.createElement("option")
      option.value = subject.id
      option.textContent = subject.name
      select.appendChild(option)
    })
  } catch (error) {
    console.error("Error loading subjects:", error)
  }
}

// Handle assessment form submission
async function handleAssessmentSubmit(e) {
  e.preventDefault()

  if (!currentStudentId) {
    alert("Please select a student first")
    return
  }

  const formData = {
    student_id: currentStudentId,
    subject_id: document.getElementById("subjectSelect").value,
    term_number: document.getElementById("termSelect").value,
    assessment_type: document.getElementById("assessmentType").value,
    score: Number.parseFloat(document.getElementById("score").value),
    max_score: Number.parseFloat(document.getElementById("maxScore").value),
    date: document.getElementById("assessmentDate").value,
    notes: document.getElementById("notes").value,
  }

  try {
    const response = await fetch("/api/assessments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      alert("Assessment added successfully!")
      document.getElementById("assessmentForm").reset()
      setTodayDate()
      await loadStudentPerformance(currentStudentId)
    } else {
      alert("Error adding assessment")
    }
  } catch (error) {
    console.error("Error adding assessment:", error)
    alert("Error adding assessment. Please try again.")
  }
}

// Load student performance data
async function loadStudentPerformance(studentId) {
  try {
    const [performanceResponse, analyticsResponse] = await Promise.all([
      fetch(`/api/performance/${studentId}`),
      fetch(`/api/analytics/${studentId}`),
    ])

    const performance = await performanceResponse.json()
    const analytics = await analyticsResponse.json()

    updatePerformanceTable(performance)
    updateCharts(analytics)
  } catch (error) {
    console.error("Error loading performance data:", error)
  }
}

// Update performance table
function updatePerformanceTable(performance) {
  const tbody = document.getElementById("performanceTableBody")
  tbody.innerHTML = ""

  performance.forEach((record) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${record.date}</td>
            <td>Term ${record.term}</td>
            <td>${record.subject_name}</td>
            <td>${record.type}</td>
            <td>${record.score}/${record.max_score}</td>
            <td>${record.percentage}%</td>
            <td>${record.skill_type || "N/A"}</td>
        `
    tbody.appendChild(row)
  })
}

// Update all charts
function updateCharts(analytics) {
  updateTermChart(analytics.term_performance)
  updateSubjectChart(analytics.subject_performance)
  updateAssessmentChart(analytics.assessment_performance)
  updateSkillsChart(analytics.skills_performance)
}

// Update term performance chart
function updateTermChart(data) {
  const ctx = document.getElementById("termChart").getContext("2d")

  if (charts.termChart) {
    charts.termChart.destroy()
  }

  charts.termChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((d) => `Term ${d.term}`),
      datasets: [
        {
          label: "Average Performance (%)",
          data: data.map((d) => d.percentage),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  })
}

// Update subject performance chart
function updateSubjectChart(data) {
  const ctx = document.getElementById("subjectChart").getContext("2d")

  if (charts.subjectChart) {
    charts.subjectChart.destroy()
  }

  charts.subjectChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((d) => d.subject),
      datasets: [
        {
          label: "Average Performance (%)",
          data: data.map((d) => d.percentage),
          backgroundColor: "#10b981",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  })
}

// Update assessment type chart
function updateAssessmentChart(data) {
  const ctx = document.getElementById("assessmentChart").getContext("2d")

  if (charts.assessmentChart) {
    charts.assessmentChart.destroy()
  }

  charts.assessmentChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data.map((d) => d.type.charAt(0).toUpperCase() + d.type.slice(1)),
      datasets: [
        {
          data: data.map((d) => d.percentage),
          backgroundColor: ["#2563eb", "#10b981", "#f59e0b", "#ef4444"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
    },
  })
}

// Update skills chart
function updateSkillsChart(data) {
  const ctx = document.getElementById("skillsChart").getContext("2d")

  if (charts.skillsChart) {
    charts.skillsChart.destroy()
  }

  charts.skillsChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: data.map((d) => d.skill.replace("_", " ").toUpperCase()),
      datasets: [
        {
          label: "Performance (%)",
          data: data.map((d) => d.percentage),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.2)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  })
  
}
