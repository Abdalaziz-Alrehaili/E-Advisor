const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'senior_project_2026',
    database: process.env.DB_NAME || 'eadvisor_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- AUTHENTICATION ROUTE ---
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length > 0) {
            const user = results[0];
            delete user.password;
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: "Invalid username or password" });
        }
    });
});

// --- DATA ROUTES ---
app.get('/students', (req, res) => {
    const sql = `SELECT s.student_id as id, u.first_name, u.last_name, u.username as email 
                 FROM students s JOIN users u ON s.user_id = u.user_id`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results.map(r => ({ id: r.id, name: `${r.first_name} ${r.last_name}`, email: r.email })));
    });
});

app.get('/courses', (req, res) => {
    db.query('SELECT * FROM courses', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/curriculum-status/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = `
        SELECT 
            c.course_id, 
            c.course_name, 
            c.credits,
            e.status,
            e.grade
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.student_id = (
            SELECT student_id FROM students WHERE user_id = ?
        )
        ORDER BY c.course_id ASC;
    `;
    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/semesters', (req, res) => {
    const sql = `SELECT s.semester_id, s.semester_name, r.semester_type, r.max_credits 
                 FROM semesters s JOIN semester_rules r ON s.rule_id = r.rule_id`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/my-grades/:user_id', (req, res) => {
    const { user_id } = req.params;
    
    // We use e.year_number (Actual taken year) + pr.ideal_semester (Fall/Spring split)
    const sql = `
        SELECT 
            c.course_id, 
            c.course_name, 
            e.grade, 
            e.status, 
            c.credits,
            e.year_number,
            pr.ideal_semester,
            CONCAT('Year ', e.year_number, ' - Semester ', pr.ideal_semester) AS display_term
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        JOIN students s ON e.student_id = s.student_id
        JOIN program_requirements pr ON c.course_id = pr.course_id AND s.program_id = pr.program_id
        WHERE s.user_id = ?
        ORDER BY e.year_number ASC, pr.ideal_semester ASC
    `;
    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- SAVE OR UPDATE DRAFT PLAN ROUTE ---
app.post('/save-plan', (req, res) => {
    const { user_id, selectedCourses } = req.body;

    if (!selectedCourses || selectedCourses.length === 0) {
        return res.status(400).json({ error: "No courses selected" });
    }

    db.query('SELECT student_id FROM students WHERE user_id = ?', [user_id], (err, studentResult) => {
        if (err || studentResult.length === 0) return res.status(500).json({ error: "Student not found" });
        
        const student_id = studentResult[0].student_id;
        const courseIds = selectedCourses.map(course => course.course_id);
        const selected_courses_json = JSON.stringify(courseIds);
        
        // Target upcoming semester (Semester 14 in your seed)
        const semester_id = 14; 
        const year_number = 2026;

        // Check if the student already has a plan
        db.query('SELECT build_id FROM build_semester WHERE student_id = ?', [student_id], (err, draftResult) => {
            if (err) return res.status(500).json({ error: "Database error" });

            if (draftResult.length > 0) {
                // Rule 1: REPLACE / UPDATE existing plan
                const sqlUpdate = 'UPDATE build_semester SET selected_courses_json = ?, status = "draft", updated_at = NOW() WHERE student_id = ?';
                db.query(sqlUpdate, [selected_courses_json, student_id], (err) => {
                    if (err) return res.status(500).json({ error: "Failed to update plan" });
                    res.json({ success: true, message: "Plan updated successfully!" });
                });
            } else {
                // Rule 1: INSERT new plan
                const sqlInsert = 'INSERT INTO build_semester (student_id, semester_id, year_number, selected_courses_json, status) VALUES (?, ?, ?, ?, "draft")';
                db.query(sqlInsert, [student_id, semester_id, year_number, selected_courses_json], (err) => {
                    if (err) return res.status(500).json({ error: "Failed to create plan" });
                    res.json({ success: true, message: "Plan saved successfully!" });
                });
            }
        });
    });
});

// --- FETCH DRAFT PLAN ROUTE (For the Profile Page) ---
app.get('/my-draft/:user_id', (req, res) => {
    const { user_id } = req.params;
    
    // 1. Get the draft JSON from the database
    const sqlDraft = `
        SELECT bs.selected_courses_json, bs.status, bs.year_number, s.semester_name 
        FROM build_semester bs
        JOIN students st ON bs.student_id = st.student_id
        JOIN semesters s ON bs.semester_id = s.semester_id
        WHERE st.user_id = ?
    `;
    
    db.query(sqlDraft, [user_id], (err, draftResults) => {
        if (err) return res.status(500).json({ error: err.message });
        if (draftResults.length === 0) return res.json(null); // No draft found
        
        const draft = draftResults[0];
        
        // THE FIX: Check if mysql2 already parsed it into an array
        let courseIds;
        if (typeof draft.selected_courses_json === 'string') {
            courseIds = JSON.parse(draft.selected_courses_json);
        } else {
            courseIds = draft.selected_courses_json; // It's already an array!
        }
        
        if (!courseIds || courseIds.length === 0) return res.json({ ...draft, courses: [] });

        // 2. Fetch the actual course names and credits using the IDs
        const placeholders = courseIds.map(() => '?').join(',');
        const sqlCourses = `SELECT course_id, course_name, credits FROM courses WHERE course_id IN (${placeholders})`;
        
        db.query(sqlCourses, courseIds, (err, courses) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                semester_name: draft.semester_name,
                status: draft.status,
                courses: courses
            });
        });
    });
});

// --- DYNAMIC EXPLORER ROUTE ---
app.get('/:table', (req, res) => {
    const allowedTables = [
        'users', 'faculties', 'semester_rules', 'courses', 
        'departments', 'programs', 'prerequisites', 'semesters', 
        'students', 'program_requirements', 'sections', 
        'build_semester', 'enrollments'
    ];
    if (!allowedTables.includes(req.params.table)) return res.status(403).send("Access Denied");
    db.query(`SELECT * FROM ${req.params.table}`, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));