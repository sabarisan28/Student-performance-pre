import json
import os
from flask import Flask, render_template, request, redirect, url_for, session, flash
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash
app = Flask(__name__)

# Load environment variables from .env if present                                                                       
load_dotenv()

# REQUIRED: Set a secret key for session management
app.secret_key = os.environ.get('FLASK_SECRET', 'safer_key_for_no_keyerror')

# --- Dummy Data (Simulates Database) ---
# Credentials for testing: student@school.edu / password123
DUMMY_USERS = {"student@school.edu": "password123"} 
STUDENT_DATA = {
    "name": "Alex Johnson",
    "overall_gpa": 3.75,
    # Mock data for the summary cards
    "total_students": 120,
    "average_score": 82.5,
    "top_performer": "Sokha",
    "pass_rate": 91.6,
    # Detailed course data for the table and charts
    "courses": [
        {"name": "Calculus I", "grade": "A", "score": 92},
        {"name": "Computer Science", "grade": "A-", "score": 89},
        {"name": "English Literature", "grade": "B+", "score": 87},
        {"name": "Physics", "grade": "C+", "score": 75},
        {"name": "Chemistry", "grade": "B-", "score": 79},
        {"name": "Web Design", "grade": "A+", "score": 95},
    ]
}

DB_HOST = os.environ.get('MYSQL_HOST', '127.0.0.1')
DB_USER = os.environ.get('MYSQL_USER', 'root')
DB_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'Sofiashree5070')
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
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(150) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                email VARCHAR(255),
                role VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )
        conn.commit()
    except Error as e:
        print(f"Error creating users table: {e}")
    finally:
        cur.close()
        conn.close()

# Try to ensure the users table exists (harmless if DB not reachable)
ensure_users_table()
# --- Utility Function for Placeholder Routes ---
def placeholder_page(title):
    """Helper to return simple HTML for unbuilt pages, inheriting the base template."""
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('content.html', title=title) # Renders a simple content page
    
# --- Authentication Routes ---

@app.route('/index')
def index():
    if session.get('logged_in'):
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))





@app.route('/', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        # Try database-backed authentication first
        conn = get_db_connection()
        authenticated = False
        if conn:
            try:
                cur = conn.cursor()
                cur.execute("SELECT password FROM users WHERE username = %s", (username,))
                row = cur.fetchone()
                if row:
                    stored_hash = row[0]
                    if check_password_hash(stored_hash, password):
                        authenticated = True
                cur.close()
            except Error as e:
                print(f"DB error during login: {e}")
            finally:
                conn.close()

        # Fallback to DUMMY_USERS (for development)
        if not authenticated and username in DUMMY_USERS and DUMMY_USERS[username] == password:
            authenticated = True

        if authenticated:
            session['logged_in'] = True
            session['username'] = username
            return redirect(url_for('dashboard'))
        else:
            error = 'Invalid Credentials. Please try again.'
            
    return render_template('login.html', error=error)


@app.route('/register', methods=['GET', 'POST'])
def register():
    error = None
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        full_name = request.form.get('full_name')
        email = request.form.get('email')
        role = request.form.get('role')

        # Basic validation
        if not username or not password:
            error = 'Username and password are required.'
            return render_template('register.html', error=error)

        # Check DB for existing user and insert
        conn = get_db_connection()
        if not conn:
            error = 'Database not available. Please check configuration.'
            return render_template('register.html', error=error)

        try:
            cur = conn.cursor()
            cur.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cur.fetchone():
                error = 'User already exists!'
                cur.close()
                conn.close()
                return render_template('register.html', error=error)

            pwd_hash = generate_password_hash(password)
            cur.execute(
                "INSERT INTO users (username, password, full_name, email, role) VALUES (%s, %s, %s, %s, %s)",
                (username, pwd_hash, full_name, email, role)
            )
            conn.commit()
            cur.close()
        except Error as e:
            print(f"DB error during register: {e}")
            error = 'Registration failed due to a database error.'
            return render_template('register.html', error=error)
        finally:
            conn.close()

        # Optionally log the user in immediately
        session['logged_in'] = True
        session['username'] = username
        return redirect(url_for('dashboard'))
        
    return render_template('register.html', error=error)


@app.route('/logout')
def logout():
    session.clear() # Clears all session data
    return redirect(url_for('login'))

# --- Application Routes ---

@app.route('/dashboard') 
def dashboard():
    # Authentication Guard
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    
    # 1. Prepare data for JavaScript charts
    course_labels = [course["name"] for course in STUDENT_DATA["courses"]]
    course_scores = [course["score"] for course in STUDENT_DATA["courses"]]
    
    # 2. Serialize data to JSON strings for safe transmission to the HTML template
    course_labels_json = json.dumps(course_labels)
    course_scores_json = json.dumps(course_scores)
    
    # 3. Pass all data to the template
    return render_template(
        'dashboard.html', 
        student=STUDENT_DATA,
        current_page='dashboard', # Passed for setting active navbar link
        course_labels_json=course_labels_json,
        course_scores_json=course_scores_json
    )

@app.route('/student-profile')
def student_profile(): 
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    # Pass the specific student data to the profile template
    return render_template('student-profile.html', student=STUDENT_DATA, current_page='student_profile')


# Placeholder routes using the utility function and passing the page title
@app.route('/subject-analysis')
def subject_analysis(): 
    return render_template("subject-analysis.html")
    # return placeholder_page("Subject Analysis")

@app.route('/comparison')
def comparison(): 
    return render_template("comparison.html")

@app.route('/prediction')
def prediction():
    return render_template("prediction.html")

@app.route('/reports')
def reports(): 
    return render_template("reports.html")

@app.route('/teacher-insights')
def teacher_insights(): 
    return render_template("teacher-insights.html")

@app.route('/trends')
def trends(): 
    return render_template("trends.html")

# --- Application Entry Point ---
if __name__ == '__main__':
    app.run(debug=True)

