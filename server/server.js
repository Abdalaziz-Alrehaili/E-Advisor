const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { spawn } = require('child_process');
const crypto = require('crypto');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const { buildCurriculumGraph } = require('./graphUtils');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const db = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'senior_project_2026',
    database: process.env.DB_NAME || 'eadvisor_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

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

app.get('/api/supervisor/students/:user_id', (req, res) => {
    const supervisorUserId = req.params.user_id;

    const sql = `
        SELECT 
            st.student_id,
            u.user_id,
            u.first_name, 
            u.last_name, 
            st.admission_year,
            st.current_semester_index,
            p.total_credits_required,
            p.duration_years,
            IFNULL((SELECT SUM(c.credits) FROM enrollments e JOIN courses c ON e.course_id = c.course_id WHERE e.student_id = st.student_id AND e.status = 'completed'), 0) AS credits_completed,
            
            -- ✨ THE FIX: EXACT OFFICIAL PROGRAM PLAN MATH ✨
            IFNULL((
                SELECT SUM(c.credits)
                FROM program_requirements pr
                JOIN courses c ON pr.course_id = c.course_id
                WHERE pr.program_id = st.program_id
                AND (
                    ((pr.ideal_year - 1) * 3) + 
                    CASE pr.ideal_semester WHEN '1' THEN 1 WHEN '2' THEN 2 WHEN 'Summer' THEN 3 END
                ) <= IFNULL(st.current_semester_index, 1)
            ), 1) AS expected_credits,
            
            IFNULL((SELECT ROUND(AVG(
                CASE 
                    WHEN e.grade >= 95 THEN 5.0 
                    WHEN e.grade >= 90 THEN 4.75 
                    WHEN e.grade >= 85 THEN 4.5 
                    WHEN e.grade >= 80 THEN 4.0
                    WHEN e.grade >= 75 THEN 3.5 
                    WHEN e.grade >= 70 THEN 3.0 
                    WHEN e.grade >= 65 THEN 2.5 
                    WHEN e.grade >= 60 THEN 2.0 
                    ELSE 1.0 
                END
            ), 2) FROM enrollments e WHERE e.student_id = st.student_id AND e.status = 'completed' AND e.grade IS NOT NULL), 0.00) AS gpa,
            (SELECT COUNT(*) FROM messages m WHERE m.receiver_id = ? AND m.sender_id = u.user_id AND m.is_read = FALSE) AS unread_count
        FROM students st
        JOIN users u ON st.user_id = u.user_id
        JOIN programs p ON st.program_id = p.program_id
        JOIN professors prof ON st.supervisor_id = prof.professor_id
        WHERE prof.user_id = ? AND st.is_graduated = FALSE
    `;
    db.query(sql, [supervisorUserId, supervisorUserId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/student/:user_id/supervisor-info', (req, res) => {
    const studentUserId = req.params.user_id;
    const sql = `
        SELECT 
            sup.user_id AS supervisor_id,
            sup.first_name,
            sup.last_name,
            (SELECT COUNT(*) FROM messages m WHERE m.receiver_id = ? AND m.sender_id = sup.user_id AND m.is_read = FALSE) AS unread_count
        FROM students st
        JOIN professors prof ON st.supervisor_id = prof.professor_id
        JOIN users sup ON prof.user_id = sup.user_id
        WHERE st.user_id = ?
    `;
    db.query(sql, [studentUserId, studentUserId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results.length > 0 ? results[0] : null);
    });
});

app.post('/api/chat/mark-read', (req, res) => {
    const { sender_id, receiver_id } = req.body;
    const sql = `UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?`;
    db.query(sql, [sender_id, receiver_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/chat/history/:user1/:user2', (req, res) => {
    const { user1, user2 } = req.params;
    const sql = `
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY timestamp ASC
    `;
    db.query(sql, [user1, user2, user2, user1], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

io.on('connection', (socket) => {
    socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
    });

    socket.on('send_message', (data) => {
        const { sender_id, receiver_id, content } = data;
        const sql = `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`;
        db.query(sql, [sender_id, receiver_id, content], (err, result) => {
            if (err) return console.error("Error saving message:", err);

            const newMessage = {
                message_id: result.insertId,
                sender_id,
                receiver_id,
                content,
                timestamp: new Date().toISOString(),
                is_read: 0
            };

            io.to(`user_${receiver_id}`).emit('receive_message', newMessage);
            io.to(`user_${sender_id}`).emit('receive_message', newMessage);
        });
    });
});

app.get('/students', (req, res) => {
    const sql = `
        SELECT 
            s.student_id as id, 
            u.user_id, 
            u.first_name, 
            u.last_name, 
            u.username as email, 
            s.admission_year, 
            s.current_semester_index,
            IFNULL((SELECT SUM(c.credits) FROM enrollments e JOIN courses c ON e.course_id = c.course_id WHERE e.student_id = s.student_id AND e.status = 'completed'), 0) AS credits_completed,
            IFNULL((
                SELECT SUM(c.credits)
                FROM program_requirements pr
                JOIN courses c ON pr.course_id = c.course_id
                WHERE pr.program_id = s.program_id
                AND (
                    ((pr.ideal_year - 1) * 3) + 
                    CASE pr.ideal_semester WHEN '1' THEN 1 WHEN '2' THEN 2 WHEN 'Summer' THEN 3 END
                ) <= IFNULL(s.current_semester_index, 1)
            ), 1) AS expected_credits
        FROM students s 
        JOIN users u ON s.user_id = u.user_id
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/courses', (req, res) => {
    db.query('SELECT * FROM courses', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/sections', (req, res) => {
    const sql = `
        SELECT s.*, 
               CONCAT(u.first_name, ' ', u.last_name) AS professor_name,
               (SELECT COUNT(*) FROM enrollments e WHERE e.section_id = s.section_id AND e.status = 'undergoing') as official_count
        FROM sections s
        LEFT JOIN professors p ON s.professor_id = p.professor_id
        LEFT JOIN users u ON p.user_id = u.user_id
    `;
    db.query(sql, (err, sections) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query('SELECT selected_courses_json FROM build_semester WHERE status = "draft"', (err, drafts) => {
            if (err) return res.status(500).json({ error: err.message });

            let draftCounts = {};
            drafts.forEach(draft => {
                let courses = [];
                try { 
                    const parsed = typeof draft.selected_courses_json === 'string' ? JSON.parse(draft.selected_courses_json) : draft.selected_courses_json; 
                    courses = Array.isArray(parsed) ? parsed : (parsed.courses || []);
                } catch (e) { courses = []; }
                courses.forEach(c => {
                    if (c.selected_section_id) {
                        draftCounts[c.selected_section_id] = (draftCounts[c.selected_section_id] || 0) + 1;
                    }
                });
            });

            const finalSections = sections.map(sec => ({
                ...sec,
                enrolled_count: sec.official_count + (draftCounts[sec.section_id] || 0)
            }));
            res.json(finalSections);
        });
    });
});

app.get('/curriculum-status/:user_id', (req, res) => {
    const sql = `
        SELECT 
            IFNULL(real_c.course_id, c.course_id) AS course_id, 
            IFNULL(real_c.course_name, c.course_name) AS course_name, 
            IFNULL(real_c.course_prefix, c.course_prefix) AS course_prefix, 
            IFNULL(real_c.course_number, c.course_number) AS course_number, 
            IFNULL(real_c.credits, c.credits) AS credits, 
            e.status, 
            e.grade, 
            pr.ideal_year, 
            pr.ideal_semester,
            CASE WHEN e.placeholder_id IS NOT NULL THEN c.course_name ELSE NULL END AS historical_placeholder_name
        FROM program_requirements pr 
        JOIN courses c ON pr.course_id = c.course_id 
        JOIN students s ON s.program_id = pr.program_id AND s.user_id = ? 
        LEFT JOIN enrollments e ON (c.course_id = e.course_id OR c.course_id = e.placeholder_id) AND e.student_id = s.student_id 
        LEFT JOIN courses real_c ON e.course_id = real_c.course_id AND e.placeholder_id IS NOT NULL
        ORDER BY pr.ideal_year ASC, pr.ideal_semester ASC
    `;
    db.query(sql, [req.params.user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/semesters', (req, res) => {
    db.query('SELECT s.semester_id, s.semester_name, r.semester_type, r.max_credits, r.min_credits FROM semesters s JOIN semester_rules r ON s.rule_id = r.rule_id', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/my-grades/:user_id', (req, res) => {
    const sql = `
        SELECT 
            c.course_id, c.course_prefix, c.course_number, c.course_name, 
            e.grade, e.status, c.credits, e.year_number, 
            pr.ideal_semester, e.semester_id,
            sem.rule_id AS actual_rule_id
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.course_id 
        JOIN students s ON e.student_id = s.student_id 
        JOIN program_requirements pr ON (c.course_id = pr.course_id OR e.placeholder_id = pr.course_id) AND s.program_id = pr.program_id 
        LEFT JOIN semesters sem ON e.semester_id = sem.semester_id
        WHERE s.user_id = ? 
        ORDER BY e.year_number ASC, actual_rule_id ASC, pr.ideal_semester ASC
    `;
    db.query(sql, [req.params.user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/my-major/:user_id', (req, res) => {
    const sql = `SELECT p.program_name, p.total_credits_required FROM students s JOIN programs p ON s.program_id = p.program_id WHERE s.user_id = ?`;
    db.query(sql, [req.params.user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            res.json({ major: results[0].program_name, total_credits: results[0].total_credits_required });
        } else {
            res.json({ major: 'Unknown Major', total_credits: 140 });
        }
    });
});

app.get('/enrollment-details/:user_id/:semester_id', (req, res) => {
    const { user_id, semester_id } = req.params;
    const sql = `
        SELECT c.course_prefix, c.course_number, c.course_name, u.first_name, u.last_name, s.days, s.start_time, s.end_time, s.room_number
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        JOIN sections s ON e.section_id = s.section_id
        JOIN professors prof ON s.professor_id = prof.professor_id
        JOIN users u ON prof.user_id = u.user_id
        JOIN students st ON e.student_id = st.student_id
        WHERE st.user_id = ? AND e.semester_id = ?
    `;
    db.query(sql, [user_id, semester_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const mappedResults = results.map(row => ({
            ...row,
            professor_name: `${row.first_name} ${row.last_name}`
        }));
        res.json(mappedResults);
    });
});

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
                    let coursesArr = [];
                    try { 
                        const parsed = typeof draft.selected_courses_json === 'string' ? JSON.parse(draft.selected_courses_json) : draft.selected_courses_json; 
                        coursesArr = Array.isArray(parsed) ? parsed : (parsed.courses || []);
                    } catch (e) { coursesArr = []; }
                    if (!coursesArr || coursesArr.length === 0) return res.json({ ...draft, courses: [] });

                    const ids = coursesArr.map(c => c.course_id || c);
                    db.query(`SELECT course_id, course_prefix, course_number, course_name, credits FROM courses WHERE course_id IN (?)`, [ids], (err, dbCourses) => {
                        if (err) return res.status(500).json({ error: err.message });

                        const mergedCourses = coursesArr.map(savedCourse => {
                            const dbInfo = dbCourses.find(c => c.course_id === (savedCourse.course_id || savedCourse));
                            return { ...dbInfo, ...savedCourse };
                        });

                        res.json({ ...draft, courses: mergedCourses });
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
        const open_semester_name = semResult[0].semester_name;

        db.query('SELECT s.student_id, IFNULL(MAX(e.year_number), 0) as max_year FROM students s LEFT JOIN enrollments e ON s.student_id = e.student_id WHERE s.user_id = ? GROUP BY s.student_id', [user_id], (err, studentResult) => {
            if (err || studentResult.length === 0) return res.status(500).json({ error: "Student not found" });

            const student_id = studentResult[0].student_id;
            const max_year = studentResult[0].max_year > 10 ? 0 : studentResult[0].max_year;
            const isFirstSem = open_semester_name.toLowerCase().includes('first') || open_semester_name.includes('1');
            const dynamic_year_number = isFirstSem ? max_year + 1 : (max_year === 0 ? 1 : max_year);

            db.query('SELECT selected_courses_json FROM build_semester WHERE semester_id = ? AND student_id != ?', [open_semester_id, student_id], (err, drafts) => {
                if (err) return res.status(500).json({ error: err.message });

                let draftCounts = {};
                drafts.forEach(draft => {
                    let courses = [];
                    try { 
                        const parsed = typeof draft.selected_courses_json === 'string' ? JSON.parse(draft.selected_courses_json) : draft.selected_courses_json; 
                        courses = Array.isArray(parsed) ? parsed : (parsed.courses || []);
                    } catch (e) { courses = []; }
                    courses.forEach(c => {
                        if (c.selected_section_id) {
                            draftCounts[c.selected_section_id] = (draftCounts[c.selected_section_id] || 0) + 1;
                        }
                    });
                });

                const requestedSectionIds = selectedCourses.map(c => c.selected_section_id).filter(Boolean);
                if (requestedSectionIds.length === 0) return proceedToSave();

                db.query('SELECT section_id, max_capacity, section_name FROM sections WHERE section_id IN (?)', [requestedSectionIds], (err, sectionsInfo) => {
                    if (err) return res.status(500).json({ error: err.message });

                    for (let sec of sectionsInfo) {
                        const taken = draftCounts[sec.section_id] || 0;
                        if (taken >= sec.max_capacity) {
                            return res.json({ success: false, error: `Section ${sec.section_name} is full! (Limit: ${sec.max_capacity}). Please choose a different section or time.` });
                        }
                    }
                    proceedToSave();
                });

                function proceedToSave() {
                    const selected_courses_json = JSON.stringify(selectedCourses);
                    db.query('SELECT build_id FROM build_semester WHERE student_id = ?', [student_id], (err, draftResult) => {
                        if (draftResult.length > 0) {
                            db.query('UPDATE build_semester SET selected_courses_json = ?, semester_id = ?, year_number = ?, status = "draft", updated_at = NOW() WHERE student_id = ?', [selected_courses_json, open_semester_id, dynamic_year_number, student_id], (err) => {
                                if (err) return res.status(500).json({ error: err.message });
                                res.json({ success: true });
                            });
                        } else {
                            db.query('INSERT INTO build_semester (student_id, semester_id, year_number, selected_courses_json, status) VALUES (?, ?, ?, ?, "draft")', [student_id, open_semester_id, dynamic_year_number, selected_courses_json], (err) => {
                                if (err) return res.status(500).json({ error: err.message });
                                res.json({ success: true });
                            });
                        }
                    });
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

function generateNextSemesterName(currentName, nextRule) {
    const yearMatch = currentName.match(/\d{4}/g);
    if (!yearMatch) return currentName + " (Next)";
    
    if (nextRule === 1) { 
        const startYear = parseInt(yearMatch[yearMatch.length - 1]);
        return `First Semester ${startYear}-${startYear + 1}`;
    } else if (nextRule === 2) {
        return currentName.replace("First", "Second");
    } else if (nextRule === 3) {
        const endYear = parseInt(yearMatch[1] || yearMatch[0]);
        return `Summer Semester ${endYear}`;
    }
    return currentName + " (Next)";
}

app.get('/admin/semester-board', (req, res) => {
    db.query(`SELECT s1.* FROM semesters s1 JOIN (SELECT rule_id, MAX(semester_id) as max_id FROM semesters GROUP BY rule_id) s2 ON s1.semester_id = s2.max_id ORDER BY s1.rule_id ASC`, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        let buttons = results.map(s => {
            let type = s.rule_id === 1 ? 'First Semester' : s.rule_id === 2 ? 'Second Semester' : 'Summer Semester';
            return { type, ...s, state: 'grey' };
        });

        const openSem = buttons.find(b => b.is_registration_open === 1);
        let activeSem = null;

        if (openSem) {
            buttons = buttons.map(b => b.semester_id === openSem.semester_id ? { ...b, state: 'red' } : { ...b, state: 'grey' });
            activeSem = openSem;
        } else {
            const unopened = buttons.filter(b => b.registration_close_date === null);
            if (unopened.length > 0) {
                let nextBtn = unopened.reduce((min, b) => b.semester_id < min.semester_id ? b : min, unopened[0]);
                const btnIndex = buttons.findIndex(b => b.semester_id === nextBtn.semester_id);
                if(btnIndex !== -1) {
                    buttons[btnIndex].state = 'green';
                    activeSem = buttons[btnIndex];
                }
            }
        }

        // ✨ UI FIX: "Time Travel Math" to dynamically project future names onto Grey buttons ✨
        if (activeSem) {
            const match = activeSem.semester_name.match(/\d{4}/);
            let baseYear = match ? parseInt(match[0]) : new Date().getFullYear();
            
            // If Summer is active, its extracted year is the end of the academic cycle, so pull it back by 1
            if (activeSem.rule_id === 3) baseYear -= 1; 

            buttons.forEach(btn => {
                if (btn.state === 'grey') {
                    let targetBaseYear = baseYear;
                    
                    // If the grey button's rule is lower than the active one, it belongs to NEXT year!
                    if (btn.rule_id < activeSem.rule_id) {
                        targetBaseYear += 1; 
                    }

                    // Assign the beautiful, future-proofed names
                    if (btn.rule_id === 1) btn.semester_name = `First Semester ${targetBaseYear}-${targetBaseYear + 1}`;
                    else if (btn.rule_id === 2) btn.semester_name = `Second Semester ${targetBaseYear}-${targetBaseYear + 1}`;
                    else if (btn.rule_id === 3) btn.semester_name = `Summer Semester ${targetBaseYear + 1}`;
                }
            });
        }

        res.json(buttons);
    });
});

app.post('/admin/semester-action', (req, res) => {
    const { semester_id, action, semester_name, close_date } = req.body;
    
    const generateSections = (semId, callback) => {
        // ✨ WIPE UNUSED GHOST SECTIONS EVERY TIME WE OPEN ✨
        db.query('DELETE FROM sections WHERE semester_id = ? AND section_id NOT IN (SELECT section_id FROM enrollments WHERE semester_id = ? AND section_id IS NOT NULL)', [semId, semId], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            db.query('SELECT course_id FROM courses WHERE course_prefix NOT IN ("ELEC", "FREE")', (err, courses) => {
                if (err) return res.status(500).json({ error: err.message });

                const timeSlots = [
                    { days: 'Sun-Tue-Thu', start: '08:00:00', end: '08:50:00' },
                    { days: 'Sun-Tue-Thu', start: '09:00:00', end: '09:50:00' },
                    { days: 'Sun-Tue-Thu', start: '10:00:00', end: '10:50:00' },
                    { days: 'Sun-Tue-Thu', start: '11:00:00', end: '11:50:00' },
                    { days: 'Sun-Tue-Thu', start: '13:00:00', end: '13:50:00' },
                    { days: 'Sun-Tue-Thu', start: '14:00:00', end: '14:50:00' },
                    { days: 'Mon-Wed', start: '08:00:00', end: '09:15:00' },
                    { days: 'Mon-Wed', start: '09:30:00', end: '10:45:00' },
                    { days: 'Mon-Wed', start: '13:00:00', end: '14:15:00' },
                    { days: 'Mon-Wed', start: '14:30:00', end: '15:45:00' }
                ];

                let inserts = [];
                courses.forEach(course => {
                    const rand = Math.random();
                    let numSections = 2;
                    if (rand < 0.20) numSections = 1;
                    else if (rand > 0.80) numSections = 3;

                    for (let i = 1; i <= numSections; i++) {
                        const secName = `S${i}`;
                        const profId = Math.floor(Math.random() * 10) + 1; 
                        const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
                        const roomNum = `Bldg ${Math.floor(Math.random() * 5) + 1}-R${Math.floor(Math.random() * 400) + 100}`;

                        inserts.push([course.course_id, semId, secName, profId, slot.days, slot.start, slot.end, roomNum, 30]);
                    }
                });

                if (inserts.length > 0) {
                    const insertSql = `INSERT INTO sections (course_id, semester_id, section_name, professor_id, days, start_time, end_time, room_number, max_capacity) VALUES ?`;
                    db.query(insertSql, [inserts], callback);
                } else {
                    callback();
                }
            });
        });
    };

    if (action === 'open') {
        db.query('UPDATE semesters SET is_registration_open = 0', () => {
            db.query('UPDATE semesters SET is_registration_open = 1, registration_close_date = ? WHERE semester_id = ?', [close_date, semester_id], (err) => {
                if (err) return res.status(500).json({error: err.message});
                
                generateSections(semester_id, (genErr) => {
                    if (genErr) return res.status(500).json({error: genErr.message});
                    res.json({success: true});
                });
            });
        });
    } else if (action === 'close') {
        db.query('SELECT student_id, selected_courses_json, year_number FROM build_semester WHERE semester_id = ?', [semester_id], (err, plans) => {
            if (err) return res.status(500).json({error: err.message});

            let enrollmentsData = [];
            plans.forEach(plan => {
                let courses = [];
                try { 
                    const parsed = typeof plan.selected_courses_json === 'string' ? JSON.parse(plan.selected_courses_json) : plan.selected_courses_json;
                    courses = Array.isArray(parsed) ? parsed : (parsed.courses || []);
                } catch(e) {}
                courses.forEach(c => {
                    enrollmentsData.push([plan.student_id, c.selected_section_id || null, c.course_id, semester_id, plan.year_number, 'undergoing', c.placeholder_id || null]);
                });
            });

            const finalizeClose = () => {
                db.query('DELETE FROM build_semester WHERE semester_id = ?', [semester_id], () => {
                    // ✨ ONLY CLOSE REGISTRATION. Do NOT complete the semester yet! ✨
                    db.query('UPDATE semesters SET is_registration_open = 0 WHERE semester_id = ?', [semester_id], (err) => {
                        if (err) return res.status(500).json({error: err.message});
                        
                        // ✨ CREATE THE NEXT YEAR'S EQUIVALENT SEMESTER ✨
                        db.query('SELECT rule_id FROM semesters WHERE semester_id = ?', [semester_id], (err, rules) => {
                            const currentRule = rules.length > 0 ? rules[0].rule_id : 1;
                            const nextRule = (currentRule % 3) + 1; 
                            
                            const nextName = generateNextSemesterName(semester_name, nextRule);
                            db.query('INSERT INTO semesters (semester_name, rule_id, is_registration_open, registration_close_date, is_completed) VALUES (?, ?, FALSE, NULL, FALSE)', [nextName, nextRule], (err) => {
                                if (err) return res.status(500).json({error: err.message});
                                res.json({success: true});
                            });
                        });
                    });
                });
            };

            if (enrollmentsData.length > 0) {
                db.query('INSERT INTO enrollments (student_id, section_id, course_id, semester_id, year_number, status, placeholder_id) VALUES ?', [enrollmentsData], (err) => {
                    if (err) return res.status(500).json({error: err.message});
                    finalizeClose();
                });
            } else {
                finalizeClose();
            }
        });
    }
});

app.post('/admin/finalize-grades', (req, res) => {
    db.query("SELECT enrollment_id FROM enrollments WHERE status = 'undergoing'", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length === 0) return advanceSemester();

        let completed = 0;
        let hasError = false;

        results.forEach(row => {
            const randomGrade = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
            
            db.query("UPDATE enrollments SET status = 'completed', grade = ? WHERE enrollment_id = ?", [randomGrade, row.enrollment_id], (err) => {
                if (err && !hasError) {
                    hasError = true;
                    return res.status(500).json({ error: err.message });
                }
                completed++;
                if (completed === results.length && !hasError) {
                    advanceSemester();
                }
            });
        });
    });

    function advanceSemester() {
        db.query('SELECT semester_id FROM semesters WHERE is_completed = FALSE AND registration_close_date IS NOT NULL ORDER BY semester_id ASC LIMIT 1', (err, semResult) => {
            if (err || semResult.length === 0) return res.json({ success: true, message: "Grades published!" });
            
            const currentSemId = semResult[0].semester_id;

            db.query('UPDATE semesters SET is_completed = TRUE WHERE semester_id = ?', [currentSemId], () => {
                db.query('UPDATE students SET current_semester_index = current_semester_index + 1 WHERE is_graduated = FALSE', () => {
                    res.json({ success: true, message: "Grades published and semester completed!" });
                });
            });
        });
    }
});

app.post('/admin/sections', (req, res) => {
    const { course_id, section_name, professor_name, days, start_time, end_time, room_number, max_capacity } = req.body;

    if (!course_id || !section_name || !days || !start_time || !end_time || !room_number || !max_capacity) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sqlSem = `SELECT semester_id FROM semesters WHERE is_completed = 0 ORDER BY is_registration_open DESC, (registration_close_date IS NOT NULL) DESC, CASE WHEN registration_close_date IS NOT NULL THEN semester_id END DESC, semester_id ASC LIMIT 1`;

    db.query(sqlSem, (err, semResult) => {
        if (err) return res.status(500).json({ error: err.message });
        if (semResult.length === 0) return res.status(400).json({ error: "No active semester available." });

        const semester_id = semResult[0].semester_id;

        const profMap = {
            'Dr. Ahmad Mansour': 1, 'Dr. Khaled Al-Sayed': 2, 'Prof. Mustafa Osman': 3,
            'Dr. Ibrahim Hassan': 4, 'Dr. Omar Bakri': 5, 'Dr. Sami Al-Qahtani': 6,
            'Dr. Yahya Jameel': 7, 'Prof. Nasser Idris': 8, 'Dr. Suleiman Taha': 9, 'Dr. Waleed Saeed': 10
        };
        const professor_id = profMap[professor_name] || 1;

        const sql = `
            INSERT INTO sections (course_id, semester_id, section_name, professor_id, days, start_time, end_time, room_number, max_capacity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [course_id, semester_id, section_name, professor_id, days, start_time, end_time, room_number, max_capacity], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, section_id: result.insertId });
        });
    });
});

app.get('/admin/sections', (req, res) => {
    // ✨ Target the currently actionable semester (Open OR Most recently closed before finalize) ✨
    const sqlSem = `
        SELECT semester_id FROM semesters 
        WHERE is_completed = 0 
        ORDER BY is_registration_open DESC, (registration_close_date IS NOT NULL) DESC, CASE WHEN registration_close_date IS NOT NULL THEN semester_id END DESC, semester_id ASC 
        LIMIT 1
    `;

    db.query(sqlSem, (err, semResult) => {
        if (err) return res.status(500).json({ error: err.message });
        if (semResult.length === 0) return res.json([]);

        const targetSemesterId = semResult[0].semester_id;

        const sql = `
            SELECT 
                s.section_id, 
                c.course_prefix, 
                c.course_number, 
                c.course_name, 
                s.section_name, 
                s.max_capacity,
                (SELECT COUNT(*) FROM enrollments e WHERE e.section_id = s.section_id AND e.status = 'undergoing') as enrolled_count
            FROM sections s
            JOIN courses c ON s.course_id = c.course_id
            WHERE s.semester_id = ?
            ORDER BY c.course_prefix, c.course_number, s.section_name
        `;

        db.query(sql, [targetSemesterId], (err, sections) => {
            if (err) return res.status(500).json({ error: err.message });

            db.query('SELECT selected_courses_json FROM build_semester WHERE semester_id = ?', [targetSemesterId], (err, drafts) => {
                if (err) return res.status(500).json({ error: err.message });

                let draftCounts = {};
                drafts.forEach(draft => {
                    let courses = [];
                    try { 
                        const parsed = typeof draft.selected_courses_json === 'string' ? JSON.parse(draft.selected_courses_json) : draft.selected_courses_json; 
                        courses = Array.isArray(parsed) ? parsed : (parsed.courses || []);
                    } catch (e) { courses = []; }
                    courses.forEach(c => {
                        if (c.selected_section_id) {
                            draftCounts[c.selected_section_id] = (draftCounts[c.selected_section_id] || 0) + 1;
                        }
                    });
                });

                const finalSections = sections.map(sec => {
                    const drafted = draftCounts[sec.section_id] || 0;
                    return {
                        ...sec,
                        enrolled_count: sec.enrolled_count + drafted
                    };
                });

                res.json(finalSections);
            });
        });
    });
});

app.put('/admin/sections/:id/capacity', (req, res) => {
    const { id } = req.params;
    const { max_capacity } = req.body;

    if (!max_capacity || isNaN(max_capacity)) {
        return res.status(400).json({ error: "Invalid capacity provided" });
    }

    db.query('UPDATE sections SET max_capacity = ? WHERE section_id = ?', [parseInt(max_capacity), id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/admin/sections/:id', (req, res) => {
    db.query('DELETE FROM sections WHERE section_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/admin/plans', (req, res) => {
    db.query(`SELECT bs.build_id, bs.selected_courses_json, bs.status, bs.year_number, s.semester_name, u.first_name, u.last_name, u.username as email FROM build_semester bs JOIN students st ON bs.student_id = st.student_id JOIN users u ON st.user_id = u.user_id JOIN semesters s ON bs.semester_id = s.semester_id WHERE bs.status = 'draft'`, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ==========================================
// ADVISING REQUESTS & ML ENGINE
// ==========================================
app.post('/api/advising-request', (req, res) => {
    const { student_user_id, supervisor_user_id, topic, problem, explanation } = req.body;

    if (!student_user_id || !supervisor_user_id || !topic || !problem || !explanation) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const sql = `
        INSERT INTO advising_requests (student_user_id, supervisor_user_id, topic, problem, explanation)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [student_user_id, supervisor_user_id, topic, problem, explanation], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to submit request.", details: err.message });
        }
        res.json({ success: true, message: "Form submitted successfully!" });
    });
});

app.get('/api/advising-request/:supervisor_id', (req, res) => {
    const supervisorId = req.params.supervisor_id;
    const sql = `
        SELECT r.*, u.first_name, u.last_name 
        FROM advising_requests r
        JOIN users u ON r.student_user_id = u.user_id
        WHERE r.supervisor_user_id = ?
        ORDER BY r.created_at DESC
    `;
    
    db.query(sql, [supervisorId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/admin/advising-requests', (req, res) => {
    const sql = `
        SELECT r.*, st.first_name AS student_first, st.last_name AS student_last, 
               sup.first_name AS sup_first, sup.last_name AS sup_last
        FROM advising_requests r
        JOIN users st ON r.student_user_id = st.user_id
        JOIN users sup ON r.supervisor_user_id = sup.user_id
        WHERE r.status = 'Forwarded to Admin'
        ORDER BY r.created_at ASC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/student/advising-requests/:student_id', (req, res) => {
    const studentId = req.params.student_id;
    const sql = `
        SELECT r.*, sup.first_name AS sup_first, sup.last_name AS sup_last
        FROM advising_requests r
        JOIN users sup ON r.supervisor_user_id = sup.user_id
        WHERE r.student_user_id = ?
        ORDER BY r.created_at DESC
    `;
    db.query(sql, [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.put('/api/advising-request/:request_id/status', (req, res) => {
    const { request_id } = req.params;
    const { status, admin_response } = req.body; 

    const sql = `UPDATE advising_requests SET status = ?, admin_response = ? WHERE request_id = ?`;
    
    db.query(sql, [status, admin_response || null, request_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to update status." });
        res.json({ success: true, message: `Request updated to ${status}` });
    });
});

app.get('/prerequisites', (req, res) => {
    db.query('SELECT * FROM prerequisites', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/curriculum-graph', (req, res) => {
    db.query('SELECT * FROM courses', (err, courses) => {
        db.query('SELECT * FROM prerequisites', (err, prereqs) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(buildCurriculumGraph(courses, prereqs));
        });
    });
});

app.get('/api/recommendations/:user_id', (req, res) => {
    const sqlStatus = `SELECT c.course_id, e.status FROM courses c JOIN program_requirements pr ON c.course_id = pr.course_id JOIN students s ON s.program_id = pr.program_id AND s.user_id = ? LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.student_id = s.student_id`;
    db.query(sqlStatus, [req.params.user_id], (err, statusResults) => {
        if (err) return res.status(500).json({ error: err.message });
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

// ==========================================
// LIVE COURSE AVERAGES ENGINE
// ==========================================
app.get('/api/course-stats', (req, res) => {
    const sql = `
        SELECT 
            c.course_id,
            c.course_prefix,
            c.course_number,
            c.course_name,
            IFNULL(ROUND(AVG(e.grade), 2), 85.00) AS live_course_average
        FROM courses c
        LEFT JOIN enrollments e 
            ON c.course_id = e.course_id 
            AND e.status = 'completed' 
            AND e.grade IS NOT NULL
        GROUP BY c.course_id
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/ml/extract-training-data', (req, res) => {
    const sql = `
        SELECT 
            e.enrollment_id,
            e.course_id,
            c.credits AS course_credits,
            e.grade AS actual_grade,
            
            CASE WHEN sr.semester_type = 'Summer' THEN 1 ELSE 0 END AS is_summer,
            
            IFNULL((
                SELECT ROUND(AVG(grade), 2) FROM enrollments 
                WHERE course_id = e.course_id AND status = 'completed' AND grade IS NOT NULL
            ), 85.00) AS course_historical_average,
            
            IFNULL((
                SELECT ROUND(AVG(e_prof.grade), 2) 
                FROM enrollments e_prof 
                JOIN sections s_prof ON e_prof.section_id = s_prof.section_id 
                WHERE s_prof.professor_id = s.professor_id 
                  AND e_prof.status = 'completed' AND e_prof.grade IS NOT NULL
            ), 85.00) AS prof_historical_average,
            
            IFNULL((
                SELECT ROUND(AVG(e_spec.grade), 2) 
                FROM enrollments e_spec 
                JOIN sections s_spec ON e_spec.section_id = s_spec.section_id 
                WHERE s_spec.professor_id = s.professor_id 
                  AND e_spec.course_id = e.course_id 
                  AND e_spec.status = 'completed' AND e_spec.grade IS NOT NULL
            ), 85.00) AS prof_course_specific_average,
            
            IFNULL((
                SELECT SUM(c2.credits) FROM enrollments e2 
                JOIN courses c2 ON e2.course_id = c2.course_id 
                WHERE e2.student_id = e.student_id 
                  AND e2.status = 'completed' AND e2.semester_id < e.semester_id
            ), 0) AS credits_completed_before,
            
            IFNULL((
                SELECT ROUND(AVG(
                    CASE 
                        WHEN grade >= 95 THEN 5.0 WHEN grade >= 90 THEN 4.75 
                        WHEN grade >= 85 THEN 4.5 WHEN grade >= 80 THEN 4.0
                        WHEN grade >= 75 THEN 3.5 WHEN grade >= 70 THEN 3.0 
                        WHEN grade >= 65 THEN 2.5 WHEN grade >= 60 THEN 2.0 
                        ELSE 1.0 
                    END
                ), 2) 
                FROM enrollments e3 
                WHERE e3.student_id = e.student_id AND e3.status = 'completed' 
                  AND e3.semester_id < e.semester_id AND e3.grade IS NOT NULL
            ), 0.00) AS cumulative_gpa_before,
            
            IFNULL((
                SELECT SUM(c4.credits) FROM enrollments e4 
                JOIN courses c4 ON e4.course_id = c4.course_id 
                WHERE e4.student_id = e.student_id AND e4.semester_id = e.semester_id
            ), c.credits) AS attempted_semester_credits,
            
            IFNULL((
                SELECT ROUND(AVG(hist_grades.c_avg), 2)
                FROM enrollments e_sched
                JOIN (
                    SELECT course_id, AVG(grade) AS c_avg 
                    FROM enrollments 
                    WHERE status = 'completed' AND grade IS NOT NULL 
                    GROUP BY course_id
                ) hist_grades ON e_sched.course_id = hist_grades.course_id
                WHERE e_sched.student_id = e.student_id AND e_sched.semester_id = e.semester_id
            ), 85.00) AS current_schedule_difficulty
            
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        JOIN semesters sem ON e.semester_id = sem.semester_id
        JOIN semester_rules sr ON sem.rule_id = sr.rule_id
        LEFT JOIN sections s ON e.section_id = s.section_id
        WHERE e.status = 'completed' AND e.grade IS NOT NULL;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("ML Extraction Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.post('/api/predict', (req, res) => {
    const studentData = req.body;

    const pythonProcess = spawn('python3', ['predict.py', JSON.stringify(studentData)]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python ML Error: ${errorOutput}`);
            return res.status(500).json({ error: 'Prediction engine failed', details: errorOutput });
        }
        try {
            const prediction = JSON.parse(result);
            res.json(prediction);
        } catch (e) {
            console.error("Failed to parse Python output:", result);
            res.status(500).json({ error: 'Invalid response from AI model' });
        }
    });
});

// IMPORTANT: This wildcard route MUST stay at the very bottom!
app.get('/:table', (req, res) => {
    const allowedTables = ['users', 'faculties', 'semester_rules', 'courses', 'departments', 'programs', 'prerequisites', 'semesters', 'students', 'program_requirements', 'sections', 'build_semester', 'enrollments', 'messages', 'professors'];
    if (!allowedTables.includes(req.params.table)) return res.status(403).send("Access Denied");
    db.query(`SELECT * FROM ${req.params.table}`, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));