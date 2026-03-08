from flask import Flask, render_template, jsonify, request
import pymysql

app = Flask(__name__)

def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='student_db',
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route('/')
def index():
    return render_template('student_list.html')

@app.route('/api/students', methods=['GET'])
def get_students():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM students")
        students = cursor.fetchall()
    conn.close()
    return jsonify(students)

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json()
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("INSERT INTO students (name, class, gender) VALUES (%s, %s, %s)",
                       (data['name'], data['class'], data['gender']))
        conn.commit()
    conn.close()
    return jsonify({"message":"Student added"}), 201

if __name__ == '__main__':
    app.run(debug=True)
