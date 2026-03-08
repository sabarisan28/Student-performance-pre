# 📊 Student Performance Analysis System

A comprehensive web-based student performance tracking and analysis system built with Flask and MySQL.

## 🌟 Features

- **User Authentication** - Secure login and registration system
- **Dashboard** - Interactive overview with charts and statistics
- **Student Management** - Track and manage student profiles
- **Subject Analysis** - Analyze performance by subject
- **Comparison Tools** - Compare student performance
- **Score Prediction** - ML-based score prediction
- **Reports Generation** - Generate detailed performance reports
- **Teacher Insights** - Analytics for educators
- **Trend Analysis** - Track performance trends over time

## 🚀 Tech Stack

- **Backend:** Flask (Python)
- **Database:** MySQL
- **Frontend:** HTML, CSS, JavaScript
- **Charts:** Chart.js
- **Styling:** Bootstrap 5

## 📋 Prerequisites

- Python 3.8+
- MySQL 8.0+
- pip (Python package manager)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/sabarisan28/Student-performance-pre.git
cd Student-performance-pre
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Set up MySQL Database

Create a database in MySQL:
```sql
CREATE DATABASE student_managerment_db;
```

### 4. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your MySQL credentials:
```
FLASK_SECRET=your_secret_key_here
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=student_managerment_db
```

### 5. Run the application
```bash
python app.py
```

The application will be available at `http://127.0.0.1:5000`

## 📁 Project Structure

```
student-project-main/
├── app.py                      # Main Flask application
├── config.py                   # Database configuration
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
├── templates/                 # HTML templates
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── student-profile.html
│   ├── subject-analysis.html
│   ├── comparison.html
│   ├── prediction.html
│   ├── reports.html
│   ├── teacher-insights.html
│   └── trends.html
├── static/                    # Static files
│   ├── css/                  # Stylesheets
│   └── js/                   # JavaScript files
└── student_performance_analysis_100.csv  # Sample data
```

## 🔐 Default Credentials

For testing purposes, you can use:
- **Email:** student@school.edu
- **Password:** password123

Or register a new account through the registration page.

## 📊 Database Schema

The application automatically creates the required tables on first run:

### Users Table
- id (Primary Key)
- username
- password (hashed)
- full_name
- email
- role
- created_at

## 🌐 Deployment Options

### Option 1: PythonAnywhere (Free)
1. Sign up at [pythonanywhere.com](https://www.pythonanywhere.com)
2. Upload your code
3. Set up MySQL database
4. Configure WSGI file
5. Set environment variables

### Option 2: Heroku
1. Install Heroku CLI
2. Create `Procfile`:
   ```
   web: gunicorn app:app
   ```
3. Add `gunicorn` to requirements.txt
4. Deploy:
   ```bash
   heroku create your-app-name
   heroku addons:create cleardb:ignite
   git push heroku main
   ```

### Option 3: Railway
1. Sign up at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add MySQL database
4. Set environment variables
5. Deploy automatically

### Option 4: Render
1. Sign up at [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Add MySQL database
5. Set environment variables

## 🛠️ Development

### Running Tests
```bash
python test_connections.py
```

### Debug Mode
The application runs in debug mode by default. For production, set:
```python
app.run(debug=False)
```

## 📝 Features in Detail

### Dashboard
- Total students count
- Average scores
- Top performers
- Pass rate statistics
- Subject-wise performance charts
- Grade distribution

### Student Profile
- Individual student information
- Course grades and scores
- GPA calculation
- Performance history

### Subject Analysis
- Subject-wise performance metrics
- Comparative analysis
- Trend identification

### Prediction
- ML-based score prediction
- Performance forecasting
- Risk identification

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👥 Authors

- Sabarisan - [GitHub](https://github.com/sabarisan28)

## 🙏 Acknowledgments

- Bootstrap for UI components
- Chart.js for data visualization
- Flask community for excellent documentation

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ by the Student Analyzer Team
