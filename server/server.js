const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();
const { buildCurriculumGraph } = require('./graphUtils');

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
const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = hashPassword(password.trim());
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, hashedPassword], (err, results) => {
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
    const sql = `SELECT s.student_id as id, u.first_name, u.last_name, u.username as email FROM students s JOIN users u ON s.user_id = u.user_id`;
    db.query(sql, (err, results) => res.json(results.map(r => ({ id: r.id, name: `${r.first_name} ${r.last_name}`, email: r.email }))));
});

app.get('/courses', (req, res) => {
    db.query('SELECT * FROM courses', (err, results) => res.json(results));
});

app.get('/curriculum-status/:user_id', (req, res) => {
    const sql = `SELECT c.course_id, c.course_name, c.credits, e.status, e.grade, pr.ideal_year, pr.ideal_semester FROM program_requirements pr JOIN courses c ON pr.course_id = c.course_id JOIN students s ON s.program_id = pr.program_id AND s.user_id = ? LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.student_id = s.student_id ORDER BY pr.ideal_year ASC, pr.ideal_semester ASC`;
    db.query(sql, [req.params.user_id], (err, results) => res.json(results));
});

app.get('/semesters', (req, res) => {
    db.query('SELECT s.semester_id, s.semester_name, r.semester_type, r.max_credits FROM semesters s JOIN semester_rules r ON s.rule_id = r.rule_id', (err, results) => res.json(results));
});

// FIX: Added c.course_prefix and c.course_number to the SELECT query
app.get('/my-grades/:user_id', (req, res) => {
    const sql = `SELECT c.course_id, c.course_prefix, c.course_number, c.course_name, e.grade, e.status, c.credits, e.year_number, pr.ideal_semester, CONCAT('Year ', e.year_number, ' - Semester ', pr.ideal_semester) AS display_term FROM enrollments e JOIN courses c ON e.course_id = c.course_id JOIN students s ON e.student_id = s.student_id JOIN program_requirements pr ON c.course_id = pr.course_id AND s.program_id = pr.program_id WHERE s.user_id = ? ORDER BY e.year_number ASC, pr.ideal_semester ASC`;
    db.query(sql, [req.params.user_id], (err, results) => res.json(results));
});

app.get('/my-major/:user_id', (req, res) => {
    const sql = `
        SELECT p.program_name 
        FROM students s 
        JOIN programs p ON s.program_id = p.program_id 
        WHERE s.user_id = ?
    `;
    db.query(sql, [req.params.user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ major: results.length > 0 ? results[0].program_name : 'Unknown Major' });
    });
});

// --- FETCH DRAFT PLAN ROUTE ---
app.get('/my-draft/:user_id', (req, res) => {
    const { user_id } = req.params;

    db.query('SELECT semester_id, semester_name, registration_close_date FROM semesters WHERE is_registration_open = TRUE LIMIT 1', (err, semResults) => {
        if (err) return res.status(500).json({ error: err.message });
        const openSemester = semResults[0];

        const sqlStudent = `SELECT s.student_id, IFNULL(MAX(e.year_number), 0) as max_year FROM students s LEFT JOIN enrollments e ON s.student_id = e.student_id WHERE s.user_id = ? GROUP BY s.student_id`;
        db.query(sqlStudent, [user_id], (err, studentResults) => {
            if (err) return res.status(500).json({ error: err.message });
            if (studentResults.length === 0) return res.json(null); 

            const { student_id, max_year } = studentResults[0];

            const sqlDraft = `SELECT bs.selected_courses_json, bs.status, bs.year_number, s.semester_name, s.semester_id, s.registration_close_date FROM build_semester bs JOIN semesters s ON bs.semester_id = s.semester_id WHERE bs.student_id = ?`;
            db.query(sqlDraft, [student_id], (err, draftResults) => {
                if (err) return res.status(500).json({ error: err.message });

                if (draftResults.length > 0) {
                    const draft = draftResults[0];
                    let courseIds;
                    try { courseIds = typeof draft.selected_courses_json === 'string' ? JSON.parse(draft.selected_courses_json) : draft.selected_courses_json; } catch(e) { courseIds = []; }
                    
                    if (!courseIds || courseIds.length === 0) return res.json({ ...draft, courses: [] });

                    // FIX: Added course_prefix and course_number here too
                    db.query(`SELECT course_id, course_prefix, course_number, course_name, credits FROM courses WHERE course_id IN (?)`, [courseIds], (err, courses) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ ...draft, courses });
                    });
                } else if (openSemester) {
                    const isFirstSem = openSemester.semester_name.toLowerCase().includes('first') || openSemester.semester_name.includes('1');
                    const academicYear = isFirstSem ? max_year + 1 : (max_year === 0 ? 1 : max_year);

                    res.json({
                        semester_name: openSemester.semester_name,
                        semester_id: openSemester.semester_id,
                        registration_close_date: openSemester.registration_close_date, 
                        status: 'open',
                        year_number: academicYear,
                        courses: []
                    });
                } else {
                    res.json(null);
                }
            });
        });
    });
});

app.post('/save-plan', (req, res) => {
    const { user_id, selectedCourses } = req.body;
    if (!selectedCourses || selectedCourses.length === 0) return res.status(400).json({ error: "No courses selected" });

    db.query('SELECT semester_id, semester_name FROM semesters WHERE is_registration_open = TRUE LIMIT 1', (err, semResult) => {
        if (err || semResult.length === 0) return res.status(403).json({ error: "Registration is currently closed." });

        const open_semester_id = semResult[0].semester_id;
        const yearMatch = semResult[0].semester_name.match(/\d{4}/);
        const dynamic_year_number = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

        db.query('SELECT student_id FROM students WHERE user_id = ?', [user_id], (err, studentResult) => {
            if (err || studentResult.length === 0) return res.status(500).json({ error: "Student not found" });
            const student_id = studentResult[0].student_id;
            const courseIds = selectedCourses.map(course => course.course_id);
            const selected_courses_json = JSON.stringify(courseIds);

            db.query('SELECT build_id FROM build_semester WHERE student_id = ?', [student_id], (err, draftResult) => {
                if (draftResult.length > 0) {
                    db.query('UPDATE build_semester SET selected_courses_json = ?, semester_id = ?, year_number = ?, status = "draft", updated_at = NOW() WHERE student_id = ?', [selected_courses_json, open_semester_id, dynamic_year_number, student_id], () => res.json({ success: true }));
                } else {
                    db.query('INSERT INTO build_semester (student_id, semester_id, year_number, selected_courses_json, status) VALUES (?, ?, ?, ?, "draft")', [student_id, open_semester_id, dynamic_year_number, selected_courses_json], () => res.json({ success: true }));
                }
            });
        });
    });
});

app.delete('/delete-plan/:user_id', (req, res) => {
    db.query('SELECT student_id FROM students WHERE user_id = ?', [req.params.user_id], (err, studentResult) => {
        if (err || studentResult.length === 0) return res.status(500).json({ error: "Student not found" });
        const student_id = studentResult[0].student_id;
        
        db.query('DELETE FROM build_semester WHERE student_id = ?', [student_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

function generateNextSemesterName(name) {
    if (name.toLowerCase().includes('summer')) {
        const yearMatch = name.match(/\d{4}/);
        if (yearMatch) return name.replace(yearMatch[0], (parseInt(yearMatch[0]) + 1).toString());
    } else {
        const yearsMatch = name.match(/(\d{4})-(\d{4})/);
        if (yearsMatch) return name.replace(`${yearsMatch[1]}-${yearsMatch[2]}`, `${parseInt(yearsMatch[1]) + 1}-${parseInt(yearsMatch[2]) + 1}`);
    }
    return name + " (Next)"; 
}

app.get('/admin/semester-board', (req, res) => {
    db.query('SELECT * FROM semesters ORDER BY semester_id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const first = results.find(s => s.rule_id === 1);
        const second = results.find(s => s.rule_id === 2);
        const summer = results.find(s => s.rule_id === 3);
        
        if (!first || !second || !summer) return res.status(400).json({ error: "Missing base semesters."});

        let buttons = [
            { type: 'First Semester', ...first, state: 'grey' },
            { type: 'Second Semester', ...second, state: 'grey' },
            { type: 'Summer Semester', ...summer, state: 'grey' }
        ];

        const openSem = results.find(s => s.is_registration_open === 1);

        if (openSem) {
            const isButtonOpen = buttons.some(b => b.semester_id === openSem.semester_id);
            if (isButtonOpen) {
                buttons = buttons.map(b => b.semester_id === openSem.semester_id ? { ...b, state: 'red' } : { ...b, state: 'grey' });
            } else {
                const oldOpenType = openSem.rule_id === 1 ? 'First Semester' : openSem.rule_id === 2 ? 'Second Semester' : 'Summer Semester';
                buttons = buttons.map(b => b.type === oldOpenType ? { type: oldOpenType, ...openSem, state: 'red' } : { ...b, state: 'grey' });
            }
        } else {
            let lowestIdBtn = buttons.reduce((min, b) => b.semester_id < min.semester_id ? b : min, buttons[0]);
            lowestIdBtn.state = 'green';
        }

        res.json(buttons);
    });
});

app.post('/admin/semester-action', (req, res) => {
    const { semester_id, action, semester_name, close_date } = req.body;
    
    if (action === 'open') {
        db.query('UPDATE semesters SET is_registration_open = 0', () => {
            db.query('UPDATE semesters SET is_registration_open = 1, registration_close_date = ? WHERE semester_id = ?', [close_date, semester_id], (err) => {
                if (err) return res.status(500).json({error: err.message});
                res.json({success: true});
            });
        });
    } else if (action === 'close') {
        db.query('UPDATE semesters SET is_registration_open = 0, is_completed = TRUE WHERE semester_id = ?', [semester_id], (err) => {
            if (err) return res.status(500).json({error: err.message});
            
            const nextName = generateNextSemesterName(semester_name);
            db.query('SELECT rule_id FROM semesters WHERE semester_id = ?', [semester_id], (err, rules) => {
                const rule_id = rules.length > 0 ? rules[0].rule_id : 1;
                db.query('INSERT INTO semesters (semester_name, rule_id, is_registration_open, registration_close_date, is_completed) VALUES (?, ?, FALSE, NULL, FALSE)', [nextName, rule_id], (err) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true});
                });
            });
        });
    }
});

app.get('/admin/plans', (req, res) => {
    db.query(`SELECT bs.build_id, bs.selected_courses_json, bs.status, bs.year_number, s.semester_name, u.first_name, u.last_name, u.username as email FROM build_semester bs JOIN students st ON bs.student_id = st.student_id JOIN users u ON st.user_id = u.user_id JOIN semesters s ON bs.semester_id = s.semester_id WHERE bs.status = 'draft'`, (err, results) => res.json(results));
});

app.put('/admin/plans/:id/approve', (req, res) => {
    db.query('SELECT student_id, selected_courses_json, year_number FROM build_semester WHERE build_id = ?', [req.params.id], (err, results) => {
        const plan = results[0];
        let courseIds;
        try { courseIds = typeof plan.selected_courses_json === 'string' ? JSON.parse(plan.selected_courses_json) : plan.selected_courses_json; } catch(e) { courseIds = []; }
        if (!courseIds || courseIds.length === 0) return res.status(400).json({ error: "No courses" });

        const values = courseIds.map(course_id => [plan.student_id, null, course_id, plan.year_number, 'undergoing']);
        db.query('INSERT INTO enrollments (student_id, section_id, course_id, year_number, status) VALUES ?', [values], () => {
            db.query('DELETE FROM build_semester WHERE build_id = ?', [req.params.id], () => res.json({ success: true }));
        });
    });
});

app.get('/:table', (req, res) => {
    const allowedTables = ['users', 'faculties', 'semester_rules', 'courses', 'departments', 'programs', 'prerequisites', 'semesters', 'students', 'program_requirements', 'sections', 'build_semester', 'enrollments'];
    if (!allowedTables.includes(req.params.table)) return res.status(403).send("Access Denied");
    db.query(`SELECT * FROM ${req.params.table}`, (err, results) => res.json(results));
});

app.get('/api/curriculum-graph', (req, res) => {
    db.query('SELECT * FROM courses', (err, courses) => {
        db.query('SELECT * FROM prerequisites', (err, prereqs) => res.json(buildCurriculumGraph(courses, prereqs)));
    });
});

app.get('/api/recommendations/:user_id', (req, res) => {
    const sqlStatus = `SELECT c.course_id, e.status FROM courses c JOIN program_requirements pr ON c.course_id = pr.course_id JOIN students s ON s.program_id = pr.program_id AND s.user_id = ? LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.student_id = s.student_id`;
    db.query(sqlStatus, [req.params.user_id], (err, statusResults) => {
        db.query('SELECT * FROM courses', (err, courses) => {
            db.query('SELECT * FROM prerequisites', (err, prereqs) => {
                const graph = buildCurriculumGraph(courses, prereqs);
                const takenIds = statusResults.filter(r => r.status === 'completed' || r.status === 'undergoing').map(r => r.course_id);
                const recommendations = Object.values(graph)
                    .filter(course => !takenIds.includes(course.id)) 
                    .filter(course => course.requires.every(reqId => takenIds.includes(reqId)))
                    .map(course => ({ ...course, priorityScore: course.weight }))
                    .sort((a, b) => b.priorityScore - a.priorityScore);
                res.json(recommendations);
            });
        });
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));