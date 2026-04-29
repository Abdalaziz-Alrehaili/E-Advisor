import random

# ==========================================
# 1. Configuration & Data Setup
# ==========================================
NUM_HISTORICAL_STUDENTS = 150
FILE_NAME = "03_historical_seed.sql"

FIRST_NAMES = ["Mohammed", "Youssef", "Ahmed", "Mahmoud", "Mustafa", "Yaseen", "Taha", "Khalid", "Hamza", "Bilal", "Ibrahim", "Hassan", "Hussein", "Kareem", "Tariq", "Abdulrahman", "Ali", "Omar", "Murad", "Salem", "Abdullah", "Abdulaziz", "Saud", "Salman"]
LAST_NAMES = ["Alharbi", "Alghamdi", "Alzahrani", "AlAmri", "AlJohani", "AlOtaibi", "AlQahtani", "AlDosari", "AlMaghrabi", "Alturkistani", "Bukhari", "Kurdi", "AlMasri", "Hijazi", "Jowharji", "Kazzaz", "Kutbi", "Attar", "Hakeem", "AlMalki", "AlHarthi", "Khalil", "AlDossari", "AlShamrani"]

# Hardcoded Active Student Names mapped EXACTLY to your requested roster
ACTIVE_NAMES = [
    ("Mustafa", "Jowharji"),   # S1: Sup 1 (Ahead)
    ("Mohammed", "Alharbi"),   # S2: Sup 2 (On Track)
    ("Tariq", "Bukhari"),      # S3: Sup 2 (Ahead)
    ("Youssef", "Alghamdi"),   # S4: Sup 1 (Behind)
    ("Hassan", "Kurdi"),       # S5: Sup 1 (On Track)
    ("Ali", "AlDossari")       # S6: Sup 2 (Behind)
]

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

# Complete pool of all available courses
ALL_UPPER = [
    29, 13, 30, 24, 5, 25, 32, 9, 6, 21,                    
    27, 26, 31, 17, 33, 34, 39, 19, 35, 48, 22, 18,         
    42, 44, 46, 20, 45, 36, 43, 49, 10, 38, 37, 41, 47,     
    7, 54, 51, 40, 8, 55, 52, 50, 53                        
]

# The Failsafe Pools
FREE_POOL = [18, 21, 22]               # BUS-433, MRKC-323, PR-211
ELECTIVES_POOL = [37, 41, 47, 50, 53]  # CPIS-320, 350, 363, 420, 486
CORE_MAJOR_COURSES = [c for c in ALL_UPPER if c not in FREE_POOL and c not in ELECTIVES_POOL]

PERFECT_PLAN = Y1_SEM1_COURSES + Y1_SEM2_COURSES + ALL_UPPER

# ==========================================
# 2. Math & Logic Functions
# ==========================================
def get_realistic_grade(course_id, general_apt, prog_apt):
    c = COURSES.get(course_id, {'avg': 85, 'var': 'norm', 'skew': None, 'prog': False})
    modifier = general_apt
    if c['prog']: modifier += prog_apt
    sigma = 12 if c['var'] == 'high' else (3 if c['var'] == 'low' else 6)
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

# --- NEW: CREDIT BARRIER CHECK ---
def is_credit_unlocked(cid, completed_set):
    if cid not in [38, 54]:
        return True
    
    # Calculate exact total credits the student currently has passed
    completed_creds = sum(CREDITS.get(c, 3) for c in completed_set)
    
    # Summer Training Barrier
    if cid == 38 and completed_creds < 80:
        return False
    # Senior Project Barrier
    if cid == 54 and completed_creds < 100:
        return False
        
    return True

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
                allocations.append({'cid': c, 'sem': sem, 'yr': 1, 'placeholder': 'NULL'})
                completed.add(c)
            continue
        elif sem == 2:
            for c in Y1_SEM2_COURSES:
                allocations.append({'cid': c, 'sem': sem, 'yr': 1, 'placeholder': 'NULL'})
                completed.add(c)
            continue
        elif sem == 3:
            continue
            
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
        
        # --- PHASE 1: Try to fill with Core Major Courses ---
        # NOTE: is_credit_unlocked prevents early capstone/training grabs
        eligible_core = [c for c in CORE_MAJOR_COURSES if c not in completed and all(pr in completed for pr in PREREQS.get(c, [])) and is_credit_unlocked(c, completed)]
        for cid in eligible_core:
            c_cred = CREDITS.get(cid, 3)
            if cur_creds + c_cred <= target and cur_creds + c_cred <= (9 if is_summer else 20):
                sem_courses.append({'cid': cid, 'placeholder': 'NULL'})
                cur_creds += c_cred

        # Occasionally sprinkle in an elective
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

        # --- PHASE 2: EMERGENCY PADDING ---
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
                    
        # --- PHASE 3: Absolute Failsafe ---
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
                'placeholder': sc['placeholder']
            })
            completed.add(sc['cid'])
            
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
        f"('supervisor_hist', '{pw}', 'Dr. History', 'Archive', 'supervisor')" 
    ]
    
    for i, (fn, ln) in enumerate(ACTIVE_NAMES, 1):
        users.append(f"('student{i}', '{pw}', '{fn}', '{ln}', 'student')")
        
    for i in range(11, 11 + NUM_HISTORICAL_STUDENTS):
        fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
        users.append(f"('hist_student{i}', '{pw}', '{fn}', '{ln}', 'student')")
    f.write(",\n".join(users) + ";\n\n")

    f.write("-- 2. Students\n")
    f.write("INSERT INTO students (user_id, program_id, admission_year, supervisor_id, is_graduated) VALUES \n")
    students = []
    
    students.append("(5, 1, 2024, 2, FALSE)")  # Sup 1
    students.append("(6, 1, 2024, 3, FALSE)")  # Sup 2
    students.append("(7, 1, 2023, 3, FALSE)")  # Sup 2
    students.append("(8, 1, 2023, 2, FALSE)")  # Sup 1
    students.append("(9, 1, 2022, 2, FALSE)")  # Sup 1
    students.append("(10, 1, 2022, 3, FALSE)") # Sup 2
    
    for i in range(11, 11 + NUM_HISTORICAL_STUDENTS):
        sup_id = 4 
        admit_year = random.randint(2018, 2021)
        students.append(f"({i}, 1, {admit_year}, {sup_id}, TRUE)")
    f.write(",\n".join(students) + ";\n\n")

    f.write("-- 3. Enrollments (Active Students)\n")
    f.write("INSERT INTO enrollments (student_id, course_id, semester_id, year_number, status, grade, placeholder_id) VALUES \n")
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
            enrolls.append(f"({p['id']}, {a['cid']}, {a['sem']}, {a['yr']}, 'completed', {grade}, {a['placeholder']})")
    f.write(",\n".join(enrolls) + ";\n\n")

    f.write("-- 4. Enrollments (Historical Machine Learning Data)\n")
    hist_enrolls = []
    for student_id in range(7, 7 + NUM_HISTORICAL_STUDENTS):
        gen_apt = random.uniform(-4, 4)
        prog_apt = random.uniform(-5, 5)
        start_sem = random.randint(10, 16) 
        pacing = random.choice(["ahead", "on_track", "behind"])
        
        allocs = simulate_semesters(start_sem, pacing)
        for a in allocs:
            grade = get_realistic_grade(a['cid'], gen_apt, prog_apt)
            hist_enrolls.append(f"({student_id}, {a['cid']}, {a['sem']}, {a['yr']}, 'completed', {grade}, {a['placeholder']})")

    chunk_size = 500
    for i in range(0, len(hist_enrolls), chunk_size):
        chunk = hist_enrolls[i:i+chunk_size]
        f.write("INSERT INTO enrollments (student_id, course_id, semester_id, year_number, status, grade, placeholder_id) VALUES \n")
        f.write(",\n".join(chunk) + ";\n")

    f.write("\nSET FOREIGN_KEY_CHECKS = 1;\n")

print(f"Success! Generated {FILE_NAME}. Credit limits enforced successfully.")