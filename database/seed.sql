-- ==========================================
-- 1. Seed Faculties
-- ==========================================

INSERT INTO faculties (faculty_name) VALUES 
('Faculty of Computing and Information Technology'), -- ID 1
('Faculty of Science'),                              -- ID 2
('Faculty of Economics and Administration'),         -- ID 3
('Faculty of Communication and Media'),              -- ID 4
('English Language Institute'),                      -- ID 5
('Faculty of Arts and Humanities');                  -- ID 6


-- ==========================================
-- 2. Seed Departments
-- ==========================================

INSERT INTO departments (faculty_id, dept_name) VALUES 
(1, 'Department of Computer Science'),               -- ID 1
(1, 'Department of Information Technology'),         -- ID 2
(1, 'Department of Information Systems'),            -- ID 3
(2, 'Department of Mathematics'),                    -- ID 4
(2, 'Department of Statistics'),                     -- ID 5
(2, 'Department of Physics'),                        -- ID 6
(2, 'Department of Biology'),                        -- ID 7
(2, 'Department of Chemistry'),                      -- ID 8
(3, 'Department of Business Administration'),        -- ID 9
(3, 'Department of Marketing'),                      -- ID 10
(3, 'Department of Accounting'),                     -- ID 11
(4, 'Department of Marketing Communication'),        -- ID 12
(4, 'Department of Public Relation'),                -- ID 13
(5, 'Department of English Language'),               -- ID 14
(6, 'Department of Arabic Language and Literature'), -- ID 15
(6, 'Department of Shariah and Islamic Studies'),    -- ID 16
(6, 'Department of General Courses');                -- ID 17


-- ==========================================
-- 3. Seed Programs
-- ==========================================

INSERT INTO programs (dept_id, program_name, total_credits_required) VALUES 
(3, 'Bachelor of Science in Information Systems', 140);


-- ==========================================
-- 4. Seed Courses (IDs match the Departments above)
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

INSERT INTO semester_rules (semester_type, min_credits, max_credits) VALUES 
('1', 12, 18),      -- Fall/First Semester
('2', 12, 18),      -- Spring/Second Semester
('Summer', 2, 9);   -- Summer Semester


-- ==========================================
-- 7. Seed Semesters
-- ==========================================

INSERT INTO semesters (semester_name, rule_id, is_registration_open) VALUES 
-- Year 1 (Entry Year for Seniors)
('First Semester 2021-2022', 1, FALSE),
('Second Semester 2021-2022', 2, FALSE),
('Summer Semester 2022', 3, FALSE),

-- Year 2
('First Semester 2022-2023', 1, FALSE),
('Second Semester 2022-2023', 2, FALSE),
('Summer Semester 2023', 3, FALSE),

-- Year 3
('First Semester 2023-2024', 1, FALSE),
('Second Semester 2023-2024', 2, FALSE),
('Summer Semester 2024', 3, FALSE),

-- Year 4
('First Semester 2024-2025', 1, FALSE),
('Second Semester 2024-2025', 2, FALSE),
('Summer Semester 2025', 3, FALSE),

-- Year 5 (Current Academic Year)
('First Semester 2025-2026', 1, FALSE),
('Second Semester 2025-2026', 2, TRUE),   -- <--- CURRENT ACTIVE SEMESTER
('Summer Semester 2026', 3, FALSE),

-- Year 6 (Future Planning)
('First Semester 2026-2027', 1, FALSE),
('Second Semester 2026-2027', 2, FALSE),
('Summer Semester 2027', 3, FALSE);


-- ==========================================
-- 8. Seed Program Requirements (IS Study Plan)
-- ==========================================

-- YEAR 1: SEMESTER 1
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'BIO' AND course_number = '110'), 1, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CHEM' AND course_number = '110'), 1, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ELIS' AND course_number = '101'), 1, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ELIS' AND course_number = '102'), 1, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'STAT' AND course_number = '110'), 1, '1', 'core');

-- YEAR 1: SEMESTER 2
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'COMM' AND course_number = '101'), 1, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIT' AND course_number = '110'), 1, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ELIS' AND course_number = '103'), 1, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ELIS' AND course_number = '104'), 1, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'MATH' AND course_number = '110'), 1, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'PHYS' AND course_number = '110'), 1, '2', 'core');

-- YEAR 2: SEMESTER 1
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIT' AND course_number = '201'), 2, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'STAT' AND course_number = '210'), 2, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIT' AND course_number = '221'), 2, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '202'), 2, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '101'), 2, '1', 'core');

-- YEAR 2: SEMESTER 2
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '203'), 2, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '220'), 2, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ARAB' AND course_number = '101'), 2, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '201'), 2, '2', 'core');

-- YEAR 3: SEMESTER 1
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '204'), 3, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPCS' AND course_number = '222'), 3, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '210'), 3, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'BUS' AND course_number = '232'), 3, '1', 'core');

-- Adding Year 3 Sem 1 Free Slot
INSERT INTO program_requirements (program_id, slot_name, ideal_year, ideal_semester, requirement_type) 
VALUES (1, 'College Free 1', 3, '1', 'elective');

-- YEAR 3: SEMESTER 2
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '222'), 3, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '240'), 3, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '334'), 3, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'MRKT' AND course_number = '260'), 3, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '250'), 3, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '370'), 3, '2', 'core');

-- YEAR 4: SEMESTER 1
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '351'), 4, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '354'), 4, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '358'), 4, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ACCT' AND course_number = '333'), 4, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '357'), 4, '1', 'core');

-- YEAR 4: SEMESTER 2
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '312'), 4, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '352'), 4, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '380'), 4, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ARAB' AND course_number = '201'), 4, '2', 'core');

-- Adding Year 4 Sem 2 Department Elective
INSERT INTO program_requirements (program_id, slot_name, ideal_year, ideal_semester, requirement_type) 
VALUES (1, 'Department Elective 1', 4, '2', 'elective');

-- YEAR 4: SUMMER (Internship)
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) 
VALUES (1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '323'), 4, 'Summer', 'core');

-- YEAR 5: SEMESTER 1
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '301'), 5, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '498'), 5, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '428'), 5, '1', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '342'), 5, '1', 'core');

-- Adding Year 5 Sem 1 Elective and Free Slots
INSERT INTO program_requirements (program_id, slot_name, ideal_year, ideal_semester, requirement_type) VALUES 
(1, 'Department Elective 2', 5, '1', 'elective'),
(1, 'College Free 2', 5, '1', 'elective');

-- YEAR 5: SEMESTER 2
INSERT INTO program_requirements (program_id, course_id, ideal_year, ideal_semester, requirement_type) VALUES 
(1, (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '401'), 5, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '499'), 5, '2', 'core'),
(1, (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '434'), 5, '2', 'core');

-- Adding Year 5 Sem 2 Elective and Free Slots
INSERT INTO program_requirements (program_id, slot_name, ideal_year, ideal_semester, requirement_type) VALUES 
(1, 'College Free 3', 5, '2', 'elective'),
(1, 'Department Elective 3', 5, '2', 'elective');


-- ==========================================
-- 9. Seed Users (Login Credentials)
-- ==========================================

INSERT INTO users (username, password, first_name, last_name, role) VALUES 
('admin1', 'admin1', 'Matthew', 'Williams', 'admin'),
('user1',   'user1',  'Adam',    'Rodriguez', 'student'),
('user2',   'user2',  'Thiago',  'Garcia',    'student'),
('user3',   'user3',  'John',    'Smith',     'student');


-- ==========================================
-- 10. Seed Students (Linking to IS Program)
-- ==========================================

INSERT INTO students (user_id, program_id, admission_year) VALUES 
-- Adam: 5th Year (Started 2021)
((SELECT user_id FROM users WHERE username = 'user1'), 1, 2021),

-- Thiago: 4th Year (Started 2022)
((SELECT user_id FROM users WHERE username = 'user2'), 1, 2022),

-- John: 3rd Year (Started 2023)
((SELECT user_id FROM users WHERE username = 'user3'), 1, 2023);


-- ==========================================
-- 11. Seed Sections
-- ==========================================

-- First, create Section '1' for all courses across all semesters 2021-2026.
INSERT INTO sections (course_id, semester_id, section_name, max_capacity)
SELECT 
    c.course_id, 
    s.semester_id,
    CONCAT(
        CASE 
            WHEN c.course_prefix = 'CPIS' THEN 'IS'
            WHEN c.course_prefix = 'CPIT' THEN 'IT'
            WHEN c.course_prefix = 'CPCS' THEN 'CS'
            WHEN c.course_prefix = 'ISLS' THEN 'ISL' -- Handled
            ELSE LEFT(c.course_prefix, 2) 
        END, 
        '1'
    ),
    30
FROM courses c
CROSS JOIN (SELECT semester_id FROM semesters WHERE semester_id <= 14) s;

-- Second, add a "Section 2" for the current semester (14) to give students a choice.
INSERT INTO sections (course_id, semester_id, section_name, max_capacity)
SELECT 
    c.course_id, 
    14,
    CONCAT(
        CASE 
            WHEN c.course_prefix = 'CPIS' THEN 'IS'
            WHEN c.course_prefix = 'CPIT' THEN 'IT'
            WHEN c.course_prefix = 'CPCS' THEN 'CS'
            WHEN c.course_prefix = 'ISLS' THEN 'ISL' -- Added here too!
            ELSE LEFT(c.course_prefix, 2)
        END, 
        '2'
    ),
    30
FROM courses c;


-- ==========================================
-- 12. Seed Enrollments (Realistic Student History)
-- ==========================================

-- ---------------------------------------------------------
-- ADAM (Student 1): 5th Year, Ahead of Pace
-- ---------------------------------------------------------

-- 1. Years 1-3 Core: Completed (Historical)
INSERT INTO enrollments (student_id, section_id, course_id, year_number, status, grade)
SELECT 1, MIN(s.section_id), c.course_id, pr.ideal_year, 'completed', 
       ELT(FLOOR(1 + (RAND() * 8)), 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D')
FROM program_requirements pr
JOIN courses c ON pr.course_id = c.course_id
JOIN sections s ON s.course_id = c.course_id
WHERE pr.program_id = 1 
  AND pr.ideal_year <= 3 
  AND s.semester_id <= 9
  AND pr.requirement_type = 'core'
GROUP BY c.course_id, pr.ideal_year;

-- 2. Year 4 Core: Completed (Excluding Training, which we do manually below)
INSERT INTO enrollments (student_id, section_id, course_id, year_number, status, grade)
SELECT 1, MIN(s.section_id), c.course_id, 4, 'completed', 
       ELT(FLOOR(1 + (RAND() * 8)), 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D')
FROM program_requirements pr
JOIN courses c ON pr.course_id = c.course_id
JOIN sections s ON s.course_id = c.course_id
WHERE pr.program_id = 1 AND pr.ideal_year = 4 
  AND s.semester_id BETWEEN 10 AND 12
  AND pr.requirement_type = 'core'
  AND c.course_number != '323' -- Skip Summer Training here to avoid duplicate
GROUP BY c.course_id;

-- 3. Adam's Manual Adjustments (Ahead of Pace)
INSERT INTO enrollments (student_id, section_id, course_id, year_number, status, grade) VALUES 
-- Summer Training (Finished Summer between Yr 4 and 5)
(1, (SELECT section_id FROM sections WHERE course_id = (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '323') AND semester_id = 12), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '323'), 4, 'completed', ELT(FLOOR(1 + (RAND() * 8)), 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D')),
-- ISLS-401 (Year 5 course taken early in Year 4)
(1, (SELECT section_id FROM sections WHERE course_id = (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '401') AND semester_id = 11), (SELECT course_id FROM courses WHERE course_prefix = 'ISLS' AND course_number = '401'), 4, 'completed', ELT(FLOOR(1 + (RAND() * 8)), 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D')),
-- Adam completed an elective early in Year 4
(1, (SELECT section_id FROM sections WHERE course_id = (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '363') AND semester_id = 11), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '363'), 4, 'completed', ELT(FLOOR(1 + (RAND() * 8)), 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D'));

-- 4. Adam's CURRENT Semester (Year 5, Semester 1 - ID 13)
INSERT INTO enrollments (student_id, section_id, course_id, year_number, status) VALUES 
(1, (SELECT section_id FROM sections WHERE course_id = (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '498') AND semester_id = 13), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '498'), 5, 'undergoing');

-- ---------------------------------------------------------
-- THIAGO (Student 2): 4th Year, Behind Pace
-- ---------------------------------------------------------

-- 1. Completed Year 1 & 2 Perfectly
INSERT INTO enrollments (student_id, section_id, course_id, year_number, status, grade)
SELECT 2, MIN(s.section_id), c.course_id, pr.ideal_year, 'completed', 
       ELT(FLOOR(1 + (RAND() * 8)), 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D')
FROM program_requirements pr
JOIN courses c ON pr.course_id = c.course_id
JOIN sections s ON s.course_id = c.course_id
WHERE pr.program_id = 1 AND pr.ideal_year <= 2 AND s.semester_id <= 6
GROUP BY c.course_id, pr.ideal_year;

-- 2. Year 3: He missed CPIS-250, CPIS-222, and BUS-232 (His "Behind Pace" gap)
INSERT INTO enrollments (student_id, section_id, course_id, year_number, status, grade)
SELECT 2, MIN(s.section_id), c.course_id, 3, 'completed', 
       ELT(FLOOR(1 + (RAND() * 8)), 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D')
FROM program_requirements pr
JOIN courses c ON pr.course_id = c.course_id
JOIN sections s ON s.course_id = c.course_id
WHERE pr.program_id = 1 AND pr.ideal_year = 3 
  AND c.course_number NOT IN ('250', '222', '232')
  AND s.semester_id BETWEEN 7 AND 9
GROUP BY c.course_id;

-- 3. Thiago's CURRENT Semester (Year 4, Semester 1 - ID 13)
INSERT INTO enrollments (student_id, section_id, course_id, year_number, status) VALUES 
(2, (SELECT section_id FROM sections WHERE course_id = (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '351') AND semester_id = 13), (SELECT course_id FROM courses WHERE course_prefix = 'CPIS' AND course_number = '351'), 4, 'undergoing');

-- ---------------------------------------------------------
-- JOHN (Student 3): 3rd Year, Perfect Pace
-- ---------------------------------------------------------

-- 1. Completed Year 1 & 2 perfectly
INSERT INTO enrollments (student_id, section_id, course_id, year_number, status, grade)
SELECT 3, MIN(s.section_id), c.course_id, pr.ideal_year, 'completed', 
       ELT(FLOOR(1 + (RAND() * 8)), 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D')
FROM program_requirements pr
JOIN courses c ON pr.course_id = c.course_id
JOIN sections s ON s.course_id = c.course_id
WHERE pr.program_id = 1 AND pr.ideal_year <= 2 AND s.semester_id <= 6
GROUP BY c.course_id, pr.ideal_year;

-- 2. John's CURRENT Semester (Year 3, Semester 1 - ID 13)
INSERT INTO enrollments (student_id, section_id, course_id, year_number, status)
SELECT 3, MIN(s.section_id), c.course_id, 3, 'undergoing'
FROM program_requirements pr
JOIN courses c ON pr.course_id = c.course_id
JOIN sections s ON s.course_id = c.course_id
WHERE pr.program_id = 1 AND pr.ideal_year = 3 AND pr.ideal_semester = '1' AND s.semester_id = 13
GROUP BY c.course_id;