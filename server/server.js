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
    const sql = `
        SELECT 
            e.course_id, 
            c.course_name, 
            e.grade, 
            e.year_number, 
            e.status, 
            c.credits,
            sem.semester_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        JOIN students s ON e.student_id = s.student_id
        JOIN sections sec ON e.section_id = sec.section_id
        JOIN semesters sem ON sec.semester_id = sem.semester_id
        WHERE s.user_id = ?
    `;
    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- SAVE PLAN ROUTE ---
app.post('/save-plan', (req, res) => {
    const { user_id, selectedCourses } = req.body;

    if (!selectedCourses || selectedCourses.length === 0) {
        return res.status(400).json({ error: "No courses selected" });
    }

    db.query('SELECT student_id FROM students WHERE user_id = ?', [user_id], (err, studentResult) => {
        if (err || studentResult.length === 0) return res.status(500).json({ error: "Student not found" });
        
        const student_id = studentResult[0].student_id;
        
        const values = selectedCourses.map(course => [
            student_id, 
            null, 
            course.course_id, 
            2026, 
            'undergoing'
        ]);

        const sql = 'INSERT INTO enrollments (student_id, section_id, course_id, year_number, status) VALUES ?';
        
        db.query(sql, [values], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Database error during save" });
            }
            res.json({ success: true, message: "Plan saved successfully!" });
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