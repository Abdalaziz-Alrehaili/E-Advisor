import random

# ==========================================
# 1. Configuration & Data Setup
# ==========================================
NUM_HISTORICAL_STUDENTS = 150
FILE_NAME = "seed.sql"

FIRST_NAMES = ["Mohammed", "Youssef", "Ahmed", "Mahmoud", "Mustafa", "Yaseen", "Taha", "Khalid", "Hamza", "Bilal", "Ibrahim", "Hassan", "Hussein", "Kareem", "Tariq", "Abdulrahman", "Ali", "Omar", "Murad", "Salem", "Abdullah", "Abdulaziz", "Saud", "Salman"]
LAST_NAMES = ["Alharbi", "Alghamdi", "Alzahrani", "AlAmri", "AlJohani", "AlOtaibi", "AlQahtani", "AlDosari", "AlMaghrabi", "Alturkistani", "Bukhari", "Kurdi", "AlMasri", "Hijazi", "Jowharji", "Kazzaz", "Kutbi", "Attar", "Hakeem", "AlMalki", "AlHarthi", "Khalil", "AlDossari", "AlShamrani"]

# Active Student Roster
ACTIVE_NAMES = [
    ("Mustafa", "Jowharji"),   # S1: Sup 1 (Ahead)
    ("Mohammed", "Alharbi"),   # S2: Sup 2 (On Track)
    ("Tariq", "Bukhari"),      # S3: Sup 2 (Ahead)
    ("Youssef", "Alghamdi"),   # S4: Sup 1 (Behind)
    ("Hassan", "Kurdi"),       # S5: Sup 1 (On Track)
    ("Ali", "AlDossari")       # S6: Sup 2 (Behind)
]

# Professor Personalities (Base Modifiers for ML)
PROFESSORS = [
    {"name": "Dr. Ahmed Al-Faisal",  "base_mod": 1,  "var": 3, "is_sup": True},  # Prof_ID 1
    {"name": "Dr. Khalid Omar",      "base_mod": -1, "var": 4, "is_sup": True},  # Prof_ID 2
    {"name": "Dr. Mohammed Alharbi", "base_mod": -4, "var": 4, "is_sup": False},
    {"name": "Dr. Youssef Alghamdi", "base_mod": 4,  "var": 3, "is_sup": False},
    {"name": "Dr. Ahmed Alzahrani",  "base_mod": 0,  "var": 4, "is_sup": False},
    {"name": "Dr. Mahmoud AlAmri",   "base_mod": -1, "var": 8, "is_sup": False},
    {"name": "Dr. Mustafa AlJohani", "base_mod": -3, "var": 3, "is_sup": False},
    {"name": "Dr. Yaseen AlOtaibi",  "base_mod": 3,  "var": 4, "is_sup": False},
    {"name": "Dr. Taha AlQahtani",   "base_mod": 0,  "var": 3, "is_sup": False},
    {"name": "Dr. Khalid AlDosari",  "base_mod": -5, "var": 2, "is_sup": False},
    {"name": "Dr. Hamza AlMaghrabi", "base_mod": 5,  "var": 3, "is_sup": False},
    {"name": "Dr. Bilal Alturki",    "base_mod": 0,  "var": 5, "is_sup": False},
    {"name": "Dr. Ibrahim Kurdi",    "base_mod": -2, "var": 4, "is_sup": False},
    {"name": "Dr. Hassan AlMasri",   "base_mod": 2,  "var": 4, "is_sup": False},
    {"name": "Dr. Hussein Hijazi",   "base_mod": 0,  "var": 3, "is_sup": False},
]

# Course Definitions for the Generator Engine
COURSES = {
    1: {'avg': 93, 'var': 'norm', 'skew': None, 'prog': False}, 2: {'avg': 87, 'var': 'high', 'skew': None, 'prog': False},
    3: {'avg': 86, 'var': 'high', 'skew': None, 'prog': False}, 4: {'avg': 85, 'var': 'high', 'skew': None, 'prog': False},
    5: {'avg': 86, 'var': 'norm', 'skew': None, 'prog': False}, 6: {'avg': 94, 'var': 'norm', 'skew': 'neg', 'prog': False},
    7: {'avg': 93, 'var': 'norm', 'skew': 'neg', 'prog': False}, 8: {'avg': 95, 'var': 'norm', 'skew': 'neg', 'prog': False},
    9: {'avg': 83, 'var': 'norm', 'skew': None, 'prog': False}, 10: {'avg': 91, 'var': 'norm', 'skew': 'neg', 'prog': False},
    11: {'avg': 77, 'var': 'norm', 'skew': None, 'prog': False}, 12: {'avg': 79, 'var': 'norm', 'skew': None, 'prog': False},
    13: {'avg': 71, 'var': 'norm', 'skew': 'pos', 'prog': False}, 14: {'avg': 80, 'var': 'norm', 'skew': None, 'prog': False},
    15: {'avg': 88, 'var': 'high', 'skew': None, 'prog': False}, 16: {'avg': 79, 'var': 'norm', 'skew': None, 'prog': False},
    17: {'avg': 88, 'var': 'norm', 'skew': None, 'prog': False}, 18: {'avg': 87, 'var': 'norm', 'skew': None, 'prog': False},
    19: {'avg': 89, 'var': 'norm', 'skew': None, 'prog': False}, 20: {'avg': 84, 'var': 'norm', 'skew': None, 'prog': False},
    21: {'avg': 90, 'var': 'norm', 'skew': None, 'prog': False}, 22: {'avg': 91, 'var': 'norm', 'skew': None, 'prog': False},
    23: {'avg': 93, 'var': 'norm', 'skew': None, 'prog': False}, 24: {'avg': 82, 'var': 'high', 'skew': None, 'prog': True},
    25: {'avg': 78, 'var': 'high', 'skew': None, 'prog': True}, 26: {'avg': 80, 'var': 'high', 'skew': None, 'prog': False},
    27: {'avg': 76, 'var': 'high', 'skew': None, 'prog': True}, 28: {'avg': 79, 'var': 'high', 'skew': None, 'prog': True},
    29: {'avg': 85, 'var': 'norm', 'skew': None, 'prog': False}, 30: {'avg': 90, 'var': 'norm', 'skew': None, 'prog': False},
    31: {'avg': 80, 'var': 'high', 'skew': None, 'prog': False}, 32: {'avg': 90, 'var': 'low',  'skew': None, 'prog': False},
    33: {'avg': 73, 'var': 'norm', 'skew': 'pos', 'prog': False}, 34: {'avg': 86, 'var': 'norm', 'skew': None, 'prog': False},
    35: {'avg': 88, 'var': 'norm', 'skew': None, 'prog': False}, 36: {'avg': 79, 'var': 'high', 'skew': None, 'prog': False},
    37: {'avg': 89, 'var': 'norm', 'skew': None, 'prog': False}, 38: {'avg': 96, 'var': 'norm', 'skew': None, 'prog': False},
    39: {'avg': 89, 'var': 'norm', 'skew': None, 'prog': False}, 40: {'avg': 79, 'var': 'norm', 'skew': None, 'prog': False},
    41: {'avg': 87, 'var': 'norm', 'skew': None, 'prog': False}, 42: {'avg': 89, 'var': 'norm', 'skew': None, 'prog': False},
    43: {'avg': 86, 'var': 'norm', 'skew': None, 'prog': False}, 44: {'avg': 91, 'var': 'norm', 'skew': None, 'prog': False},
    45: {'avg': 88, 'var': 'norm', 'skew': None, 'prog': False}, 46: {'avg': 84, 'var': 'norm', 'skew': None, 'prog': True},
    47: {'avg': 87, 'var': 'norm', 'skew': None, 'prog': False}, 48: {'avg': 79, 'var': 'high', 'skew': None, 'prog': False},
    49: {'avg': 91, 'var': 'norm', 'skew': None, 'prog': False}, 50: {'avg': 86, 'var': 'norm', 'skew': None, 'prog': False},
    51: {'avg': 88, 'var': 'norm', 'skew': None, 'prog': False}, 52: {'avg': 86, 'var': 'norm', 'skew': None, 'prog': False},
    53: {'avg': 88, 'var': 'norm', 'skew': None, 'prog': False}, 54: {'avg': 92, 'var': 'norm', 'skew': None, 'prog': False},
    55: {'avg': 88, 'var': 'norm', 'skew': None, 'prog': False}
}

CREDITS = {
    1:0, 2:2, 3:2, 4:2, 5:3, 6:2, 7:2, 8:2, 9:3, 10:3, 11:3, 12:3, 13:3, 14:3, 15:3, 16:3, 17:3, 18:3, 19:3, 20:2, 21:3, 22:3, 23:3,
    24:3, 25:3, 26:3, 27:3, 28:3, 29:3, 30:3, 31:3, 32:3, 33:3, 34:3, 35:3, 36:3, 37:3, 38:0, 39:2, 40:3, 41:3, 42:3, 43:3, 44:3,
    45:3, 46:3, 47:3, 48:3, 49:3, 50:3, 51:2, 52:3, 53:3, 54:1, 55:3
}

PREREQS = {
    6: [5], 7: [6], 8: [7], 10: [9], 25: [24], 47: [34], 41: [35], 37: [34], 50: [37], 53: [49],
    32: [24], 31: [24], 27: [25], 33: [31, 27], 48: [31, 27], 34: [27], 35: [27], 44: [35], 46: [35],
    36: [48], 40: [34], 42: [35, 17], 43: [42], 49: [42, 46], 45: [35, 39], 19: [17], 20: [17],
    52: [32], 51: [38], 55: [54]
}

# --- COURSE VAULTS ---
Y1_SEM1_COURSES = [1, 2, 11, 14, 15, 23] 
Y1_SEM2_COURSES = [3, 4, 12, 16, 28]     
ALL_UPPER = [
    29, 13, 30, 24, 5, 25, 32, 9, 6, 21,                    
    27, 26, 31, 17, 33, 34, 39, 19, 35, 48, 22, 18,         
    42, 44, 46, 20, 45, 36, 43, 49, 10, 38, 37, 41, 47,     
    7, 54, 51, 40, 8, 55, 52, 50, 53                        
]
FREE_POOL = [18, 21, 22]               
ELECTIVES_POOL = [37, 41, 47, 50, 53]  
CORE_MAJOR_COURSES = [c for c in ALL_UPPER if c not in FREE_POOL and c not in ELECTIVES_POOL]
PERFECT_PLAN = Y1_SEM1_COURSES + Y1_SEM2_COURSES + ALL_UPPER

# ==========================================
# 2. Physics & Logic Engines
# ==========================================
def get_prof_course_offset(prof_id, course_id):
    random.seed(hash(str(prof_id) + str(course_id)))
    offset = random.randint(-6, 6)
    random.seed()
    return offset

# ADDED 'credit_load' param to penalize heavy semesters!
def get_realistic_grade(course_id, general_apt, prog_apt, prof_id, is_summer=False, credit_load=15):
    c = COURSES.get(course_id, {'avg': 85, 'var': 'norm', 'skew': None, 'prog': False})
    prof_data = PROFESSORS[prof_id - 1] 
    
    # 1. Aptitude Anchor: Strongly tie their grade to their general aptitude (GPA anchor)
    modifier = general_apt * 2.5 
    if c['prog']: modifier += prog_apt
    modifier += prof_data['base_mod']
    modifier += get_prof_course_offset(prof_id, course_id)
    
    if is_summer: 
        modifier += 3 
    
    # 2. Credit Load Penalty: 18+ credits severely drops grades. 12 credits boosts them!
    if credit_load > 16:
        modifier -= (credit_load - 16) * 1.5 
    elif credit_load < 13 and not is_summer:
        modifier += (13 - credit_load) * 1.0 
    
    sigma = 12 if c['var'] == 'high' else (3 if c['var'] == 'low' else 6)
    sigma += (prof_data['var'] / 2) 
    
    score = random.gauss(c['avg'] + modifier, sigma)
    if c['skew'] == 'neg': score = max(score, random.gauss(94, 3))
    if c['skew'] == 'pos': score = min(score, random.gauss(70, 5))
    return int(max(0, min(100, round(score))))

def force_gpa_grade(target_gpa):
    if target_gpa >= 4.8: mean, sigma = 96, 3    
    elif target_gpa >= 4.4: mean, sigma = 88, 4  
    elif target_gpa >= 4.0: mean, sigma = 84, 5  
    elif target_gpa >= 3.6: mean, sigma = 78, 6  
    else: mean, sigma = 73, 7                    
    grade = int(random.gauss(mean, sigma))
    return max(60, min(100, grade))

def is_credit_unlocked(cid, completed_set):
    if cid not in [38, 54]: return True
    completed_creds = sum(CREDITS.get(c, 3) for c in completed_set)
    if cid == 38 and completed_creds < 80: return False
    if cid == 54 and completed_creds < 100: return False
    return True

# ------------------------------------------
# SECTION GENERATOR (UPDATED FOR NO BOTTLENECKS)
# ------------------------------------------
section_lookup = {} 
section_sql_inserts = []
sec_id_counter = 10000 

TIMESLOTS = [
    ("Sun-Tue-Thu", "08:00:00", "08:50:00"),
    ("Mon-Wed", "08:00:00", "09:15:00"),
    ("Sun-Tue-Thu", "09:00:00", "09:50:00"),
    ("Mon-Wed", "09:30:00", "10:45:00"),
    ("Sun-Tue-Thu", "10:00:00", "10:50:00"),
    ("Sun-Tue-Thu", "11:00:00", "11:50:00"),
    ("Sun-Tue-Thu", "13:00:00", "13:50:00"),
    ("Sun-Tue-Thu", "14:00:00", "14:50:00"),
    ("Mon-Wed", "13:00:00", "14:15:00")
]

for sem in range(1, 18): 
    for cid in PERFECT_PLAN:
        section_lookup[(cid, sem)] = []
        
        chosen_slots = random.sample(TIMESLOTS, 2)
        
        for sec_idx, slot in enumerate(chosen_slots):
            prof_id = random.randint(1, len(PROFESSORS))
            days, start_time, end_time = slot
            room = f"Room {random.randint(101, 599)}"
            sec_name = f"S{sec_idx + 1}"
            
            section_lookup[(cid, sem)].append((sec_id_counter, prof_id))
            section_sql_inserts.append(f"({sec_id_counter}, {cid}, {sem}, '{sec_name}', {prof_id}, '{days}', '{start_time}', '{end_time}', '{room}', 30)")
            sec_id_counter += 1

# ------------------------------------------
# THE FORWARD-SIMULATING ENGINE
# ------------------------------------------
def simulate_semesters(target_start_sem, pacing):
    allocations = []
    completed = set()
    free_taken = 0
    elec_taken = 0
    
    for sem in range(1, target_start_sem):
        is_summer = (sem % 3 == 0)
        year_num = ((sem - 1) // 3) + 1
        
        if sem == 1:
            for c in Y1_SEM1_COURSES:
                allocations.append({'cid': c, 'sem': sem, 'yr': 1, 'placeholder': 'NULL', 'sem_load': 16})
                completed.add(c)
            continue
        elif sem == 2:
            for c in Y1_SEM2_COURSES:
                allocations.append({'cid': c, 'sem': sem, 'yr': 1, 'placeholder': 'NULL', 'sem_load': 14})
                completed.add(c)
            continue
        elif sem == 3: continue
            
        if is_summer:
            if pacing == "ahead": target_min, target_max = 3, 9
            elif pacing == "on_track": target_min, target_max = 0, 6
            else: target_min, target_max = 0, 3 
            if random.random() < (0.2 if pacing == "ahead" else (0.6 if pacing == "on_track" else 0.8)):
                target_min, target_max = 0, 0
        else:
            if pacing == "ahead": target_min, target_max = 16, 20
            elif pacing == "on_track": target_min, target_max = 14, 18
            else: target_min, target_max = 10, 13
            
        target = random.randint(target_min, target_max)
        if target == 0: continue
        
        cur_creds = 0
        sem_courses = []
        
        eligible_core = [c for c in CORE_MAJOR_COURSES if c not in completed and all(pr in completed for pr in PREREQS.get(c, [])) and is_credit_unlocked(c, completed)]
        for cid in eligible_core:
            c_cred = CREDITS.get(cid, 3)
            if cur_creds + c_cred <= target and cur_creds + c_cred <= (9 if is_summer else 20):
                sem_courses.append({'cid': cid, 'placeholder': 'NULL'})
                cur_creds += c_cred

        if not is_summer and random.random() < 0.25 and cur_creds < target:
            eligible_free = [c for c in FREE_POOL if c not in completed and all(pr in completed for pr in PREREQS.get(c, []))]
            if eligible_free:
                cid = eligible_free[0]
                c_cred = CREDITS.get(cid, 3)
                if cur_creds + c_cred <= target:
                    free_taken += 1
                    ph = f"(SELECT course_id FROM courses WHERE course_prefix = 'FREE' AND course_number = '{min(free_taken, 3)}')"
                    sem_courses.append({'cid': cid, 'placeholder': ph})
                    cur_creds += c_cred

        min_required = 10 if not is_summer else 0
        if cur_creds < min_required:
            eligible_free = [c for c in FREE_POOL if c not in completed and c not in [x['cid'] for x in sem_courses] and all(pr in completed for pr in PREREQS.get(c, []))]
            for cid in eligible_free:
                if cur_creds >= min_required: break
                c_cred = CREDITS.get(cid, 3)
                if cur_creds + c_cred <= 20:
                    free_taken += 1
                    ph = f"(SELECT course_id FROM courses WHERE course_prefix = 'FREE' AND course_number = '{min(free_taken, 3)}')"
                    sem_courses.append({'cid': cid, 'placeholder': ph})
                    cur_creds += c_cred
                    
            eligible_elec = [c for c in ELECTIVES_POOL if c not in completed and c not in [x['cid'] for x in sem_courses] and all(pr in completed for pr in PREREQS.get(c, []))]
            for cid in eligible_elec:
                if cur_creds >= min_required: break
                c_cred = CREDITS.get(cid, 3)
                if cur_creds + c_cred <= 20:
                    elec_taken += 1
                    ph = f"(SELECT course_id FROM courses WHERE course_prefix = 'ELEC' AND course_number = '{min(elec_taken, 3)}')"
                    sem_courses.append({'cid': cid, 'placeholder': ph})
                    cur_creds += c_cred
                    
        if not is_summer and cur_creds < min_required:
            desperate_core = [c for c in CORE_MAJOR_COURSES if c not in completed and c not in [x['cid'] for x in sem_courses] and is_credit_unlocked(c, completed)]
            for cid in desperate_core:
                if cur_creds >= min_required: break
                c_cred = CREDITS.get(cid, 3)
                if cur_creds + c_cred <= 20:
                    sem_courses.append({'cid': cid, 'placeholder': 'NULL'})
                    cur_creds += c_cred

        for sc in sem_courses:
            allocations.append({
                'cid': sc['cid'], 
                'sem': sem, 
                'yr': year_num,
                'placeholder': sc['placeholder'],
                'sem_load': cur_creds # Passed to grader!
            })
            completed.add(sc['cid'])
            
    return allocations

# ==========================================
# 3. Generating the Complete seed.sql
# ==========================================
with open(FILE_NAME, "w", encoding="utf-8") as f:
    # --- STATIC DATA ---
    static_sql = """
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
TRUNCATE TABLE professors;
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
INSERT INTO courses (dept_id, course_prefix, course_number, course_name, credits) VALUES 
(14, 'ELIS', '101', 'ENGLISH LANGUAGE-SCIENCE(1)', 0),
(14, 'ELIS', '102', 'ENGLISH LANGUAGE-SCIENCE(2)', 2),
(14, 'ELIS', '103', 'ENGLISH LANGUAGE-SCIENCE(3)', 2),
(14, 'ELIS', '104', 'ENGLISH LANGUAGE-SCIENCE(4)', 2),
(16, 'ISLS', '101', 'ISLAMIC CULTURE (1)', 3),
(16, 'ISLS', '201', 'ISLAMIC CULTURE (2)', 2),
(16, 'ISLS', '301', 'ISLAMIC CULTURE (3)', 2),
(16, 'ISLS', '401', 'ISLAMIC CULTURE (4)', 2),
(15, 'ARAB', '101', 'ARABIC LANGUAGE (1)', 3),
(15, 'ARAB', '201', 'ARABIC LANGUAGE (2)', 3),
(4, 'MATH', '110', 'GENERAL MATHEMATICS (1)', 3),
(5, 'STAT', '110', 'GENERAL STATISTICS (1)', 3),
(5, 'STAT', '210', 'PROBABILITY THEORY', 3),
(6, 'PHYS', '110', 'GENERAL PHYSICS (1)', 3),
(7, 'BIO',  '110', 'GENERAL BIOLOGY (1)', 3),
(8, 'CHEM', '110', 'GENERAL CHEMISTRY (1)', 3),
(9,  'BUS',  '232', 'Management of Organizations', 3),
(9,  'BUS',  '433', 'Entrepreneurship', 3),
(10, 'MRKT', '260', 'PRINCIPLES OF MARKETING', 3),
(11, 'ACCT', '333', 'PRINCIPLES OF CORPORATE ACCOUNTING', 2),
(12, 'MRKC', '323', 'Persuasion', 3),
(13, 'PR',   '211', 'Public Opinion', 3),
(17, 'COMM', '101', 'COMMUNICATION SKILLS', 3),
(1, 'CPCS', '202', 'PROGRAMMING I', 3),
(1, 'CPCS', '203', 'PROGRAMMING II', 3),
(1, 'CPCS', '222', 'DISCRETE STRUCTURES I', 3),
(1, 'CPCS', '204', 'DATA STRUCTURES (1)', 3),
(2, 'CPIT', '110', 'PROBLEM SOLVING & PROGRAMMING', 3),
(2, 'CPIT', '201', 'INTRODUCTION TO COMPUTING', 3),
(2, 'CPIT', '221', 'TECHNICAL WRITING', 3),
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
(3, 'CPIS', '499', 'SENIOR PROJECT (2)', 3),
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
"""
    f.write(static_sql)
    f.write("\n-- ==========================================\n-- DYNAMIC ML DATA GENERATION\n-- ==========================================\n")

    f.write("-- 9. Users\n")
    f.write("INSERT INTO users (username, password, first_name, last_name, role) VALUES \n")
    pw = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" 
    users = [f"('admin1', '{pw}', 'Matthew', 'Williams', 'admin')"]
    
    for i, prof in enumerate(PROFESSORS):
        parts = prof['name'].split(' ', 1)
        if i == 0:
            users.append(f"('prof1', '{pw}', '{parts[0]}', '{parts[1]}', 'supervisor')")
        elif i == 1:
            users.append(f"('prof2', '{pw}', '{parts[0]}', '{parts[1]}', 'supervisor')")
        else:
            users.append(f"('prof{i+1}', '{pw}', '{parts[0]}', '{parts[1]}', 'professor')")
            
    for i, (fn, ln) in enumerate(ACTIVE_NAMES, 1):
        users.append(f"('student{i}', '{pw}', '{fn}', '{ln}', 'student')")
        
    for i in range(11, 11 + NUM_HISTORICAL_STUDENTS):
        fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
        users.append(f"('hist_student{i}', '{pw}', '{fn}', '{ln}', 'student')")
    f.write(",\n".join(users) + ";\n\n")

    f.write("-- 10. Professors Table Mapping\n")
    f.write("INSERT INTO professors (user_id, dept_id, is_supervisor, office_number) VALUES \n")
    profs = []
    for i, prof in enumerate(PROFESSORS):
        user_id = i + 2
        is_sup = "TRUE" if prof["is_sup"] else "FALSE"
        room = f"'Room {random.randint(400, 499)}'"
        profs.append(f"({user_id}, 3, {is_sup}, {room})")
    f.write(",\n".join(profs) + ";\n\n")

    f.write("-- 11. Students\n")
    f.write("INSERT INTO students (user_id, program_id, admission_year, supervisor_id, is_graduated) VALUES \n")
    students = []
    
    students.append("(17, 1, 2024, 1, FALSE)")  # S1 -> prof1
    students.append("(18, 1, 2024, 2, FALSE)")  # S2 -> prof2
    students.append("(19, 1, 2023, 2, FALSE)")  # S3 -> prof2
    students.append("(20, 1, 2023, 1, FALSE)")  # S4 -> prof1
    students.append("(21, 1, 2022, 1, FALSE)")  # S5 -> prof1
    students.append("(22, 1, 2022, 2, FALSE)")  # S6 -> prof2
    
    for i in range(23, 23 + NUM_HISTORICAL_STUDENTS):
        sup_id = random.choice([1, 2]) 
        admit_year = random.randint(2018, 2021)
        students.append(f"({i}, 1, {admit_year}, {sup_id}, TRUE)")
    f.write(",\n".join(students) + ";\n\n")

    f.write("-- 12. Sections (ML Professor Engine)\n")
    chunk_size = 300
    for i in range(0, len(section_sql_inserts), chunk_size):
        chunk = section_sql_inserts[i:i+chunk_size]
        f.write("INSERT INTO sections (section_id, course_id, semester_id, section_name, professor_id, days, start_time, end_time, room_number, max_capacity) VALUES \n")
        f.write(",\n".join(chunk) + ";\n")
    f.write("\n")

    f.write("-- 13. Enrollments (Active Students)\n")
    f.write("INSERT INTO enrollments (student_id, section_id, course_id, semester_id, year_number, status, grade, placeholder_id) VALUES \n")
    enrolls = []
    
    profiles = [
        {"id": 1, "gpa": 4.4, "start_sem": 7,  "pacing": "ahead"},    # Sup 1
        {"id": 2, "gpa": 3.9, "start_sem": 7,  "pacing": "on_track"}, # Sup 2
        {"id": 3, "gpa": 4.2, "start_sem": 10, "pacing": "ahead"},    # Sup 2
        {"id": 4, "gpa": 3.6, "start_sem": 10, "pacing": "behind"},   # Sup 1
        {"id": 5, "gpa": 4.3, "start_sem": 13, "pacing": "on_track"}, # Sup 1
        {"id": 6, "gpa": 3.7, "start_sem": 13, "pacing": "behind"},   # Sup 2
    ]
    
    for p in profiles:
        allocs = simulate_semesters(p["start_sem"], p["pacing"])
        for a in allocs:
            grade = force_gpa_grade(p["gpa"])
            
            available_sections = section_lookup.get((a['cid'], a['sem']), [(1, 1)])
            chosen_sec = random.choice(available_sections)
            sec_id = chosen_sec[0]
            
            enrolls.append(f"({p['id']}, {sec_id}, {a['cid']}, {a['sem']}, {a['yr']}, 'completed', {grade}, {a['placeholder']})")
    f.write(",\n".join(enrolls) + ";\n\n")

    f.write("-- 14. Enrollments (Historical ML Data)\n")
    hist_enrolls = []
    for student_id in range(7, 7 + NUM_HISTORICAL_STUDENTS):
        gen_apt = random.uniform(-4, 4)
        prog_apt = random.uniform(-5, 5)
        start_sem = random.randint(10, 16) 
        pacing = random.choice(["ahead", "on_track", "behind"])
        
        allocs = simulate_semesters(start_sem, pacing)
        for a in allocs:
            available_sections = section_lookup.get((a['cid'], a['sem']), [(1, 1)])
            chosen_sec = random.choice(available_sections)
            sec_id = chosen_sec[0]
            prof_id = chosen_sec[1]
            
            grade = get_realistic_grade(a['cid'], gen_apt, prog_apt, prof_id, (a['sem'] % 3 == 0), a['sem_load'])
            hist_enrolls.append(f"({student_id}, {sec_id}, {a['cid']}, {a['sem']}, {a['yr']}, 'completed', {grade}, {a['placeholder']})")

    for i in range(0, len(hist_enrolls), chunk_size):
        chunk = hist_enrolls[i:i+chunk_size]
        f.write("INSERT INTO enrollments (student_id, section_id, course_id, semester_id, year_number, status, grade, placeholder_id) VALUES \n")
        f.write(",\n".join(chunk) + ";\n")

    f.write("\nSET FOREIGN_KEY_CHECKS = 1;\n")

print(f"Success! Generated {FILE_NAME}. Total Integration Complete.")