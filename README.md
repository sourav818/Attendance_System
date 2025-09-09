📘 Student Attendance System

A web-based Student Attendance Management System that simplifies and automates the process of tracking student attendance. It integrates Flask (Python), MySQL, Face Recognition, and Twilio SMS API to provide a secure, scalable, and user-friendly platform for educational institutions.

🚀 Features

🔐 User Authentication – Login with username/password or facial recognition.

🧑‍🎓 Student Management – Add, edit, and delete student details.

📚 Session & Subject Management – Manage academic sessions and subjects dynamically.

📝 Attendance Marking – Mark daily attendance with biometric verification.

📊 Visual Reports – Attendance statistics displayed with Chart.js.

📩 SMS Notifications – Automated real-time notifications via Twilio.

📖 Awareness Articles – Promotes importance of attendance and academic practices.

🛠️ Tech Stack

Frontend: HTML, CSS, JavaScript, Chart.js

Backend: Flask (Python)

Database: MySQL

Authentication: Face Recognition (Python library)

Notifications: Twilio SMS API

⚙️ Installation

Clone the repository:

git clone https://github.com/your-username/student-attendance-system.git
cd student-attendance-system


Create and activate a virtual environment:

python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows


Install dependencies:

pip install -r requirements.txt


Set up the MySQL database:

Import the provided SQL schema into MySQL.

Update database credentials in config.py.

Configure Twilio API for SMS notifications:

Add your Twilio credentials in config.py.

Run the application:

flask run


Open in your browser:

http://127.0.0.1:5000/

🧪 Testing

✅ Unit testing (login, attendance marking, notifications)

✅ Integration testing (Flask + MySQL + Face Recognition)

✅ End-to-end workflow testing

✅ Performance testing under multiple users

📌 Future Enhancements

📱 Mobile app integration

📍 Geofencing for attendance validation

🤖 Predictive analytics using ML models

📤 Email notifications in addition to SMS

 Here’s a requirements.txt file you can add to your GitHub repo. It includes all the essential dependencies your Student Attendance System needs (based on your report

Student Attendance System Final…

):

Flask==2.3.3
Flask-MySQLdb==1.0.1
mysqlclient==2.2.0
face-recognition==1.3.0
dlib==19.24.2
opencv-python==4.8.0.74
numpy==1.24.3
Pillow==10.0.0
twilio==8.5.0
chart-studio==1.1.0
gunicorn==21.2.0
requests==2.31.0


🔑 Notes:

Flask-MySQLdb + mysqlclient → MySQL connection.

face-recognition, dlib, opencv-python, Pillow → biometric face authentication.

twilio → SMS notification.

chart-studio (optional) → for chart exports if needed.

gunicorn → for deployment (Heroku/AWS).

#Folder Structure
A professional folder structure you can use for your Student Attendance System GitHub repo. It follows modular Flask best practices and matches your project report

Student Attendance System Final…

.

student-attendance-system/
│── README.md
│── requirements.txt
│── config.py                # Database & Twilio configuration
│── run.py                   # Flask entry point
│── .gitignore
│── LICENSE
│
├── backend/
│   ├── __init__.py          # Flask app factory
│   ├── models.py            # Database models (Students, Sessions, Attendance)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py   # Login (username/password + face recognition)
│   │   ├── student_routes.py
│   │   ├── attendance_routes.py
│   │   ├── report_routes.py # Charts, analytics
│   │   └── notification_routes.py # Twilio SMS
│   ├── services/
│   │   ├── face_service.py  # Face recognition logic
│   │   ├── sms_service.py   # Twilio integration
│   │   └── db_service.py    # MySQL queries
│   └── utils/
│       ├── validators.py
│       └── helpers.py
│
├── frontend/
│   ├── static/              # CSS, JS, images
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   ├── main.js
│   │   │   └── chart.js     # Attendance visualization
│   │   └── images/
│   └── templates/           # HTML templates (Jinja2)
│       ├── base.html
│       ├── login.html
│       ├── dashboard.html
│       ├── attendance.html
│       ├── reports.html
│       └── articles.html
│
├── database/
│   ├── schema.sql           # MySQL schema
│   └── seed_data.sql        # Sample data
│
├── tests/
│   ├── test_auth.py
│   ├── test_attendance.py
│   ├── test_reports.py
│   └── test_notifications.py
│
└── docs/
    ├── System_Architecture.png
    ├── DFD.png
    ├── UseCaseDiagram.png
    └── Final_Report.pdf


✨ With this structure:

backend/ → All Python logic (routes, models, services).

frontend/ → Templates + static files (CSS/JS/Images).

database/ → Schema & initial data.

tests/ → Unit & integration tests.

docs/ → Diagrams & your PDF report.

👨‍💻 Author
Sourav Paul – GitHub
Guided by Dr. Gunikhan Sonowal (Assam down town University).

📜 License

This project is licensed under the MIT License – see the LICENSE
 file for details.
