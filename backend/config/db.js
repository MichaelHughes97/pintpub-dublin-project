const mysql = require('mysql2');
require('dotenv').config();

// Create database connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Check if the connection is successful
db.connect((err) => {
  if (err) {
    console.log('Database connection failed:', err.message);
    return;
  }

  console.log('Connected to MySQL database');
});

module.exports = db;