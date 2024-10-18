const express = require('express');
const cors = require('cors');
const math = require('mathjs');

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'db',
  user: 'root',
  password: 'root',
  database: 'tutorial'
});

// ลอง query ข้อมูลจากตาราง users
app.get('/get-users', async (req, res) => {
  try {
    // Query ข้อมูลจากฐานข้อมูล
    const [results] = await db.query('SELECT * FROM users');
    console.log('Data from the database:', results);
    
    // ส่งข้อมูลไปให้ client
    res.send(results);
  } catch (err) {
    console.error('Error querying the database:', err.message);
    res.status(500).send('Error retrieving data from the database');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
});