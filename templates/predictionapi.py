<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Student Score Prediction</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f5f6fa;
        }
        .card {
            margin-top: 50px;
            border-radius: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .btn-primary {
            background-color: #0056b3;
        }
        .prediction-result {
            font-size: 1.3rem;
            font-weight: bold;
            color: #28a745;
        }
        .error-message {
            font-size: 1.1rem;
            color: #dc3545;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="card col-md-6 offset-md-3 p-4">
        <h3 class="text-center mb-3">🎓 Student Performance Prediction</h3>
        <form method="POST" action="{{ url_for('predict') }}">
            <div class="mb-3">
                <label for="age" class="form-label">Age</label>
                <input type="number" step="any" class="form-control" id="age" name="age" placeholder="Enter student age" required>
            </div>
            <div class="mb-3">
                <label for="gender" class="form-label">Gender</label>
                <select class="form-select" id="gender" name="gender" required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="attendance" class="form-label">Attendance (%)</label>
                <input type="number" step="any" class="form-control" id="attendance" name="attendance" placeholder="e.g. 85" required>
            </div>
            <div class="mb-3">
                <label for="assignment_submission" class="form-label">Assignment Submission (%)</label>
                <input type="number" step="any" class="form-control" id="assignment_submission" name="assignment_submission" placeholder="e.g. 90" required>
            </div>
            <div class="mb-3">
                <label for="assessment_report" class="form-label">Assessment Report (%)</label>
                <input type="number" step="any" class="form-control" id="assessment_report" name="assessment_report" placeholder="e.g. 80" required>
            </div>
            <div class="mb-3">
                <label for="activity_logs" class="form-label">Activity Logs (Count)</label>
                <input type="number" step="any" class="form-control" id="activity_logs" name="activity_logs" placeholder="e.g. 10" required>
            </div>
            <button type="submit" class="btn btn-primary w-100">Predict Score</button>
        </form>

        {% if prediction %}
        <div class="mt-4 text-center prediction-result">
            🧮 Predicted Score: <span>{{ prediction }}</span>
        </div>
        {% endif %}

        {% if error %}
        <div class="mt-4 text-center error-message">
            ⚠️ Error: {{ error }}
        </div>
        {% endif %}
    </div>
</div>
</body>
</html>
