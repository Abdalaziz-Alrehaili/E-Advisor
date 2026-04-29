CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('student', 'admin', 'supervisor') DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE faculties (
    faculty_id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_name VARCHAR(100) NOT NULL
);

CREATE TABLE departments (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    dept_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculties(faculty_id)
);

CREATE TABLE programs (
    program_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_id INT NOT NULL,
    program_name VARCHAR(100) NOT NULL,
    total_credits_required INT DEFAULT 140,
    elective_credits_required INT DEFAULT 9,
    free_credits_required INT DEFAULT 9,
    duration_years INT DEFAULT 5,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE semester_rules (
    rule_id INT PRIMARY KEY AUTO_INCREMENT,
    semester_type ENUM('1', '2', 'Summer') UNIQUE,
    min_credits INT NOT NULL,
    max_credits INT NOT NULL
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_id INT NOT NULL,
    course_prefix VARCHAR(10) NOT NULL, 
    course_number VARCHAR(10) NOT NULL, 
    course_name VARCHAR(100) NOT NULL,  
    credits INT NOT NULL DEFAULT 3,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
    UNIQUE (course_prefix, course_number) 
);

CREATE TABLE prerequisites (
    course_id INT,
    prereq_id INT,
    PRIMARY KEY (course_id, prereq_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (prereq_id) REFERENCES courses(course_id)
);

CREATE TABLE semesters (
    semester_id INT PRIMARY KEY AUTO_INCREMENT,
    semester_name VARCHAR(50), 
    rule_id INT NOT NULL,
    is_registration_open BOOLEAN DEFAULT FALSE,
    registration_close_date DATE DEFAULT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (rule_id) REFERENCES semester_rules(rule_id)
);

CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    program_id INT NOT NULL,
    admission_year YEAR NOT NULL,
    supervisor_id INT NULL,
    is_graduated BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (program_id) REFERENCES programs(program_id),
    FOREIGN KEY (supervisor_id) REFERENCES users(user_id)
);

CREATE TABLE program_requirements (
    requirement_id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    course_id INT NULL,
    slot_name VARCHAR(50) NULL,
    ideal_year INT,
    ideal_semester ENUM('1', '2', 'Summer'),
    requirement_type ENUM('core', 'elective') DEFAULT 'core',
    FOREIGN KEY (program_id) REFERENCES programs(program_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

CREATE TABLE sections (
    section_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    semester_id INT NOT NULL,
    section_name VARCHAR(10),
    professor_name VARCHAR(100),
    days VARCHAR(20),
    start_time TIME,
    end_time TIME,
    room_number VARCHAR(50),
    max_capacity INT DEFAULT 30,
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
);

CREATE TABLE build_semester (
    build_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    semester_id INT NOT NULL,
    year_number INT NOT NULL,
    selected_courses_json JSON NOT NULL, 
    status ENUM('draft', 'submitted') DEFAULT 'draft',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
);

CREATE TABLE enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    section_id INT NULL,
    course_id INT NOT NULL,
    semester_id INT NOT NULL,
    year_number INT NOT NULL,
    status ENUM('undergoing', 'completed') DEFAULT 'undergoing',
    grade VARCHAR(2) DEFAULT NULL,
    placeholder_id INT NULL, 
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (section_id) REFERENCES sections(section_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
    FOREIGN KEY (placeholder_id) REFERENCES courses(course_id),
    UNIQUE (student_id, section_id)
);

CREATE TABLE messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);