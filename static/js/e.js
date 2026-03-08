// START script.js

// --- 1. Data Definition ---
const subjectData = [
    { name: "BCU", term1: true, term2: false },
    { name: "Logic", term1: true, term2: false },
    { name: "Design", term1: true, term2: false },
    { name: "English for IT", term1: true, term2: true },
    { name: "General English", term1: true, term2: true },
    { name: "PL", term1: true, term2: true },
    { name: "Algorithm", term1: false, term2: true },
    { name: "Web Design", term1: false, term2: true }
];

// Digraph relationships (Prerequisite -> Dependent)
const digraphRelations = {
    "Logic": "Algorithm",
    "PL": "PL", // Continuity
    "Design": "Web Design",
    "English for IT": "English for IT",
    "General English": "General English"
};

let studentScores = {}; // Stores all score, attendance, completion, change, and pacing data.
let chartInstance = null; // To store and manage the Chart.js instance


// --- 2. Initial Setup: Populate Data Entry Table ---
function populateTable() {
    const tbody = document.getElementById('scoreTable').querySelector('tbody');
    if (!tbody) return; 
    tbody.innerHTML = ''; // Always clear existing rows first

    subjectData.forEach(subject => {
        const row = tbody.insertRow();
        row.insertCell().textContent = subject.name;
        
        // Helper function for input cell
        const createInputCell = (term, type, defaultValue) => {
            const cell = row.insertCell();
            if (subject[term]) {
                const max = 100;
                const min = 0;
                // Generate a unique ID for each input
                cell.innerHTML = `<input type="number" id="${subject.name}-${term}-${type}" min="${min}" max="${max}" value="${defaultValue}">`;
            } else {
                cell.textContent = "N/A";
            }
        };

        // Term 1 Inputs (Score, Attendance, Completion) - Default values for quick testing
        createInputCell('term1', 'score', 75); 
        createInputCell('term1', 'attendance', 90);
        createInputCell('term1', 'completion', 95);

        // Term 2 Inputs (Score, Attendance, Completion)
        createInputCell('term2', 'score', 80);
        createInputCell('term2', 'attendance', 90);
        createInputCell('term2', 'completion', 95);
    });
}

// --- 3. Core Calculation Logic ---
function calculatePerformance() {
    studentScores = {};
    let totalChange = 0;
    let totalPacing = 0;
    let subjectsWithChange = 0;
    let subjectsWithPacing = 0;
    
    // Validate study hours input
    const studyHoursT1 = parseFloat(document.getElementById('studyHoursT1').value) || 1;
    const studyHoursT2 = parseFloat(document.getElementById('studyHoursT2').value) || 1;

    // 1. Gather Scores and Calculate Metrics
    subjectData.forEach(subject => {
        // Function to safely get input value
        const getVal = (term, type) => {
            const el = document.getElementById(`${subject.name}-${term}-${type}`);
            const value = el ? parseFloat(el.value) : null;
            // Basic score validation (0-100)
            if (type === 'score' && value !== null && (value < 0 || value > 100)) {
                alert(`Invalid score for ${subject.name} in ${term}. Must be between 0 and 100.`);
                return NaN; // Use NaN to flag error without stopping the loop immediately
            }
            return value;
        };

        const t1Score = getVal('term1', 'score');
        const t2Score = getVal('term2', 'score');
        const t1Att = getVal('term1', 'attendance');
        const t2Att = getVal('term2', 'attendance');
        
        // Skip subject if an invalid score was found
        if (isNaN(t1Score) || isNaN(t2Score) || isNaN(t1Att) || isNaN(t2Att)) return;

        studentScores[subject.name] = { t1: t1Score, t2: t2Score, t1Att, t2Att };

        // 2. Calculate Term-to-Term Change
        if (subject.term1 && subject.term2 && t1Score !== null && t2Score !== null) {
            const change = t2Score - t1Score;
            studentScores[subject.name].change = change;
            
            totalChange += change;
            subjectsWithChange++;
        }

        // 3. Calculate Pacing Metric (Beta = Score / Study Hours) for Term 2
        if (t2Score !== null && studyHoursT2 > 0) {
            const pacing = t2Score / studyHoursT2; 
            studentScores[subject.name].pacing = pacing;
            totalPacing += pacing;
            subjectsWithPacing++;
        }

        // 4. Predictive Alert/Risk Check (T1 Score < 60 AND T1 Att < 80)
        if (t1Score !== null && t1Score < 60 && t1Att !== null && t1Att < 80) {
            studentScores[subject.name].highRisk = true;
        }
    });

    // 5. Update Summary Metrics
    const overallAvgChange = subjectsWithChange > 0 ? (totalChange / subjectsWithChange).toFixed(1) : 0;
    const overallAvgPacing = subjectsWithPacing > 0 ? (totalPacing / subjectsWithPacing).toFixed(2) : 0;
    
    document.getElementById('overallGrowth').textContent = `${overallAvgChange > 0 ? '+' : ''}${overallAvgChange}%`;
    document.getElementById('avgPacing').textContent = `${overallAvgPacing} pts/hr`;
    
    // 6. Update Predictive Alert Card
    const riskSubjects = Object.keys(studentScores).filter(name => studentScores[name].highRisk);
    const riskAlertElement = document.getElementById('riskAlerts');
    const alertCard = document.querySelector('.alert-card');

    if (riskSubjects.length > 0) {
        riskAlertElement.textContent = `${riskSubjects.length} Subject(s): ${riskSubjects.join(', ')}`;
        alertCard.classList.add('urgent');
    } else {
        riskAlertElement.textContent = `None Detected`;
        alertCard.classList.remove('urgent');
    }

    // 7. Update Analysis Table, Digraph Text, and Chart
    updateAnalysisTable();
    generateDigraphInsights();
    renderDigraphChart(); // <--- RENDER THE RADAR CHART

    openTab(null, 'analysis'); // Switch to analysis tab
}

// --- 4. Update Analysis Table ---
function updateAnalysisTable() {
    const tbody = document.getElementById('analysisTable').querySelector('tbody');
    tbody.innerHTML = '';

    Object.keys(studentScores).forEach(name => {
        const data = studentScores[name];
        
        if (data.t1 !== null || data.t2 !== null) {
            const row = tbody.insertRow();
            row.insertCell().textContent = name;
            row.insertCell().textContent = data.t1 !== null ? data.t1.toFixed(0) : "N/A";
            row.insertCell().textContent = data.t2 !== null ? data.t2.toFixed(0) : "N/A";

            // Change (Delta)
            const changeCell = row.insertCell();
            if (data.change !== undefined) {
                const changeValue = data.change.toFixed(1);
                changeCell.textContent = (data.change > 0 ? '+' : '') + changeValue + '%';
                changeCell.className = data.change > 0 ? 'growth-positive' : (data.change < 0 ? 'growth-negative' : 'growth-stable');
            } else {
                changeCell.textContent = "N/A";
            }
            
            // T2 Pacing (Beta)
            row.insertCell().textContent = data.pacing !== undefined ? data.pacing.toFixed(2) : "N/A";

            // Status
            const statusCell = row.insertCell();
            if (data.change !== undefined) {
                if (data.change > 5 && data.t2 >= 70) {
                    statusCell.textContent = 'Excellent Growth';
                    statusCell.classList.add('growth-positive');
                } else if (data.change < -5 || data.t2 < 60) {
                    statusCell.textContent = 'Needs Focus (Decline/Low Score)';
                    statusCell.classList.add('growth-negative');
                } else {
                    statusCell.textContent = 'Stable Progress';
                }
            } else if (data.t2 !== null && data.t2 < 60) {
                 statusCell.textContent = 'Low Score in Term 2';
                 statusCell.classList.add('growth-negative');
            } else {
                statusCell.textContent = 'Completed/New Subject';
            }
        }
    });
}

// --- 5. Digraph (Progression) Analysis Text ---
function generateDigraphInsights() {
    let insights = [];

    // Analyze Prerequisite -> Dependent connections
    for (const [prereq, dependent] of Object.entries(digraphRelations)) {
        const prereqData = studentScores[prereq];
        const dependentData = studentScores[dependent];
        
        const prereqScore = prereqData?.t1;
        const dependentScore = dependentData?.t2;
        const dependentChange = dependentData?.change;
        
        // Only analyze connections where scores exist
        if (prereqScore !== null && dependentScore !== null) {
            
            let insightText = '';
            let insightClass = '';

            if (prereq === dependent) {
                // Continuity subjects (e.g., PL, English)
                if (dependentChange > 5) {
                    insightText = `**${prereq} Continuity:** Strong progress (+${dependentChange.toFixed(1)}%) shows successful retention.`;
                    insightClass = 'insight-green';
                } else if (dependentChange < -5) {
                    insightText = `**${prereq} Continuity:** Significant decline (${dependentChange.toFixed(1)}%) suggests issues in skill retention.`;
                    insightClass = 'insight-red';
                }
            } else {
                // Dependency subjects (e.g., Logic -> Algorithm)
                if (prereqScore < 60 && dependentScore < 60) {
                    insightText = `❌ **Foundational Failure (${prereq} → ${dependent}):** Low scores in both indicate a critical knowledge gap that carried over.`;
                    insightClass = 'insight-red';
                } else if (prereqScore >= 70 && dependentScore < 60) {
                    insightText = `🧐 **Application Gap (${prereq} → ${dependent}):** Good prerequisite score but poor application (${dependentScore.toFixed(0)}%) in the dependent subject.`;
                    insightClass = '';
                } else if (prereqScore < 60 && dependentScore >= 70) {
                    insightText = `💡 **Overcame Prerequisite (${prereq} → ${dependent}):** Impressive jump! Low T1 score was overcome for a high T2 score.`;
                    insightClass = 'insight-green';
                }
            }
            
            if (insightText) {
                insights.push(`<p class="${insightClass}">${insightText}</p>`);
            }
        }
    }

    const insightsDiv = document.getElementById('digraphInsights');
    if (insights.length > 0) {
        insightsDiv.innerHTML = insights.join('');
    } else {
        insightsDiv.innerHTML = "<p>No significant progression trends identified, or necessary scores are missing.</p>";
    }
}


// --- 6. Chart Rendering Function (Visual Digraph) ---
function renderDigraphChart() {
    // 1. Prepare Data for the Chart
    const labels = [];
    const t1Scores = [];
    const t2Scores = [];

    // Filter subjects that have T1 and T2 scores for a meaningful radar comparison
    subjectData.filter(s => s.term1 && s.term2).forEach(subject => {
        const data = studentScores[subject.name];
        // Only include subjects where scores were successfully input for BOTH terms
        if (data && data.t1 !== null && data.t2 !== null) { 
            labels.push(subject.name);
            t1Scores.push(data.t1);
            t2Scores.push(data.t2);
        }
    });

    const ctx = document.getElementById('digraphRadarChart').getContext('2d');

    // Destroy existing chart if it exists to prevent overlap/memory leak
    if (chartInstance) {
        chartInstance.destroy();
    }

    // 2. Render the Radar Chart
    chartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Term 1 Score (Foundation)',
                    data: t1Scores,
                    backgroundColor: 'rgba(0, 123, 255, 0.2)', // Light Blue
                    borderColor: 'rgba(0, 123, 255, 1)',
                    pointBackgroundColor: 'rgba(0, 123, 255, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(0, 123, 255, 1)'
                },
                {
                    label: 'Term 2 Score (Application)',
                    data: t2Scores,
                    backgroundColor: 'rgba(40, 167, 69, 0.2)', // Light Green
                    borderColor: 'rgba(40, 167, 69, 1)',
                    pointBackgroundColor: 'rgba(40, 167, 69, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(40, 167, 69, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    pointLabels: { font: { size: 12 } },
                    ticks: { backdropColor: 'rgba(255, 255, 255, 0.7)' }
                }
            },
            plugins: {
                legend: { position: 'top' },
                title: { display: false }
            }
        }
    });
}


// --- 7. Tab Switching Logic ---
function openTab(evt, tabName) {
    const tabcontents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontents.length; i++) {
        tabcontents[i].style.display = "none";
    }

    const tablinks = document.getElementsByClassName("tab-button");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    if (evt) {
        evt.currentTarget.className += " active";
    } else {
        const targetButton = Array.from(tablinks).find(btn => btn.textContent.includes(tabName === 'dataEntry' ? 'Data Entry' : 'Analysis'));
        if (targetButton) {
            targetButton.className += " active";
        }
    }
}

// --- 8. Initialization: CRITICAL FOR LOADING INPUT ROWS ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. This function creates the input rows
    populateTable(); 
    
    // 2. This sets the default view to the data entry tab
    openTab(null, 'dataEntry');
});

// END script.js