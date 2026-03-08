document.getElementById('reportForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Input data
  const name = document.getElementById('studentName').value;
  const id = document.getElementById('studentId').value;
  const cls = document.getElementById('studentClass').value;
  const term = document.getElementById('term').value;
  const date = document.getElementById('reportDate').value;
  const totalDays = parseInt(document.getElementById('totalDays').value);
  const present = parseInt(document.getElementById('daysPresent').value);
  const teacherComments = document.getElementById('teacherCommentsInput').value;

  // Example scores
  const term1 = { BCU: 85, "English for IT": 88, "General English": 82, Logic: 79, PL: 91, Design: 87 };
  const term2 = { "English for IT": 90, "General English": 86, Algorithm: 84, PL: 93, "Web Design": 89 };

  // Attendance
  const absent = totalDays - present;
  const attendancePercent = ((present / totalDays) * 100).toFixed(2) + "%";

  // Subject summary
  const allSubjects = Array.from(new Set([...Object.keys(term1), ...Object.keys(term2)]));
  const tbody = document.getElementById('subjectsTable');
  tbody.innerHTML = '';
  let totalScore = 0, count = 0;

  allSubjects.forEach(subject => {
    const t1 = term1[subject] ?? '-';
    const t2 = term2[subject] ?? '-';
    const avg = (t1 !== '-' && t2 !== '-') ? ((t1 + t2) / 2).toFixed(2) : (t1 !== '-' ? t1 : t2);
    const grade = avg >= 85 ? 'A' : avg >= 70 ? 'B' : 'C';
    const remarks = grade === 'A' ? 'Excellent' : grade === 'B' ? 'Good' : 'Needs Improvement';
    tbody.innerHTML += `<tr><td>${subject}</td><td>${t1}</td><td>${t2}</td><td>${avg}</td><td>${grade}</td><td>${remarks}</td></tr>`;

    if (avg !== '-') {
      totalScore += parseFloat(avg);
      count++;
    }
  });

  const overall = (totalScore / count).toFixed(2);
  const performance = overall >= 85 ? 'Excellent' : overall >= 70 ? 'Good' : 'Needs Improvement';

  // Display data
  document.getElementById('displayName').innerText = name;
  document.getElementById('displayId').innerText = id;
  document.getElementById('displayClass').innerText = cls;
  document.getElementById('displayTerm').innerText = term;
  document.getElementById('displayDate').innerText = date;
  document.getElementById('displayAttendance').innerText = `${present}/${totalDays} days (${attendancePercent})`;
  document.getElementById('overallAvg').innerText = overall;
  document.getElementById('performanceStatus').innerText = performance;
  document.getElementById('displayTeacherComments').innerText = teacherComments;

  document.getElementById('reportOutput').style.display = 'block';

  // Charts
  const ctxBar = document.getElementById('barChart').getContext('2d');
  new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: allSubjects,
      datasets: [
        { label: 'Term 1', data: allSubjects.map(s => term1[s] || 0), backgroundColor: '#0d6efd' },
        { label: 'Term 2', data: allSubjects.map(s => term2[s] || 0), backgroundColor: '#198754' }
      ]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  const ctxRadar = document.getElementById('radarChart').getContext('2d');
  new Chart(ctxRadar, {
    type: 'radar',
    data: {
      labels: allSubjects,
      datasets: [
        { label: 'Term 1', data: allSubjects.map(s => term1[s] || 0), backgroundColor: 'rgba(13,110,253,0.3)', borderColor: '#0d6efd' },
        { label: 'Term 2', data: allSubjects.map(s => term2[s] || 0), backgroundColor: 'rgba(25,135,84,0.3)', borderColor: '#198754' }
      ]
    },
    options: { responsive: true, scales: { r: { beginAtZero: true } } }
  });
});
