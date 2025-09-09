import os
import io
import base64
import face_recognition
from PIL import Image
import numpy as np
from twilio.rest import Client  # Import Twilio Client

from flask import Flask, request, jsonify, session, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime
from urllib.parse import quote_plus
from werkzeug.security import generate_password_hash, check_password_hash

# Load environment variables
load_dotenv(override=True)

# Initialize Flask app
app = Flask(__name__, template_folder="../frontend/templates", static_folder="../frontend/static")
CORS(app)

# Debug: Print DB config
print("MYSQL_HOST:", os.getenv("MYSQL_HOST"))
print("MYSQL_USER:", os.getenv("MYSQL_USER"))
print("MYSQL_DB:", os.getenv("MYSQL_DB"))

# MySQL password encoding
encoded_password = quote_plus(os.getenv("MYSQL_PASSWORD"))

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('MYSQL_USER')}:{encoded_password}@{os.getenv('MYSQL_HOST')}/{os.getenv('MYSQL_DB')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'

# Twilio Configuration
# Twilio Configuration (hardcoded)
app.config['TWILIO_ACCOUNT_SID'] = "AC01b65457f9eeb22f110d7ad835617c49"
app.config['TWILIO_AUTH_TOKEN'] = "f8033449b5378d91408b00ad4239a5fc"
app.config['TWILIO_PHONE_NUMBER'] = "+19136758209"


# Initialize Extensions
db = SQLAlchemy(app)

# Ensure faces directory exists
if not os.path.exists("faces"):
    os.makedirs("faces")

# ========== DATABASE MODELS ========== #
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

class SessionYear(db.Model):
    __tablename__ = 'session'
    id = db.Column(db.Integer, primary_key=True)
    session_year = db.Column(db.String(10), nullable=False)

class Student(db.Model):
    __tablename__ = 'student'
    student_id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)  # Added phone number field
    course = db.Column(db.String(50), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'), nullable=False)

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id'), nullable=False)
    subject = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum('P', 'A'), nullable=False)

class Subject(db.Model):
    __tablename__ = 'subject'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)

# ========== FRONTEND ROUTES ========== #
@app.route('/')
def home():
    if "user" in session:
        return redirect(url_for('index_page'))
    return redirect(url_for('login_page'))

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/index')
def index_page():
    if "user" not in session:
        return redirect(url_for("login_page"))
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    if "user" not in session:
        return redirect(url_for("login_page"))
    return render_template('dashboard.html')

@app.route('/attendance_report')
def attendance_report():
    if "user" not in session:
        return redirect(url_for("login_page"))
    return render_template('attendance_report.html')

# ========== API ROUTES ========== #
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        new_user = User(username=data['username'], password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = User.query.filter_by(username=data['username']).first()
        if user and check_password_hash(user.password, data['password']):
            session.permanent = True
            session['user'] = user.username
            return jsonify({"user": user.username, "message": "Login successful"})
        return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/logout', methods=['GET'])
def logout():
    session.pop('user', None)
    return jsonify({"message": "Logged out successfully"})

@app.route('/api/students', methods=['POST'])
def add_student():
    try:
        data = request.json
        
        # Check if the required fields are present
        student_name = data.get('student_name')
        email = data.get('email')
        phone = data.get('phone')
        course = data.get('course', "General")  # Default course to "General"
        session_id = data.get('session_id', 1)  # Default session_id to 1

        if not student_name or not email or not phone:
            return jsonify({"error": "Missing required fields (student_name, email, phone)"}), 400
        
        # Validate email format (basic validation)
        if '@' not in email:
            return jsonify({"error": "Invalid email format"}), 400
        
        # Check if student already exists based on email
        existing_student = Student.query.filter_by(email=email).first()
        if existing_student:
            return jsonify({"error": "Student with this email already exists"}), 400
        
        # Add student to the database
        new_student = Student(student_name=student_name, email=email, phone=phone, course=course, session_id=session_id)
        db.session.add(new_student)
        db.session.commit()

        return jsonify({"message": "Student added successfully"})
    except Exception as e:
        # Log the error and provide more information for debugging
        print(f"❌ Error adding student: {str(e)}")
        return jsonify({"error": "An error occurred while adding the student. Please try again."}), 500


@app.route('/api/students_by_email', methods=['POST'])
def get_student_by_email():
    try:
        data = request.json
        student = Student.query.filter_by(email=data['email']).first()
        if student:
            return jsonify({"student_id": student.student_id})
        return jsonify({"message": "Student not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/attendance', methods=['POST'])
def mark_attendance():
    try:
        data = request.json
        new_attendance = Attendance(
            student_id=data['student_id'],
            subject=data['subject_code'],  # subject code is stored in the database
            date=datetime.strptime(data['date'], "%Y-%m-%d"),
            status=data['status']
        )
        db.session.add(new_attendance)
        db.session.commit()

        student = Student.query.get(data['student_id'])
        subject = Subject.query.filter_by(code=data['subject_code']).first()  # Retrieve the subject by code
        
        if student and subject and data['status'] == "Present":
            send_sms(student.student_name, data['date'], subject.name)  # Send message with student name, date, and subject

        return jsonify({"message": "Attendance marked successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Consolidated version of send_sms function
def send_sms(student_name, date, subject_name):
    try:
        # Use a hardcoded phone number (replace with the phone number you want the SMS sent to)
        to_phone = '+918822182793'  # Replace this with the phone number you want the SMS sent to

        client = Client(app.config['TWILIO_ACCOUNT_SID'], app.config['TWILIO_AUTH_TOKEN'])
        message = client.messages.create(
            body=f"Hello {student_name},\n\nYou have been marked PRESENT on {date} for the subject {subject_name}.\n\nRegards, Attendance System",
            from_=app.config['TWILIO_PHONE_NUMBER'],
            to=to_phone
        )
        print(f"📱 SMS sent to {to_phone}")
    except Exception as e:
        print(f"❌ SMS error: {e}")



@app.route('/test_sms', methods=['GET'])
def test_sms():
    try:
        client = Client(app.config['TWILIO_ACCOUNT_SID'], app.config['TWILIO_AUTH_TOKEN'])
        message = client.messages.create(
            body="✅ Attendance marked successfully on 03-05-2025.",
            from_=app.config['TWILIO_PHONE_NUMBER'],
            to='+918822182793'
        )
        return jsonify({"status": "success", "sid": message.sid})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})



@app.route('/api/attendance/<subject_code>', methods=['GET'])
def get_attendance(subject_code):
    try:
        records = Attendance.query.filter_by(subject=subject_code).all()
        result = [{"student_id": r.student_id, "date": r.date.strftime("%Y-%m-%d"), "status": r.status} for r in records]
        return jsonify({"data": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/api/register_face', methods=['POST'])
def register_face():
    try:
        data = request.json
        username = data['username']
        img_data = base64.b64decode(data['image'].split(',')[1])
        face_path = os.path.join("faces", f"{username}.jpg")
        with open(face_path, "wb") as f:
            f.write(img_data)
        return jsonify({"message": "Face registered successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/face_login', methods=['POST'])
def face_login():
    try:
        data = request.json
        img_data = base64.b64decode(data['image'].split(',')[1])
        known_encodings = []
        known_users = []
        for filename in os.listdir("faces"):
            if filename.endswith(".jpg"):
                image = face_recognition.load_image_file(os.path.join("faces", filename))
                encoding = face_recognition.face_encodings(image)
                if encoding:
                    known_encodings.append(encoding[0])
                    known_users.append(filename.replace(".jpg", ""))
        image = Image.open(io.BytesIO(img_data)).convert("RGB")
        unknown_image = np.array(image)
        face_locations = face_recognition.face_locations(unknown_image)
        if not face_locations:
            return jsonify({"message": "No face detected. Please try again."}), 400
        unknown_encodings = face_recognition.face_encodings(unknown_image, face_locations)
        if not unknown_encodings:
            return jsonify({"message": "Face encoding failed. Try again."}), 400
        face_landmarks = face_recognition.face_landmarks(unknown_image)
        if not face_landmarks or len(face_landmarks[0].keys()) < 7:
            return jsonify({"message": "Face partially obscured, please ensure visibility"}), 400
        landmarks = face_landmarks[0]
        if 'top_lip' in landmarks and 'bottom_lip' in landmarks:
            mouth_height = np.linalg.norm(np.array(landmarks['top_lip'][3]) - np.array(landmarks['bottom_lip'][3]))
            if mouth_height < 5:
                return jsonify({"message": "Mask detected, please remove it"}), 400
        if 'chin' in landmarks:
            forehead_y = landmarks['chin'][0][1] - 20
            if forehead_y < 0:
                return jsonify({"message": "Cap detected, please remove it"}), 400
        matches = face_recognition.compare_faces(known_encodings, unknown_encodings[0], tolerance=0.68)
        if True in matches:
            matched_user = known_users[matches.index(True)]
            session['user'] = matched_user
            return jsonify({"user": matched_user, "message": "Face login successful!"})
        return jsonify({"message": "Face not recognized"}), 401
    except Exception as e:
        print("❌ Face login error:", e)
        return jsonify({"error": str(e)}), 500
    

# ========== RUN FLASK SERVER ========== #
if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables created successfully!")
        except Exception as e:
            print("❌ Error creating tables:", e)
    try:
        app.run(debug=True, use_reloader=False)
    except Exception as e:
        print("❌ Error starting Flask app:", e)
