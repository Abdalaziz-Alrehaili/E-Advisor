import random

# ==========================================
# 1. Configuration & Data Setup
# ==========================================
NUM_HISTORICAL_STUDENTS = 150
FILE_NAME = "03_historical_seed.sql"

FIRST_NAMES = ["Mohammed", "Youssef", "Ahmed", "Mahmoud", "Mustafa", "Yaseen", "Taha", "Khalid", "Hamza", "Bilal", "Ibrahim", "Hassan", "Hussein", "Kareem", "Tariq", "Abdulrahman", "Ali", "Omar", "Murad", "Salem", "Abdullah", "Abdulaziz", "Saud", "Salman"]
LAST_NAMES = ["Alharbi", "Alghamdi", "Alzahrani", "AlAmri", "AlJohani", "AlOtaibi", "AlQahtani", "AlDosari", "AlMaghrabi", "Alturkistani", "Bukhari", "Kurdi", "AlMasri", "Hijazi", "Jowharji", "Kazzaz", "Kutbi", "Attar", "Hakeem", "AlMalki", "AlHarthi", "Khalil", "AlDossari", "AlShamrani"]

# Course Rules (ID: {avg, var, skew, prog})
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

# The Strict Foundation Year Courses
Y1_SEM1_COURSES = [1, 2, 11, 14, 15, 23] 
Y1_SEM2_COURSES = [3, 4, 12, 16, 28]     
Y1_ALL = Y1_SEM1_COURSES + Y1_SEM2_COURSES

# The completely ordered perfect master plan
UPPER_COURSES = [
    29, 13, 30, 24, 5, 25, 32, 9, 6,        # Y2
    27, 26, 31, 17, 33, 34, 39, 19, 35, 48, # Y3
    42, 44, 46, 20, 45, 36, 43, 49, 10, 38, # Y4
    7, 54, 51, 40, 8, 55, 52                # Y5
]

PERFECT_PLAN = Y1_ALL + UPPER_COURSES

# ==========================================
# 2. Math & Logic Functions
# ==========================================
def score_to_grade(score):
    if score >= 95: return "A+"
    elif score >= 90: return "A"
    elif score >= 85: return "B+"
    elif score >= 80: return "B"
    elif score >= 75: return "C+"
    elif score >= 70: return "C"
    elif score >= 65: return "D+"
    elif score >= 60: return "D"
    else: return "F"

def get_realistic_grade(course_id, general_apt, prog_apt):
    c = COURSES.get(course_id, {'avg': 85, 'var': 'norm', 'skew': None, 'prog': False})
    modifier = general_apt
    if c['prog']: modifier += prog_apt
    sigma = 12 if c['var'] == 'high' else (3 if c['var'] == 'low' else 6)
    score = random.gauss(c['avg'] + modifier, sigma)
    if c['skew'] == 'neg': score = max(score, random.gauss(94, 3))
    if c['skew'] == 'pos': score = min(score, random.gauss(70, 5))
    return score_to_grade(max(0, min(100, score)))

def force_gpa_grade(target_gpa):
    if target_gpa >= 4.4: return random.choice(['A+', 'A+', 'A'])
    elif target_gpa >= 4.2: return random.choice(['A+', 'A', 'B+'])
    elif target_gpa >= 3.9: return random.choice(['A', 'B+', 'B'])
    elif target_gpa >= 3.7: return random.choice(['B+', 'B', 'C+'])
    else: return random.choice(['B', 'C+', 'C', 'D+'])

def get_student_courses(num_courses):
    return PERFECT_PLAN[:num_courses]

# ------------------------------------------
# THE ADVANCED ACADEMIC ADVISOR SIMULATOR
# ------------------------------------------
def simulate_semesters(courses, start_sem, shuffle=False):
    allocations = []
    completed_courses = set()
    
    # --- PHASE 1: THE FOUNDATION YEAR ---
    for cid in Y1_SEM1_COURSES:
        if cid in courses:
            allocations.append({'cid': cid, 'sem': start_sem, 'yr': 1})
            completed_courses.add(cid)
            
    for cid in Y1_SEM2_COURSES:
        if cid in courses:
            allocations.append({'cid': cid, 'sem': start_sem + 1, 'yr': 1})
            completed_courses.add(cid)
            
    # --- PHASE 2: UPPER LEVEL COURSES ---
    current_sem = start_sem + 3 # Explicitly skips Y1 Summer
    unassigned = [c for c in courses if c not in completed_courses]
    
    while unassigned:
        is_summer = (current_sem % 3 == 0)
        max_limit = 9 if is_summer else 19
        min_limit = 0 if is_summer else 10
        soft_limit = random.randint(4, 8) if is_summer else random.randint(14, 18)
        
        current_creds = 0
        current_sem_courses = set()
        
        while True:
            takeable = [c for c in unassigned if all(pr in completed_courses for pr in PREREQS.get(c, []))]
            
            if not takeable and current_creds < min_limit and not is_summer:
                for pad_c in PERFECT_PLAN:
                    if pad_c not in completed_courses and pad_c not in current_sem_courses and pad_c not in unassigned:
                        if all(pr in completed_courses for pr in PREREQS.get(pad_c, [])):
                            unassigned.append(pad_c)
                            takeable.append(pad_c)
                            break 
            
            if not takeable: break

            if shuffle: random.shuffle(takeable)
            else: takeable.sort(key=lambda x: PERFECT_PLAN.index(x))
            
            added = False
            for cid in takeable:
                c_cred = CREDITS.get(cid, 3)
                if current_creds + c_cred <= max_limit:
                    year_num = ((current_sem - start_sem) // 3) + 1
                    allocations.append({'cid': cid, 'sem': current_sem, 'yr': year_num})
                    
                    current_sem_courses.add(cid)
                    current_creds += c_cred
                    unassigned.remove(cid)
                    added = True
                    break 

            if not added: break 
            if current_creds >= soft_limit and current_creds >= min_limit: break 
                
        completed_courses.update(current_sem_courses)
        current_sem += 1
        
        if current_sem % 3 == 0 and random.random() < 0.75:
            current_sem += 1 
            
    # --- PHASE 3: THE SEMESTER 1 ROLLBACK (THE FIX) ---
    # Guarantee no student is left stranded having only finished a "Semester 1"
    if allocations:
        max_sem = max(a['sem'] for a in allocations)
        if max_sem % 3 == 1: # 1 corresponds to Semester 1 (e.g. 1, 4, 7, 10...)
            # Delete any overflow courses that spilled into Sem 1
            allocations = [a for a in allocations if a['sem'] != max_sem]
            
    return allocations

# ==========================================
# 3. Generating the SQL
# ==========================================
with open(FILE_NAME, "w", encoding="utf-8") as f:
    f.write("SET FOREIGN_KEY_CHECKS = 0;\n\n")

    f.write("-- 1. Users\n")
    f.write("INSERT INTO users (username, password, first_name, last_name, role) VALUES \n")
    pw = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" 
    users = [
        f"('admin1', '{pw}', 'Matthew', 'Williams', 'admin')",
        f"('supervisor1', '{pw}', 'Dr. Ahmed', 'Al-Faisal', 'supervisor')",
        f"('supervisor2', '{pw}', 'Dr. Khalid', 'Omar', 'supervisor')",
        f"('supervisor_hist', '{pw}', 'Dr. History', 'Archive', 'supervisor')" # The Ghost Supervisor
    ]
    for i in range(1, 7):
        fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
        users.append(f"('student{i}', '{pw}', '{fn}', '{ln}', 'student')")
    for i in range(1, NUM_HISTORICAL_STUDENTS + 1):
        fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
        users.append(f"('hist_student{i}', '{pw}', '{fn}', '{ln}', 'student')")
    f.write(",\n".join(users) + ";\n\n")

    f.write("-- 2. Students\n")
    f.write("INSERT INTO students (user_id, program_id, admission_year, supervisor_id, is_graduated) VALUES \n")
    students = []
    
    students.append("(5, 1, 2024, 2, FALSE)") # S1: Y3 (Sup 1)
    students.append("(6, 1, 2024, 3, FALSE)") # S2: Y3 (Sup 2)
    students.append("(7, 1, 2023, 3, FALSE)") # S3: Y4 (Sup 2)
    students.append("(8, 1, 2023, 2, FALSE)") # S4: Y4 (Sup 1)
    students.append("(9, 1, 2022, 2, FALSE)") # S5: Y5 (Sup 1)
    students.append("(10, 1, 2022, 3, FALSE)") # S6: Y5 (Sup 2)
    
    for i in range(11, 11 + NUM_HISTORICAL_STUDENTS):
        sup_id = 4 
        admit_year = random.randint(2018, 2021)
        students.append(f"({i}, 1, {admit_year}, {sup_id}, TRUE)")
    f.write(",\n".join(students) + ";\n\n")

    f.write("-- 3. Enrollments (Active Students)\n")
    f.write("INSERT INTO enrollments (student_id, course_id, semester_id, year_number, status, grade) VALUES \n")
    enrolls = []
    
    # Adjusted course limits so they naturally end close to the end of their respective years
    profiles = [
        {"id": 1, "gpa": 4.4, "start_sem": 10, "shuffle": True,  "courses": get_student_courses(21)}, # Y3
        {"id": 2, "gpa": 3.9, "start_sem": 10, "shuffle": False, "courses": get_student_courses(20)}, # Y3 Perfect
        {"id": 3, "gpa": 4.2, "start_sem": 7,  "shuffle": True,  "courses": get_student_courses(31)}, # Y4
        {"id": 4, "gpa": 3.6, "start_sem": 7,  "shuffle": True,  "courses": get_student_courses(28)}, # Y4
        {"id": 5, "gpa": 4.3, "start_sem": 4,  "shuffle": False, "courses": get_student_courses(40)}, # Y5 Perfect
        {"id": 6, "gpa": 3.7, "start_sem": 4,  "shuffle": True,  "courses": get_student_courses(37)}, # Y5
    ]
    
    for p in profiles:
        allocs = simulate_semesters(p["courses"], p["start_sem"], p["shuffle"])
        for a in allocs:
            grade = force_gpa_grade(p["gpa"])
            enrolls.append(f"({p['id']}, {a['cid']}, {a['sem']}, {a['yr']}, 'completed', '{grade}')")
    f.write(",\n".join(enrolls) + ";\n\n")

    f.write("-- 4. Enrollments (Historical Machine Learning Data)\n")
    hist_enrolls = []
    for student_id in range(7, 7 + NUM_HISTORICAL_STUDENTS):
        gen_apt = random.uniform(-4, 4)
        prog_apt = random.uniform(-5, 5)
        start_sem = random.choice([1, 4, 7]) 
        
        num_courses = random.randint(35, 48)
        taken = get_student_courses(num_courses)
        
        allocs = simulate_semesters(taken, start_sem, shuffle=True)
        for a in allocs:
            grade = get_realistic_grade(a['cid'], gen_apt, prog_apt)
            hist_enrolls.append(f"({student_id}, {a['cid']}, {a['sem']}, {a['yr']}, 'completed', '{grade}')")

    chunk_size = 500
    for i in range(0, len(hist_enrolls), chunk_size):
        chunk = hist_enrolls[i:i+chunk_size]
        f.write("INSERT INTO enrollments (student_id, course_id, semester_id, year_number, status, grade) VALUES \n")
        f.write(",\n".join(chunk) + ";\n")

    f.write("\nSET FOREIGN_KEY_CHECKS = 1;\n")

print(f"Success! Generated {FILE_NAME}. Semester 1 Rollback logic engaged.")