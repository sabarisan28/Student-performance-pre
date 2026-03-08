// 📘 Bar Chart: Average Score by Subject
const ctx1 = document.getElementById('subjectChart');
new Chart(ctx1, {
  type: 'bar',
  data: {
    labels: ['Professional Life', 'General English', 'English for IT', 'Web Design', 'Algorithm', 'ESD'],
    datasets: [{
      label: 'Average Score (%)',
      data: [85, 78, 88, 92, 80, 75],
      backgroundColor: 'rgba(13, 110, 253, 0.6)',
      borderRadius: 10
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } }
  }
});

// 📈 Pie Chart: Grade Distribution
const ctx2 = document.getElementById('gradeChart');
new Chart(ctx2, {
  type: 'pie',
  data: {
    labels: ['A (90–100)', 'B (80–89)', 'C (70–79)', 'D (60–69)', 'F (<60)'],
    datasets: [{
      data: [25, 45, 30, 15, 5],
      backgroundColor: [
        'rgba(25, 135, 84, 0.7)',
        'rgba(13, 110, 253, 0.7)',
        'rgba(255, 193, 7, 0.7)',
        'rgba(220, 53, 69, 0.7)',
        'rgba(108, 117, 125, 0.7)'
      ],
      borderWidth: 1
    }]
  }
});
