const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Create a Connection Pool (The modern way)
const db = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'senior_project_2026',
    database: process.env.DB_NAME || 'eadvisor_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// 2. Simple test to ensure the pool can reach the DB
db.getConnection((err, connection) => {
    if (err) {
        console.error('⚠️ Database is still warming up. The pool will retry automatically...');
    } else {
        console.log('✅ Connected to MySQL Database via Pool');
        connection.release(); // Important: release the connection back to the pool!
    }
});

app.get('/', (req, res) => {
    res.send('🚀 E-Advisor Backend is Running!');
});

// 3. Updated Route using the Pool
app.get('/students', (req, res) => {
    const sqlQuery = 'SELECT * FROM students';
    
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Query Error:', err.message);
            return res.status(500).json({ error: "Database error. Try again in a moment." });
        }
        res.json(results);
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});