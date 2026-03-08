import json
import os
import random
from datetime import datetime
import pandas as pd
import numpy as np
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.model_selection import train_test_split
from joblib import dump, load

app = Flask(__name__)

# Load environment variables
load_dotenv()

app.secret_key = os.environ.get('FLASK_SECRET', 'safer_key_for_no_keyerror')

# ------------------ DATABASE CONFIG ------------------
DB_HOST = os.environ.get('MYSQL_HOST', '127.0.0.1')
DB_USER = os.environ.get('MYSQL_USER', 'root')
DB_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'root')
DB_NAME = os.environ.get('MYSQL_DB', 'student_managerment_db')

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            auth_plugin='mysql_native_password'
        )
        return conn
    except Error as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

def ensure_users_table():
    conn = get_db_connection()
    if not conn:
        return
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(150) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                email VARCHAR(255),
                role VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        conn.commit()
    except Error as e:
        print(f"Error creating users table: {e}")
    finally:
        cur.close()
        conn.close()

ensure_users_table()

# ------------------ DUMMY DATA ------------------
DUMMY_USERS = {"student@school.edu": "password123"} 
STUDENT_DATA = {
    "name": "Alex Johnson",
    "overall_gpa": 3.75,
    "total_students": 120,
    "average_score": 82.5,
    "top_performer": "Sokha",
    "pass_rate": 91.6,
    "courses": [
        {"name": "Calculus I", "grade": "A", "score": 92},
        {"name": "Computer Science", "grade": "A-", "score": 89},
        {"name": "English Literature", "grade": "B+", "score": 87},
        {"name": "Physics", "grade": "C+", "score": 75},
        {"name": "Chemistry", "grade": "B-", "score": 79},
        {"name": "Web Design", "grade": "A+", "score": 95},
    ]
}

# ------------------ ML MODULE SETUP ------------------
DATA_PATH = "student_performance_analysis_100.csv"
MODEL_PATH = "score_predictor.joblib"
FRAUD_MODEL_PATH = "fraud_aware_cnn_gru_attention.joblib"

# 1. Generate dataset if missing
if not os.path.exists(DATA_PATH):
    names = [f"Student_{i}" for i in range(1, 101)]
    ages = [random.randint(18, 25) for _ in range(100)]
    genders = [random.choice(["Male", "Female"]) for _ in range(100)]
    attendance = [random.randint(60, 100) for _ in range(100)]
    assignment_submission = [random.randint(50, 100) for _ in range(100)]
    assessment_report = [random.randint(40, 100) for _ in range(100)]
    activity_logs = [random.randint(0, 20) for _ in range(100)]
    scores = [
        round(0.3 * attendance[i] + 0.3 * assignment_submission[i] +
              0.3 * assessment_report[i] + 0.1 * activity_logs[i] +
              random.uniform(-5, 5), 2)
        for i in range(100)
    ]
    df = pd.DataFrame({
        "Name": names,
        "Age": ages,
        "Gender": genders,
        "Attendance": attendance,
        "Assignment_Submission": assignment_submission,
        "Assessment_Report": assessment_report,
        "Activity_Logs": activity_logs,
        "Scores": scores
    })
    df.to_csv(DATA_PATH, index=False)
else:
    df = pd.read_csv(DATA_PATH)

# 2. Train and save model
if not os.path.exists(MODEL_PATH):
    df_enc = pd.get_dummies(df, columns=["Gender"], drop_first=True)
    X = df_enc[["Age", "Attendance", "Assignment_Submission", "Assessment_Report", "Activity_Logs", "Gender_Male"]]
    y = df_enc["Scores"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = LinearRegression()
    model.fit(X_train, y_train)
    dump(model, MODEL_PATH)
else:
    model = load(MODEL_PATH)


def ensure_prediction_logs_table():
    conn = get_db_connection()
    if not conn:
        return
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS prediction_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(150),
                model_name VARCHAR(100) NOT NULL,
                predicted_score FLOAT NOT NULL,
                fraud_probability FLOAT NULL,
                risk_level VARCHAR(20) NULL,
                payload_json JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        conn.commit()
    except Error as e:
        print(f"Error creating prediction_logs table: {e}")
    finally:
        cur.close()
        conn.close()


def log_prediction(username, model_name, predicted_score, fraud_probability=None, risk_level=None, payload=None):
    conn = get_db_connection()
    if not conn:
        return
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO prediction_logs (username, model_name, predicted_score, fraud_probability, risk_level, payload_json)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                username,
                model_name,
                float(predicted_score),
                None if fraud_probability is None else float(fraud_probability),
                risk_level,
                json.dumps(payload or {})
            )
        )
        conn.commit()
    except Error as e:
        print(f"Error writing prediction log: {e}")
    finally:
        cur.close()
        conn.close()


def get_risk_level(fraud_probability):
    if fraud_probability < 0.30:
        return "Low"
    if fraud_probability < 0.60:
        return "Medium"
    return "High"


def build_behavior_sequence(input_data, timesteps=6):
    age = input_data["Age"]
    gender_male = input_data["Gender_Male"]
    attendance = input_data["Attendance"]
    assignment = input_data["Assignment_Submission"]
    assessment = input_data["Assessment_Report"]
    activity = input_data["Activity_Logs"]
    device_changes = input_data["Device_Changes"]
    tab_switches = input_data["Tab_Switches"]
    delay_minutes = input_data["Submission_Delay_Minutes"]
    ip_changes = input_data["IP_Changes"]

    t = np.arange(timesteps)
    attendance_series = np.clip(attendance + np.linspace(2, -3, timesteps) - (delay_minutes * 0.015), 0, 100)
    assignment_series = np.clip(assignment + np.linspace(1, -2, timesteps) - (delay_minutes * 0.01), 0, 100)
    assessment_series = np.clip(assessment + np.sin(t) * 2.0 + (tab_switches * 0.01), 0, 100)
    activity_series = np.clip(activity + np.cos(t) * 1.5 - (tab_switches * 0.02), 0, 100)
    device_series = np.clip(device_changes + np.linspace(0, 1.5, timesteps), 0, 20)
    tab_series = np.clip(tab_switches + np.linspace(0, 10, timesteps), 0, 120)
    delay_series = np.clip(delay_minutes + np.linspace(0, 20, timesteps), 0, 600)
    ip_series = np.clip(ip_changes + np.linspace(0, 2, timesteps), 0, 20)
    age_series = np.full(timesteps, age)
    gender_series = np.full(timesteps, gender_male)

    return np.column_stack([
        age_series,
        gender_series,
        attendance_series,
        assignment_series,
        assessment_series,
        activity_series,
        device_series,
        tab_series,
        delay_series,
        ip_series
    ])


def extract_top_risk_factors(input_data):
    risk_signals = {
        "Tab switching during assessment": input_data["Tab_Switches"] / 80.0,
        "Frequent device changes": input_data["Device_Changes"] / 8.0,
        "Frequent IP changes": input_data["IP_Changes"] / 6.0,
        "Late submission behavior": input_data["Submission_Delay_Minutes"] / 180.0,
        "Assessment vs engagement gap": max(
            0.0,
            (input_data["Assessment_Report"] - ((input_data["Attendance"] + input_data["Assignment_Submission"]) / 2.0)) / 100.0
        ),
    }
    sorted_factors = sorted(risk_signals.items(), key=lambda x: x[1], reverse=True)
    return [k for k, v in sorted_factors[:3] if v > 0.05]


class FraudAwareCnnGruAttentionModel:
    """
    Lightweight CNN-GRU-Attention-inspired model:
    - Temporal convolution block over behavior sequence
    - GRU-like recurrent state accumulation
    - Attention over suspicious timesteps
    - Linear heads for score regression and fraud probability
    """

    def __init__(self):
        self.conv_kernel = np.array([0.2, 0.6, 0.2], dtype=float)
        self.score_head = LinearRegression()
        self.fraud_head = LogisticRegression(max_iter=500)

    def _softmax(self, x):
        z = x - np.max(x)
        exp = np.exp(z)
        denom = np.sum(exp)
        if denom <= 0:
            return np.full_like(x, 1.0 / len(x))
        return exp / denom

    def _encode(self, sequence):
        seq = np.asarray(sequence, dtype=float)
        if seq.shape[0] < 3:
            pad = np.repeat(seq[-1:, :], 3 - seq.shape[0], axis=0)
            seq = np.vstack([seq, pad])

        conv_steps = seq.shape[0] - 2
        conv_out = np.zeros((conv_steps, seq.shape[1]), dtype=float)
        for i in range(conv_steps):
            conv_out[i] = (
                self.conv_kernel[0] * seq[i]
                + self.conv_kernel[1] * seq[i + 1]
                + self.conv_kernel[2] * seq[i + 2]
            )

        h = np.zeros(seq.shape[1], dtype=float)
        states = []
        for row in conv_out:
            h = np.tanh(0.55 * h + 0.45 * row)
            states.append(h.copy())
        states = np.asarray(states)

        anomaly_logits = (
            0.30 * seq[2:, 6]  # device changes
            + 0.30 * seq[2:, 7]  # tab switches
            + 0.20 * seq[2:, 8]  # submission delays
            + 0.20 * seq[2:, 9]  # ip changes
            + 0.15 * np.abs(seq[2:, 4] - seq[2:, 3])  # assessment vs assignment gap
        )
        attention = self._softmax(anomaly_logits)
        context = np.sum(attention[:, None] * states, axis=0)
        encoded = np.concatenate([context, states[-1], seq.mean(axis=0), seq.std(axis=0)])
        return encoded, attention

    def fit(self, sequences, score_targets, fraud_targets):
        encoded = [self._encode(seq)[0] for seq in sequences]
        X = np.asarray(encoded, dtype=float)
        self.score_head.fit(X, np.asarray(score_targets, dtype=float))
        self.fraud_head.fit(X, np.asarray(fraud_targets, dtype=int))

    def predict(self, sequence):
        encoded, attention = self._encode(sequence)
        pred_score = float(self.score_head.predict([encoded])[0])
        fraud_prob = float(self.fraud_head.predict_proba([encoded])[0][1])
        return pred_score, fraud_prob, attention


def generate_fraud_training_data(samples=1200):
    sequences = []
    score_targets = []
    fraud_targets = []

    for _ in range(samples):
        age = random.randint(18, 27)
        gender = random.choice([0.0, 1.0])
        attendance = random.uniform(55, 100)
        assignment = random.uniform(45, 100)
        assessment = random.uniform(40, 100)
        activity = random.uniform(2, 25)
        device_changes = random.uniform(0, 8)
        tab_switches = random.uniform(0, 70)
        delay_minutes = random.uniform(0, 240)
        ip_changes = random.uniform(0, 6)

        sample = {
            "Age": age,
            "Gender_Male": gender,
            "Attendance": attendance,
            "Assignment_Submission": assignment,
            "Assessment_Report": assessment,
            "Activity_Logs": activity,
            "Device_Changes": device_changes,
            "Tab_Switches": tab_switches,
            "Submission_Delay_Minutes": delay_minutes,
            "IP_Changes": ip_changes,
        }
        seq = build_behavior_sequence(sample)

        engagement = (attendance + assignment + min(activity * 4.0, 100.0)) / 3.0
        score = (
            0.45 * assessment
            + 0.40 * engagement
            - 0.04 * delay_minutes
            + random.uniform(-4.5, 4.5)
        )
        score = float(np.clip(score, 0, 100))

        fraud_signal = (
            0.05 * tab_switches
            + 0.10 * device_changes
            + 0.08 * ip_changes
            + 0.015 * delay_minutes
            + max(0.0, assessment - engagement) * 0.05
        )
        fraud_prob = 1.0 / (1.0 + np.exp(-(fraud_signal - 6.5)))
        fraud = 1 if random.random() < fraud_prob else 0

        sequences.append(seq)
        score_targets.append(score)
        fraud_targets.append(fraud)

    return sequences, np.array(score_targets), np.array(fraud_targets)


def load_or_train_fraud_model():
    if os.path.exists(FRAUD_MODEL_PATH):
        return load(FRAUD_MODEL_PATH)

    sequences, score_targets, fraud_targets = generate_fraud_training_data()
    model_obj = FraudAwareCnnGruAttentionModel()
    model_obj.fit(sequences, score_targets, fraud_targets)
    dump(model_obj, FRAUD_MODEL_PATH)
    return model_obj


ensure_prediction_logs_table()
fraud_aware_model = load_or_train_fraud_model()

# ------------------ AUTH ROUTES ------------------
@app.route('/')
def index():
    if session.get('logged_in'):
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = get_db_connection()
        authenticated = False
        if conn:
            try:
                cur = conn.cursor()
                cur.execute("SELECT password FROM users WHERE username = %s", (username,))
                row = cur.fetchone()
                if row and check_password_hash(row[0], password):
                    authenticated = True
                cur.close()
            except Error as e:
                print(f"DB error: {e}")
            finally:
                conn.close()
        if not authenticated and username in DUMMY_USERS and DUMMY_USERS[username] == password:
            authenticated = True
        if authenticated:
            session['logged_in'] = True
            session['username'] = username
            return redirect(url_for('dashboard'))
        else:
            error = "Invalid Credentials"
    return render_template('login.html', error=error)

@app.route('/register', methods=['GET', 'POST'])
def register():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        full_name = request.form.get('full_name')
        email = request.form.get('email')
        role = request.form.get('role')

        if not username or not password:
            error = 'Username and password required'
            return render_template('register.html', error=error)

        conn = get_db_connection()
        if not conn:
            error = 'Database not available'
            return render_template('register.html', error=error)
        try:
            cur = conn.cursor()
            cur.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cur.fetchone():
                error = 'User already exists'
            else:
                pwd_hash = generate_password_hash(password)
                cur.execute("INSERT INTO users (username, password, full_name, email, role) VALUES (%s, %s, %s, %s, %s)",
                            (username, pwd_hash, full_name, email, role))
                conn.commit()
                session['logged_in'] = True
                session['username'] = username
                return redirect(url_for('dashboard'))
        finally:
            cur.close()
            conn.close()
    return render_template('register.html', error=error)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# ------------------ MAIN PAGES ------------------
@app.route('/dashboard')
def dashboard():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    course_labels = [c["name"] for c in STUDENT_DATA["courses"]]
    course_scores = [c["score"] for c in STUDENT_DATA["courses"]]
    return render_template(
        'dashboard.html',
        student=STUDENT_DATA,
        current_page='dashboard',
        course_labels_json=json.dumps(course_labels),
        course_scores_json=json.dumps(course_scores)
    )

@app.route('/student-profile')
def student_profile(): 
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('student-profile.html', student=STUDENT_DATA, current_page='student_profile')

@app.route('/subject-analysis')
def subject_analysis(): 
    return render_template("subject-analysis.html")

@app.route('/comparison')
def comparison(): 
    return render_template("comparison.html")

@app.route('/reports')
def reports(): 
    return render_template("reports.html")

@app.route('/teacher-insights')
def teacher_insights(): 
    return render_template("teacher-insights.html")

@app.route('/trends')
def trends(): 
    return render_template("trends.html")

# ------------------ ML PREDICTION ROUTES ------------------
@app.route('/prediction', methods=['GET', 'POST'])
def prediction():
    if request.method == 'POST':
        mode = request.form.get('mode', 'score')

        if mode == 'fraud_aware':
            try:
                fraud_input = {
                    'Age': float(request.form['fa_age']),
                    'Attendance': float(request.form['fa_attendance']),
                    'Assignment_Submission': float(request.form['fa_assignment_submission']),
                    'Assessment_Report': float(request.form['fa_assessment_report']),
                    'Activity_Logs': float(request.form['fa_activity_logs']),
                    'Gender_Male': 1.0 if request.form['fa_gender'] == 'Male' else 0.0,
                    'Device_Changes': float(request.form['fa_device_changes']),
                    'Tab_Switches': float(request.form['fa_tab_switches']),
                    'Submission_Delay_Minutes': float(request.form['fa_submission_delay_minutes']),
                    'IP_Changes': float(request.form['fa_ip_changes']),
                }
                sequence = build_behavior_sequence(fraud_input)
                predicted_score, fraud_probability, attention = fraud_aware_model.predict(sequence)
                risk_level = get_risk_level(fraud_probability)
                peak_attention_step = int(np.argmax(attention)) + 1
                top_risk_factors = extract_top_risk_factors(fraud_input)

                result = {
                    "predicted_score": round(float(np.clip(predicted_score, 0, 100)), 2),
                    "fraud_probability": round(float(np.clip(fraud_probability, 0, 1)), 4),
                    "risk_level": risk_level,
                    "attention_peak_step": peak_attention_step,
                    "top_risk_factors": top_risk_factors,
                    "generated_at": datetime.utcnow().isoformat() + "Z",
                }

                log_prediction(
                    username=session.get('username'),
                    model_name='cnn_gru_attention_fraud_aware',
                    predicted_score=result["predicted_score"],
                    fraud_probability=result["fraud_probability"],
                    risk_level=result["risk_level"],
                    payload=fraud_input
                )
                return render_template('prediction.html', fraud_result=result)
            except Exception as e:
                return render_template('prediction.html', fraud_error=str(e))

        try:
            data = {
                'Age': float(request.form['age']),
                'Attendance': float(request.form['attendance']),
                'Assignment_Submission': float(request.form['assignment_submission']),
                'Assessment_Report': float(request.form['assessment_report']),
                'Activity_Logs': float(request.form['activity_logs']),
                'Gender_Male': 1.0 if request.form['gender'] == 'Male' else 0.0
            }
            input_df = pd.DataFrame([data])
            predicted_score = model.predict(input_df)[0]
            predicted_score = round(float(predicted_score), 2)
            log_prediction(
                username=session.get('username'),
                model_name='linear_regression_score',
                predicted_score=predicted_score,
                payload=data
            )
            return render_template('prediction.html', prediction=predicted_score)
        except Exception as e:
            return render_template('prediction.html', error=str(e))
    return render_template('prediction.html')

@app.route('/predict_api', methods=['POST'])
def predict_api():
    data = request.get_json()
    input_df = pd.DataFrame([data])
    prediction = model.predict(input_df)[0]
    return jsonify({'predicted_score': round(prediction, 2)})


@app.route('/predict_fraud_api', methods=['POST'])
def predict_fraud_api():
    try:
        data = request.get_json()
        fraud_input = {
            'Age': float(data['Age']),
            'Attendance': float(data['Attendance']),
            'Assignment_Submission': float(data['Assignment_Submission']),
            'Assessment_Report': float(data['Assessment_Report']),
            'Activity_Logs': float(data['Activity_Logs']),
            'Gender_Male': float(data['Gender_Male']),
            'Device_Changes': float(data['Device_Changes']),
            'Tab_Switches': float(data['Tab_Switches']),
            'Submission_Delay_Minutes': float(data['Submission_Delay_Minutes']),
            'IP_Changes': float(data['IP_Changes']),
        }

        sequence = build_behavior_sequence(fraud_input)
        predicted_score, fraud_probability, attention = fraud_aware_model.predict(sequence)
        result = {
            'predicted_score': round(float(np.clip(predicted_score, 0, 100)), 2),
            'fraud_probability': round(float(np.clip(fraud_probability, 0, 1)), 4),
            'risk_level': get_risk_level(fraud_probability),
            'attention_peak_step': int(np.argmax(attention)) + 1,
            'top_risk_factors': extract_top_risk_factors(fraud_input)
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ------------------ ENTRY ------------------
if __name__ == '__main__':
    app.run(debug=True)
