// Radar Chart: Subject Scores
const ctx = document.getElementById('subjectRadarChart');
new Chart(ctx, {
    type: 'radar',
    data: {
        labels: ['Professional Life', 'General English', 'English for IT', 'Web Design', 'Algorithm', 'ESD'],
        datasets: [{
            label: 'Score (%)',
            data: [85, 78, 88, 92, 80, 75],
            backgroundColor: 'rgba(13, 110, 253, 0.2)',
            borderColor: 'rgba(13, 110, 253, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(13, 110, 253, 1)'
        }]
    },
    options: {
        scales: {
            r: {
                min: 0,
                max: 100,
                ticks: { stepSize: 10 }
            }
        }
    }
});
