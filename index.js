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

//linear algebraic equation
app.post('/jacobi', (req, res) => {
  const { arrayA, rows, cols, arrayB, initialGuess, maxIterations, tolerance } = req.body;

  if (!Array.isArray(arrayA) || !Array.isArray(arrayB) || typeof rows !== 'number' || typeof cols !== 'number') {
    return res.status(400).send({ message: 'Invalid input format' });
  }

  if (arrayA.length !== rows * cols || arrayB.length !== rows || initialGuess.length !== rows) {
    return res.status(400).send({ message: 'Array size does not match matrix dimensions' });
  }

  const matrixA = [];
  for (let i = 0; i < rows; i++) {
    matrixA.push(arrayA.slice(i * cols, (i + 1) * cols));
  }

  const matrixB = arrayB.slice();
  let x = initialGuess.slice();

  let iteration = 0;
  let error = tolerance + 1;

  while (iteration < maxIterations && error > tolerance) {
    const xNew = x.slice();

    for (let i = 0; i < rows; i++) {
      let sum = 0;
      for (let j = 0; j < cols; j++) {
        if (j !== i) {
          sum += matrixA[i][j] * x[j];
        }
      }
      xNew[i] = (matrixB[i] - sum) / matrixA[i][i];
    }

    error = Math.max(...xNew.map((value, index) => Math.abs(value - x[index])));
    x = xNew;
    iteration++;
  }

  let result = {
    "text": "Jacobi method",
    "x": x,
    "error": error,
    "iterations": iteration
  };

  res.send(result);
});

app.post('/gauss-seidel', (req, res) => {
  const { arrayA, rows, cols, arrayB, initialGuess, maxIterations, tolerance } = req.body;

  if (!Array.isArray(arrayA) || !Array.isArray(arrayB) || typeof rows !== 'number' || typeof cols !== 'number') {
    return res.status(400).send({ message: 'Invalid input format' });
  }

  if (arrayA.length !== rows * cols || arrayB.length !== rows || initialGuess.length !== rows) {
    return res.status(400).send({ message: 'Array size does not match matrix dimensions' });
  }

  const matrixA = [];
  for (let i = 0; i < rows; i++) {
    matrixA.push(arrayA.slice(i * cols, (i + 1) * cols));
  }

  const matrixB = arrayB.slice();
  let x = initialGuess.slice();

  let iteration = 0;
  let error = tolerance + 1;

  while (iteration < maxIterations && error > tolerance) {
    const xNew = x.slice();

    for (let i = 0; i < rows; i++) {
      let sum = 0;
      for (let j = 0; j < cols; j++) {
        if (j !== i) {
          sum += matrixA[i][j] * xNew[j];
        }
      }
      xNew[i] = (matrixB[i] - sum) / matrixA[i][i];
    }

    error = Math.max(...xNew.map((value, index) => Math.abs(value - x[index])));
    x = xNew;
    iteration++;
  }

  let result = {
    "text": "Gauss-Seidel method",
    "x": x,
    "error": error,
    "iterations": iteration
  };

  res.send(result);
});

app.post('/conjugate-gradient', (req, res) => {
  const { arrayA, rows, cols, arrayB, initialGuess, maxIterations, tolerance } = req.body;

  if (!Array.isArray(arrayA) || !Array.isArray(arrayB) || typeof rows !== 'number' || typeof cols !== 'number') {
    return res.status(400).send({ message: 'Invalid input format' });
  }

  if (arrayA.length !== rows * cols || arrayB.length !== rows || initialGuess.length !== rows) {
    return res.status(400).send({ message: 'Array size does not match matrix dimensions' });
  }

  const matrixA = [];
  for (let i = 0; i < rows; i++) {
    matrixA.push(arrayA.slice(i * cols, (i + 1) * cols));
  }

  const matrixB = arrayB.slice();
  let x = initialGuess.slice();

  let r = matrixB.slice();
  let p = r.slice();

  let iteration = 0;
  let error = tolerance + 1;

  while (iteration < maxIterations && error > tolerance) {
    const alpha = math.dot(r, r) / math.dot(p, math.multiply(matrixA, p));

    const xNew = math.add(x, math.multiply(alpha, p));
    const rNew = math.subtract(r, math.multiply(alpha, math.multiply(matrixA, p)));

    const beta = math.dot(rNew, rNew) / math.dot(r, r);
    const pNew = math.add(rNew, math.multiply(beta, p));

    error = math.norm(rNew);
    x = xNew;
    r = rNew;
    p = pNew;
    iteration++;
  }

  let result = {
    "text": "Conjugate gradient method",
    "x": x,
    "error": error,
    "iterations": iteration
  };

  res.send(result);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
});