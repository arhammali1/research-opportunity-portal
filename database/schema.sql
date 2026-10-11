-- University Research Opportunity Portal
-- Database schema (MySQL)

CREATE DATABASE IF NOT EXISTS research_portal;
USE research_portal;

CREATE TABLE IF NOT EXISTS opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    research_area VARCHAR(150) NOT NULL,
    faculty_name VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL,
    required_skills VARCHAR(500) NOT NULL,
    available_positions INT NOT NULL,
    application_deadline DATE NOT NULL,
    status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample seed data (optional, for quick manual testing)
INSERT INTO opportunities
    (title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status)
VALUES
    ('Machine Learning for Crop Yield Prediction',
     'Research assistant needed to build ML models that predict crop yields using satellite imagery and weather data.',
     'Machine Learning',
     'Dr. Ayesha Khan',
     'Computer Science',
     'Python, scikit-learn, data preprocessing',
     2,
     '2026-12-15',
     'Open'),
    ('Network Security Vulnerability Analysis',
     'Study common vulnerabilities in IoT network protocols and propose mitigation strategies.',
     'Network Security',
     'Dr. Bilal Ahmed',
     'Computer Science',
     'Networking fundamentals, Wireshark, Linux',
     3,
     '2026-11-30',
     'Open');
