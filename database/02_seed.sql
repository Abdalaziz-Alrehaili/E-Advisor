SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE messages;
TRUNCATE TABLE enrollments;
TRUNCATE TABLE build_semester;
TRUNCATE TABLE sections;
TRUNCATE TABLE program_requirements;
TRUNCATE TABLE students;
TRUNCATE TABLE semesters;
TRUNCATE TABLE prerequisites;
TRUNCATE TABLE courses;
TRUNCATE TABLE semester_rules;
TRUNCATE TABLE programs;
TRUNCATE TABLE departments;
TRUNCATE TABLE faculties;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. Seed Faculties
-- ==========================================
INSERT INTO faculties (faculty_name) VALUES 
('Faculty of Computing and Information Technology'),
('Faculty of Science'),                              
('Faculty of Economics and Administration'),         
('Faculty of Communication and Media'),              
('English Language Institute'),                      
('Faculty of Arts and Humanities');                  

-- ==========================================
-- 2. Seed Departments
-- ==========================================
INSERT INTO departments (faculty_id, dept_name) VALUES 
(1, 'Department of Computer Science'),               
(1, 'Department of Information Technology'),         
(1, 'Department of Information Systems'),            
(2, 'Department of Mathematics'),                    
(2, 'Department of Statistics'),                     
(2, 'Department of Physics'),                        
(2, 'Department of Biology'),                        
(2, 'Department of Chemistry'),                      
(3, 'Department of Business Administration'),        
(3, 'Department of Marketing'),                      
(3, 'Department of Accounting'),                     
(4, 'Department of Marketing Communication'),        
(4, 'Department of Public Relation'),                
(5, 'Department of English Language'),               
(6, 'Department of Arabic Language and Literature'), 
(6, 'Department of Shariah and Islamic Studies'),    
(6, 'Department of General Courses');                

-- ==========================================
-- 3. Seed Programs
-- ==========================================
INSERT INTO programs (dept_id, program_name, total_credits_required, duration_years) VALUES 
(3, 'Bachelor of Science in Information Systems', 140, 5);

-- ==========================================
-- 4. Seed Courses
-- ==========================================
-- English (Dept 14)
INSERT INTO courses (dept_id, course_prefix, course_number, course_name, credits) VALUES 
(14, 'ELIS', '101', 'ENGLISH LANGUAGE-SCIENCE(1)', 0),
(14, 'ELIS', '102', 'ENGLISH LANGUAGE-SCIENCE(2)', 2),
(14, 'ELIS', '103', 'ENGLISH LANGUAGE-SCIENCE(3)', 2),
(14, 'ELIS', '104', 'ENGLISH LANGUAGE-SCIENCE(4)', 2);

-- Islamic Studies (Dept 16)
INSERT INTO courses (dept_id, course_prefix, course_number, course_name, credits) VALUES 
(16, 'ISLS', '101', 'ISLAMIC CULTURE (1)', 3),
(16, 'ISLS', '201', 'ISLAMIC CULTURE (2)', 2),
(16, 'ISLS', '301', 'ISLAMIC CULTURE (3)', 2),
(16, 'ISLS', '401', 'ISLAMIC CULTURE (4)', 2);

-- Arabic (Dept 15)
INSERT INTO courses (dept_id, course_prefix, course_number, course_name, credits) VALUES 
(15, 'ARAB', '101', 'ARABIC LANGUAGE (1)', 3),
(15, 'ARAB', '201', 'ARABIC LANGUAGE (2)', 3);

-- Science (Depts 4-8)
INSERT INTO courses (dept_id, course_prefix, course_number, course_name, credits) VALUES 
(4, 'MATH', '110', 'GENERAL MATHEMATICS (1)', 3),
(5, 'STAT', '110', 'GENERAL STATISTICS (1)', 3),
(5, 'STAT', '210', 'PROBABILITY THEORY', 3),
(6, 'PHYS', '110', 'GENERAL PHYSICS (1)', 3),
(7, 'BIO',  '110', 'GENERAL BIOLOGY (1)', 3),
(8, 'CHEM', '110', 'GENERAL CHEMISTRY (1)', 3);

-- Business & Marketing (Depts 9-11)
INSERT INTO courses (dept_id, course_prefix, course_number, course_name, credits) VALUES 
(9,  'BUS',  '232', 'Management of Organizations', 3),
(9,  'BUS',  '433', 'Entrepreneurship', 3),
(10, 'MRKT', '260', 'PRINCIPLES OF MARKETING', 3),
(11, 'ACCT', '333', 'PRINCIPLES OF CORPORATE ACCOUNTING', 2);

-- Comm & PR (Depts 12-13)
INSERT INTO courses (dept_id, course_prefix, course_number, course_name, credits) VALUES 
(12, 'MRKC', '323', 'Persuasion', 3),
(13, 'PR',   '211', 'Public Opinion', 3);

-- General (Dept 17)
INSERT INTO courses (dept_id, course_prefix, course_number, course_name, credits) VALUES 
(17, 'COMM', '101', 'COMMUNICATION SKILLS', 3);

-- CS & IT (Depts 1-2)
INSERT INTO courses (dept_id, course_prefix, course_number, course_name, credits) VALUES 
(1, 'CPCS', '202', 'PROGRAMMING I', 3),
(1, 'CPCS', '203', 'PROGRAMMING II', 3),
(1, 'CPCS', '222', 'DISCRETE STRUCTURES I', 3),
(1, 'CPCS', '204', 'DATA STRUCTURES (1)', 3),
(2, 'CPIT', '110', 'PROBLEM SOLVING & PROGRAMMING', 3),
(2, 'CPIT', '201', 'INTRODUCTION TO COMPUTING', 3),
(2, 'CPIT', '221', 'TECHNICAL WRITING', 3);

-- Information Systems (Dept 3)
INSERT INTO courses (dept_id, course_prefix, course_number, course_name, credits) VALUES 
(3, 'CPIS', '210', 'COMPUTER ARCHITECTURE & ORGANISATION', 3),
(3, 'CPIS', '220', 'PR OF INFORMATION SYSTEMS', 3),
(3, 'CPIS', '222', 'PRINCIPLES OF OPERATING SYSTEMS', 3),
(3, 'CPIS', '240', 'DATABASE MANAGEMENT SYSTEMS', 3),
(3, 'CPIS', '250', 'SOFTWARE ENGINEERING', 3),
(3, 'CPIS', '312', 'INFORMATION & COMPUTER SECURITY', 3),
(3, 'CPIS', '320', 'DECISION SUPPORT SYSTEMS & THEORY', 3),
(3, 'CPIS', '323', 'SUMMER(WORKPLACE)TRAINING', 0),
(3, 'CPIS', '334', 'INTRODUCTION TO SOFTWARE PROJECT MANAGEMENT', 2),
(3, 'CPIS', '342', 'DATA WAREHOUSING & MINING', 3),
(3, 'CPIS', '350', 'SYSTEMS DESIGN PATTERNS', 3),
(3, 'CPIS', '351', 'IS ANALYSIS & ARCHITECTURE DESIGN', 3),
(3, 'CPIS', '352', 'IS APPLICATIONS DESIGN & DEVELOPMENT', 3),
(3, 'CPIS', '354', 'PRINCIPLES OF HUMAN COMPUTER INTERACTION', 3),
(3, 'CPIS', '357', 'SOFTWARE QUALITY AND TESTING', 3),
(3, 'CPIS', '358', 'INTERNET APPLICATIONS & WEB PROGRAMMING', 3),
(3, 'CPIS', '363', 'INTELLIGENT SYSTEMS', 3),
(3, 'CPIS', '370', 'FUNDAMENTALS OF DATA NETWORKS', 3),
(3, 'CPIS', '380', 'INTRODUCTION TO E-BUSINESS SYSTEMS', 3),
(3, 'CPIS', '420', 'TECHNIQUES OF DECISION SUPPORT', 3),
(3, 'CPIS', '428', 'PROFESSIONAL COMPUTING ISSUES', 2),
(3, 'CPIS', '434', 'IS STRATEGIES & POLICIES', 3),
(3, 'CPIS', '486', 'E-BUSINESS STRATEGIES', 3),
(3, 'CPIS', '498', 'SENIOR PROJECT (1)', 1),
(3, 'CPIS', '499', 'SENIOR PROJECT (2)', 3);

-- NEW: PLACEHOLDERS (Electives & Free Courses)
INSERT INTO courses (dept_id, course_prefix, course_number, course_name, credits) VALUES 
(3, 'ELEC', '1', 'Department Elective I', 3),
(3, 'ELEC', '2', 'Department Elective II', 3),
(3, 'ELEC', '3', 'Department Elective III', 3),
(17, 'FREE', '1', 'Free Course I', 3),
(17, 'FREE', '2', 'Free Course II', 3),
(17, 'FREE', '3', 'Free Course III', 3);

-- ==========================================
-- 5. Seed Prerequisites
-- ==========================================
INSERT INTO prerequisites (course_id, prereq_id) VALUES 
((SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '201'), (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '101')),
((SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '301'), (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '201')),
((SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '401'), (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '301')),
((SELECT course_id FROM courses WHERE course_prefix = 'ARAB' AND course_number = '201'), (SELECT course_id FROM courses WHERE course_prefix = 'ARAB' AND course_number = '101')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '203'), (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '202')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '363'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '240')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '350'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '250')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '320'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '240')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '420'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '320')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '486'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '380')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '220'), (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '202')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '210'), (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '202')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '204'), (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '203')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '222'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '210')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '222'), (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '204')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '370'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '210')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '370'), (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '204')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '240'), (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '204')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '250'), (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '204')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '354'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '250')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '358'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '250')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '312'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '370')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '342'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '240')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '351'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '250')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '351'), (SELECT course_id FROM courses WHERE course_prefix = 'BUS' AND course_number = '232')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '352'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '351')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '380'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '351')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '380'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '358')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '357'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '250')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '357'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '334')),
((SELECT course_id FROM courses WHERE course_prefix = 'MRKT' AND course_number = '260'), (SELECT course_id FROM courses WHERE course_prefix = 'BUS' AND course_number = '232')),
((SELECT course_id FROM courses WHERE course_prefix = 'ACCT' AND course_number = '333'), (SELECT course_id FROM courses WHERE course_prefix = 'BUS' AND course_number = '232')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '434'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '220')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '428'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '323')),
((SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '499'), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '498'));

-- ==========================================
-- 6. Seed Semester Rules
-- ==========================================
INSERT INTO semester_rules (semester_type, max_credits, min_credits) VALUES
('1', 20, 10),       
('2', 20, 10),       
('Summer', 9, 0);    

-- ==========================================
-- 7. Seed Semesters
-- ==========================================
INSERT INTO semesters (semester_name, rule_id, is_registration_open, registration_close_date, is_completed) VALUES 
('First Semester 2021-2022', 1, FALSE, '2021-09-09', TRUE),
('Second Semester 2021-2022', 2, FALSE, '2022-01-20', TRUE),
('Summer Semester 2022', 3, FALSE, '2022-06-15', TRUE),
('First Semester 2022-2023', 1, FALSE, '2022-09-08', TRUE),
('Second Semester 2022-2023', 2, FALSE, '2023-01-19', TRUE),
('Summer Semester 2023', 3, FALSE, '2023-06-14', TRUE),
('First Semester 2023-2024', 1, FALSE, '2023-09-07', TRUE),
('Second Semester 2023-2024', 2, FALSE, '2024-01-18', TRUE),
('Summer Semester 2024', 3, FALSE, '2024-06-13', TRUE),
('First Semester 2024-2025', 1, FALSE, '2024-09-05', TRUE),
('Second Semester 2024-2025', 2, FALSE, '2025-01-16', TRUE),
('Summer Semester 2025', 3, FALSE, '2025-06-12', TRUE),
('First Semester 2025-2026', 1, FALSE, '2025-09-04', TRUE),
('Second Semester 2025-2026', 2, FALSE, '2026-01-15', TRUE),
('Summer Semester 2026', 3, FALSE, '2026-06-10', TRUE),
('First Semester 2026-2027', 1, FALSE, NULL, FALSE), 
('Second Semester 2026-2027', 2, FALSE, NULL, FALSE),
('Summer Semester 2027', 3, FALSE, NULL, FALSE);

-- ==========================================
-- 8. Seed Program Requirements
-- ==========================================
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'BIO' AND course_number = '110'), 1, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CHEM' AND course_number = '110'), 1, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ELIS' AND course_number = '101'), 1, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ELIS' AND course_number = '102'), 1, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'STAT' AND course_number = '110'), 1, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'COMM' AND course_number = '101'), 1, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIT' AND course_number = '110'), 1, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ELIS' AND course_number = '103'), 1, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ELIS' AND course_number = '104'), 1, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'MATH' AND course_number = '110'), 1, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'PHYS' AND course_number = '110'), 1, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIT' AND course_number = '201'), 2, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'STAT' AND course_number = '210'), 2, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIT' AND course_number = '221'), 2, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '202'), 2, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '101'), 2, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '203'), 2, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '220'), 2, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ARAB' AND course_number = '101'), 2, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '201'), 2, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '204'), 3, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '222'), 3, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '210'), 3, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'BUS' AND course_number = '232'), 3, '1', 'core');

INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) 
VALUES (1, (SELECT course_id FROM courses WHERE course_prefix = 'FREE' AND course_number = '1'), 3, '1', 'elective');

INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '222'), 3, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '240'), 3, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '334'), 3, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'MRKT' AND course_number = '260'), 3, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '250'), 3, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '370'), 3, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '351'), 4, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '354'), 4, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '358'), 4, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ACCT' AND course_number = '333'), 4, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '357'), 4, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '312'), 4, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '352'), 4, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '380'), 4, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ARAB' AND course_number = '201'), 4, '2', 'core');

INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) 
VALUES (1, (SELECT course_id FROM courses WHERE course_prefix = 'ELEC' AND course_number = '1'), 4, '2', 'elective');

INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) 
VALUES (1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '323'), 4, 'Summer', 'core');

INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '301'), 5, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '498'), 5, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '428'), 5, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '342'), 5, '1', 'core');

INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) 
VALUES (1, (SELECT course_id FROM courses WHERE course_prefix = 'ELEC' AND course_number = '2'), 5, '1', 'elective');
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) 
VALUES (1, (SELECT course_id FROM courses WHERE course_prefix = 'FREE' AND course_number = '2'), 5, '1', 'elective');

INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '401'), 5, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '499'), 5, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '434'), 5, '2', 'core');

INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) 
VALUES (1, (SELECT course_id FROM courses WHERE course_prefix = 'FREE' AND course_number = '3'), 5, '2', 'elective');
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) 
VALUES (1, (SELECT course_id FROM courses WHERE course_prefix = 'ELEC' AND course_number = '3'), 5, '2', 'elective');

-- ==========================================
-- 9. Seed Sections (Kept for schedule building)
-- ==========================================
INSERT INTO sections (course_id, semester_id, section_name, professor_name, days, start_time, end_time, room_number, max_capacity)
SELECT 
    c.course_id, s.semester_id, 'S1',
    ELT(FLOOR(1 + (RAND() * 5)), 'Dr. Ahmad Mansour', 'Dr. Khaled Al-Sayed', 'Prof. Mustafa Osman', 'Dr. Ibrahim Hassan', 'Dr. Omar Bakri'),
    IF(RAND() > 0.5, 'Sun-Tue-Thu', 'Mon-Wed'),
    '08:00:00', '09:20:00',
    CONCAT('Bldg ', FLOOR(1 + (RAND() * 3)), '-R', FLOOR(100 + (RAND() * 50))),
    30
FROM courses c CROSS JOIN (SELECT semester_id FROM semesters) s;

INSERT INTO sections (course_id, semester_id, section_name, professor_name, days, start_time, end_time, room_number, max_capacity)
SELECT 
    c.course_id, s.semester_id, 'S2',
    ELT(FLOOR(1 + (RAND() * 5)), 'Dr. Sami Al-Qahtani', 'Dr. Yahya Jameel', 'Prof. Nasser Idris', 'Dr. Suleiman Taha', 'Dr. Waleed Saeed'),
    IF(RAND() > 0.5, 'Sun-Tue-Thu', 'Mon-Wed'),
    '13:00:00', '14:20:00',
    CONCAT('Bldg ', FLOOR(1 + (RAND() * 3)), '-R', FLOOR(100 + (RAND() * 50))),
    30
FROM courses c CROSS JOIN (SELECT semester_id FROM semesters) s;