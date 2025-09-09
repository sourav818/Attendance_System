-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS attendance_system;
USE attendance_system;

-- Session Table
CREATE TABLE session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_year VARCHAR(10) NOT NULL
);

-- Student Table
CREATE TABLE student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    course VARCHAR(50) NOT NULL,
    session_id INT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES session(id) ON DELETE CASCADE
);

-- Attendance Table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_code VARCHAR(50) NOT NULL,  -- Updated to match Flask app
    date DATE NOT NULL,
    status ENUM('P', 'A') NOT NULL,  -- Using ENUM for status
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
);

-- User Table (For authentication)
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Insert Sample Data
INSERT INTO session (session_year) VALUES ('2023-24'), ('2024-25');

INSERT INTO student (student_name, email, course, session_id) 
VALUES 
    ('John Doe', 'john@example.com', 'Computer Science', 1),
    ('Alice Smith', 'alice@example.com', 'AI & DL', 2);

INSERT INTO user (username, password) 
VALUES 
    ('admin', '$2b$12$WJ8Hs8...'); -- Store hashed passwords
