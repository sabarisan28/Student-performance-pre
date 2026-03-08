# 🚀 Deployment Guide

Complete guide to deploy your Student Performance Analysis System to various hosting platforms.

---

## 🌟 Quick Hosting Options Comparison

| Platform | Free Tier | Database | Difficulty | Best For |
|----------|-----------|----------|------------|----------|
| **PythonAnywhere** | ✅ Yes | MySQL included | Easy | Beginners |
| **Render** | ✅ Yes | PostgreSQL free | Easy | Quick deploy |
| **Railway** | ✅ Limited | MySQL/PostgreSQL | Medium | Modern apps |
| **Heroku** | ❌ No (paid) | ClearDB MySQL | Medium | Production |
| **Vercel** | ✅ Yes | External DB needed | Hard | Not ideal for Flask |

---

## 🎯 Recommended: PythonAnywhere (FREE & EASY)

### Why PythonAnywhere?
- ✅ Completely FREE tier
- ✅ MySQL database included
- ✅ Easy setup for Flask apps
- ✅ No credit card required
- ✅ Perfect for students/learning

### Step-by-Step Deployment

#### 1. Sign Up
- Go to [pythonanywhere.com](https://www.pythonanywhere.com)
- Click "Pricing & signup"
- Choose "Create a Beginner account" (FREE)

#### 2. Upload Your Code

**Option A: Using Git (Recommended)**
```bash
# In PythonAnywhere Bash console
git clone https://github.com/sabarisan28/Student-performance-pre.git
cd Student-performance-pre
```

**Option B: Upload Files**
- Use the "Files" tab to upload your project folder

#### 3. Set Up Virtual Environment
```bash
# In PythonAnywhere Bash console
cd Student-performance-pre
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 4. Create MySQL Database
- Go to "Databases" tab
- Initialize MySQL (set a password)
- Create database: `student_managerment_db`
- Note your database details:
  - Host: `yourusername.mysql.pythonanywhere-services.com`
  - Username: `yourusername`
  - Database: `yourusername$student_managerment_db`

#### 5. Configure Environment Variables
Create `.env` file:
```bash
nano .env
```

Add:
```
FLASK_SECRET=your_random_secret_key_here
MYSQL_HOST=yourusername.mysql.pythonanywhere-services.com
MYSQL_USER=yourusername
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=yourusername$student_managerment_db
```

#### 6. Set Up Web App
- Go to "Web" tab
- Click "Add a new web app"
- Choose "Manual configuration"
- Select Python 3.10

#### 7. Configure WSGI File
Click on WSGI configuration file and replace content with:

```python
import sys
import os
from dotenv import load_dotenv

# Add your project directory to the sys.path
project_home = '/home/yourusername/Student-performance-pre'
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

# Load environment variables
load_dotenv(os.path.join(project_home, '.env'))

# Import Flask app
from app import app as application
```

#### 8. Set Virtual Environment Path
- In "Web" tab, find "Virtualenv" section
- Enter: `/home/yourusername/Student-performance-pre/venv`

#### 9. Set Static Files
- URL: `/static/`
- Directory: `/home/yourusername/Student-performance-pre/static/`

#### 10. Reload and Test
- Click "Reload" button
- Visit: `yourusername.pythonanywhere.com`

---

## 🚂 Alternative: Railway (Modern & Easy)

### Step-by-Step

#### 1. Sign Up
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

#### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository

#### 3. Add MySQL Database
- Click "New"
- Select "Database" → "MySQL"
- Railway will create and connect it automatically

#### 4. Configure Environment Variables
In your service settings, add:
```
FLASK_SECRET=your_secret_key
MYSQL_HOST=${{MySQL.MYSQL_HOST}}
MYSQL_USER=${{MySQL.MYSQL_USER}}
MYSQL_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
MYSQL_DB=student_managerment_db
PORT=5000
```

#### 5. Add Start Command
In Settings → Deploy:
```
gunicorn app:app
```

#### 6. Deploy
- Railway auto-deploys on git push
- Get your URL from the deployment

---

## 🎨 Alternative: Render (Free Tier Available)

### Step-by-Step

#### 1. Sign Up
- Go to [render.com](https://render.com)
- Sign up with GitHub

#### 2. Create Web Service
- Click "New +"
- Select "Web Service"
- Connect your GitHub repository

#### 3. Configure Service
```
Name: student-performance-app
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

#### 4. Add PostgreSQL Database (Free)
- Click "New +"
- Select "PostgreSQL"
- Note the connection details

#### 5. Update for PostgreSQL
Install psycopg2 in requirements.txt:
```
psycopg2-binary
```

Update config.py to support PostgreSQL:
```python
import os
from dotenv import load_dotenv

load_dotenv()

# Check if using PostgreSQL or MySQL
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL and DATABASE_URL.startswith('postgres'):
    # PostgreSQL configuration
    import psycopg2
    # Parse DATABASE_URL and configure
else:
    # MySQL configuration
    import mysql.connector
    DB_CONFIG = {
        'host': os.getenv('MYSQL_HOST', 'localhost'),
        'user': os.getenv('MYSQL_USER', 'root'),
        'password': os.getenv('MYSQL_PASSWORD', ''),
        'database': os.getenv('MYSQL_DB', 'student_managerment_db')
    }
```

#### 6. Set Environment Variables
In Render dashboard, add:
```
FLASK_SECRET=your_secret_key
DATABASE_URL=(auto-filled by Render)
```

#### 7. Deploy
- Render auto-deploys
- Get your URL: `your-app.onrender.com`

---

## 🔧 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] `.env` file is in `.gitignore` (already done)
- [ ] `requirements.txt` is up to date
- [ ] `Procfile` exists for Heroku/Railway
- [ ] Database credentials are in environment variables
- [ ] `gunicorn` is in requirements.txt
- [ ] Debug mode is set to False for production
- [ ] All sensitive data removed from code

---

## 🔒 Security Best Practices

### 1. Never Commit Sensitive Data
```bash
# Always in .gitignore:
.env
*.db
config_local.py
```

### 2. Use Strong Secret Keys
```python
# Generate a secure secret key:
import secrets
print(secrets.token_hex(32))
```

### 3. Set Debug to False in Production
```python
if __name__ == '__main__':
    app.run(debug=False)  # Production
```

### 4. Use Environment Variables
Never hardcode:
- Database passwords
- API keys
- Secret keys

---

## 🐛 Common Deployment Issues

### Issue 1: Module Not Found
**Solution:** Ensure all dependencies are in `requirements.txt`
```bash
pip freeze > requirements.txt
```

### Issue 2: Database Connection Failed
**Solution:** Check environment variables and database host
- Verify MYSQL_HOST is correct
- Check if database exists
- Verify credentials

### Issue 3: Static Files Not Loading
**Solution:** Configure static file serving
```python
# In app.py
app.static_folder = 'static'
app.static_url_path = '/static'
```

### Issue 4: Port Already in Use
**Solution:** Use environment PORT variable
```python
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
```

---

## 📊 Post-Deployment Testing

After deployment, test:

1. **Homepage loads** - Visit your URL
2. **Login works** - Try logging in
3. **Registration works** - Create new account
4. **Database connected** - Check if data persists
5. **All pages accessible** - Navigate through all routes
6. **Static files load** - Check CSS/JS/images
7. **Forms submit** - Test all forms
8. **Charts display** - Verify Chart.js works

---

## 🎉 Your App is Live!

Once deployed, share your app:
- **PythonAnywhere:** `yourusername.pythonanywhere.com`
- **Railway:** `your-app.up.railway.app`
- **Render:** `your-app.onrender.com`

---

## 📞 Need Help?

- Check platform documentation
- Review error logs in hosting dashboard
- Test locally first: `python app.py`
- Verify environment variables are set

---

## 🚀 Next Steps

1. **Custom Domain** - Add your own domain name
2. **SSL Certificate** - Enable HTTPS (usually automatic)
3. **Monitoring** - Set up uptime monitoring
4. **Backups** - Regular database backups
5. **Analytics** - Add Google Analytics

---

Made with ❤️ by the Student Analyzer Team
