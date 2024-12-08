const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Connected to the database.');
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    process.exit(-1); // Exit the process to avoid undefined states
});


module.exports = pool;
