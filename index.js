const express = require('express')
const cors = require('cors')
const math = require('mathjs');

const app = express()
const port = 8000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors())

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

//Root equation
app.post('/graphical', (req, res) => {
  //graphical method
  // res.send('Graphical method');

  // const { xstart, fx, xend } = req.body;
  // let xstart = (req && req.body && req.body.xstart) || 0;
  // let xend = (req && req.body && req.body.xstart) || 0;
  // let fx = (req && req.body && req.body.xstart) || 0;
  let epsilon = 0.0001; //input
  let xstart = 0; //input
  let xend = 10;//input
  let y0 = 0; 
  let y1 = 0;
  let y2 = 0;
  let x1 = 43; //input
  let x2 = -180;//input
  let found = false;
  let lower, upper;

  let result = {
    "text": "Graphical method",
    "iterationFound1": null,
    "iteration": [],
    "answer_y": [],
    "answer_x": null
  };

  for(let i = xstart; i <= xend; i ++){
    y0 = x1 * i + 1 * (x2);
    y1 = x1 * (i + 1) + 1 * (x2);
    
    if(y0 * y1 < 0){
      result.iterationFound1 = i; //iteration ที่เจอฟังก์ชั่นลด
      found = true;
      lower = i;
      upper = i+1;
      break;
    }
  }

  if(found){
    let step = 0.000001; //input

    for(let j = lower; j <= upper; j += step){
      y2 = x1 * (j+step) + 1*x2;

      result.iteration.push(j);
      result.answer_y.push(y2); //คำตอบแสกนละเอียด

      if(Math.abs(y2) < epsilon){
        result.answer_x = j; //iteration ที่เจอคำตอบ
        
        res.send(result);
        break;
      }
    }

    res.send('No root found with this position');
  }else{
    res.send('No root found in this range');
  }
})

app.post('/bisecton-falseposition', (req, res) => {
  let mode = req.body.mode;
  let epsilon = 0.0001; //input
  let error = 0;
  let ex = 4; //input
  let num = 13; //input
  let xL = 1.5; //input
  let xR = 2; //input
  
  switch (mode) {
    case "Bisection":
      let i = 1; //count iteration for bisection
      let xM = 0;
      let xm_new = 0;
      let result = {
        "text": "Bisection method",
        "iteration": [],
        "xM": [],
        "error": [],
        "answer_xM": null,
        "i_found": null
      };

      do{
        xM = (xL + xR) / 2;
        let fxm = Math.pow(xM, ex) - num;
        let fxr = Math.pow(xR, ex) - num;

        if(fxm * fxr < 0){
          xL = xM;
        }else if(fxm * fxr > 0){
          xR = xM;
        }
        error = Math.abs(xm_new - xM);
        xm_new = xM;

        result.iteration.push(i);
        result.xM.push(xM);
        result.error.push(error);
        
        i++;
      }while(error > epsilon);
      result.i_found = i;
      result.answer_xM = xM; //found answer

      res.send(result);
      break;

    case "False-position":
      let j = 1; //count iteration for false-position
      let x1 = 0;
      let x1_new = 0;
      let result2 = {
        "text": "False-position method",
        "iteration2": [],
        "x1": [],
        "error2": [],
        "answer_x1": null,
        "j_found": null
      };

      do{
        let fxl2 = Math.pow(xL, ex) - num;
        let fxr2 = Math.pow(xR, ex) - num;
        x1 = ((xL*fxr2) - (xR*fxl2)) / (fxr2 - fxl2);
        let fx1 = Math.pow(x1, ex) - num;

        if(fx1 * fxr2 < 0){
          xL = x1;
        }else if(fx1 * fxr2 > 0){
          xR = x1;
        }
        error = Math.abs(x1_new - x1);
        x1_new = x1;

        result2.iteration2.push(j);
        result2.x1.push(x1);
        result2.error2.push(error); 
        
        j++;
      }while(error > epsilon);
      result2.j_found = j;
      result2.answer_x1 = x1; //found answer

      res.send(result2);
      break;

      default: res.send('please select method'); break;
  }
})

app.post('/onepoint', (req, res) => {
  let y = 0;
  let error = 0;
  let num = 7; //input
  let ex = 2; //input
  let epsilon = 0.0001; //input
  let x = 1; //input
  let i = 1; //count iteration
  let result = {
    "text": "One-point itertation method",
    "iteration": [],
    "y": [],
    "answer_x": null,
    "error": []
  };

  do{
    y = (1/ex) * ((num/x) + x);
    error = Math.abs(y - x);
    x = y;
    
    result.y.push(y);
    result.iteration.push(i);
    result.error.push(error);

    i++;
  }while(error > epsilon);

  result.answer_x = y;
  res.send(result);
});

app.post('/newton-raphson', (req, res) => {
  let x0 = 1; //input
  let error = 0;
  let fx = 0;
  let fxdiff = 0;
  let y = 0;
  let num = 7; //input
  let ex = 2; //input
  let epsilon = 0.0001; //input
  let i = 1; //count iteration
  let result = {
    "text": "Newton-raphson method",
    "iteration": [],
    "y": [],
    "answer_x": null,
    "error": []
  };

  do{
    fx = Math.pow(x0, ex) - num;
    fxdiff = 2 * x0;
    y = x0 - (fx / fxdiff);
    error = Math.abs(y - x0);
    x0 = y;

    result.y.push(y);
    result.iteration.push(i);
    result.error.push(error);

    i++;
  }while(error > epsilon);

  result.answer_x = y;
  res.send(result);
});

app.post('/secant', (req, res) => {
  let x0 = 2; //input
  let x1 = 3; //input
  let error = 0;
  let fx0 = 0;
  let fx1 = 0;
  let x2 = 0;
  let num = 7; //input
  let ex = 2; //input
  let epsilon = 0.0001; //input
  let i = 1; //count iteration
  let result = {
    "text": "Secant method",
    "iteration": [],
    "y": [],
    "answer_x": null,
    "error": []
  };

  do{
    fx0 = Math.pow(x0, ex) - num;
    fx1 = Math.pow(x1, ex) - num;
    x2 = x1 - ((fx1 * (x1 - x0)) / (fx1 - fx0));
    error = Math.abs(x2 - x1);
    x0 = x1;
    x1 = x2;

    result.iteration.push(i);
    result.y.push(x2);
    result.error.push(error);

    i++;
  }while(error > epsilon);

  result.answer_x = x2;
  res.send(result);
});

//linear algebraic equation
app.post('/cramer', (req, res) => {
  const { arrayA, rows, cols, arrayB } = req.body; // รับ arrayA, arrayB และขนาดเมทริกซ์

  // ตรวจสอบว่า arrayA และ arrayB มีรูปแบบข้อมูลถูกต้องหรือไม่
  if (!Array.isArray(arrayA) || !Array.isArray(arrayB) || typeof rows !== 'number' || typeof cols !== 'number') {
    return res.status(400).send({ message: 'Invalid input format' });
  }

  // ตรวจสอบว่า arrayA มีขนาดตรงกับจำนวนแถว * จำนวนคอลัมน์ ที่ระบุหรือไม่
  if (arrayA.length !== rows * cols || arrayB.length !== rows) {
    return res.status(400).send({ message: 'Array size does not match matrix dimensions' });
  }

  // แปลง arrayA เป็นเมทริกซ์ A ตามขนาดที่กำหนด
  const matrixA = [];
  for (let i = 0; i < rows; i++) {
    matrixA.push(arrayA.slice(i * cols, (i + 1) * cols));
  }

  const matrixB = arrayB.map(value => [value]);

  const detA = math.det(matrixA);

  if (detA === 0) {
    return res.status(400).send({ message: 'Determinant of matrix A is zero, no unique solution exists' });
  }

  function replaceColumn(matrix, column, replacement) {
    return matrix.map((row, index) => {
      const newRow = [...row];
      newRow[column] = replacement[index][0]; // แทนที่ค่าจากเมทริกซ์ B
      return newRow;
    });
  }

  let result = {
    "text": "Cramer's rule",
    "answer": []
  };

  for (let i = 0; i < cols; i++) {
    const detAi = math.det(replaceColumn(matrixA, i, matrixB));
    const xi = detAi / detA;
    result.answer.push(xi);
  }

  res.send(result);
});

app.post('/gauss-elimination', (req, res) => {
  const { arrayA, rows, cols, arrayB } = req.body;

  if (!Array.isArray(arrayA) || !Array.isArray(arrayB) || typeof rows !== 'number' || typeof cols !== 'number') {
    return res.status(400).send({ message: 'Invalid input format' });
  }

  if (arrayA.length !== rows * cols || arrayB.length !== rows) {
    return res.status(400).send({ message: 'Array size does not match matrix dimensions' });
  }

  const matrixA = [];
  for (let i = 0; i < rows; i++) {
    matrixA.push(arrayA.slice(i * cols, (i + 1) * cols));
  }

  const matrixB = arrayB.map(value => [value]);

  const augmentedMatrix = matrixA.map((row, index) => row.concat(matrixB[index][0]));

  for (let i = 0; i < rows; i++) {
    const pivot = augmentedMatrix[i][i];

    for (let j = i + 1; j < rows; j++) {
      const factor = augmentedMatrix[j][i] / pivot;

      for (let k = i; k < cols + 1; k++) {
        augmentedMatrix[j][k] -= factor * augmentedMatrix[i][k];
      }
    }
  }

  const solution = new Array(rows).fill(0);

  for (let i = rows - 1; i >= 0; i--) {
    let sum = 0;

    for (let j = i + 1; j < cols; j++) {
      sum += augmentedMatrix[i][j] * solution[j];
    }

    solution[i] = (augmentedMatrix[i][cols] - sum) / augmentedMatrix[i][i];
  }

  let result = {
    "text": "Gauss elimination method",
    "answer": solution
  };

  res.send(result);
});

app.post('/gauss-jordan', (req, res) => {
  const { arrayA, rows, cols, arrayB } = req.body;

  if (!Array.isArray(arrayA) || !Array.isArray(arrayB) || typeof rows !== 'number' || typeof cols !== 'number') {
    return res.status(400).send({ message: 'Invalid input format' });
  }

  if (arrayA.length !== rows * cols || arrayB.length !== rows) {
    return res.status(400).send({ message: 'Array size does not match matrix dimensions' });
  }

  // Convert arrayA into matrixA
  const matrixA = [];
  for (let i = 0; i < rows; i++) {
    matrixA.push(arrayA.slice(i * cols, (i + 1) * cols));
  }

  // Combine matrixA and matrixB into an augmented matrix
  const augmentedMatrix = matrixA.map((row, index) => row.concat(arrayB[index]));

  // Perform Gauss-Jordan elimination
  for (let i = 0; i < rows; i++) {
    // Make the pivot element 1 by dividing the row by the pivot element
    const pivot = augmentedMatrix[i][i];
    for (let k = 0; k < cols + 1; k++) {
      augmentedMatrix[i][k] /= pivot;
    }

    // Make all other elements in the current column 0
    for (let j = 0; j < rows; j++) {
      if (i !== j) {
        const factor = augmentedMatrix[j][i];
        for (let k = 0; k < cols + 1; k++) {
          augmentedMatrix[j][k] -= factor * augmentedMatrix[i][k];
        }
      }
    }
  }

  // Extract the solution from the augmented matrix
  const solution = augmentedMatrix.map(row => row[cols]);

  let result = {
    "text": "Gauss-Jordan method",
    "answer": solution
  };

  res.send(result);
});

app.post('/lu-decomposition', (req, res) => {
  const { arrayA, rows, cols, arrayB } = req.body;

  if (!Array.isArray(arrayA) || !Array.isArray(arrayB) || typeof rows !== 'number' || typeof cols !== 'number') {
    return res.status(400).send({ message: 'Invalid input format' });
  }

  if (arrayA.length !== rows * cols || arrayB.length !== rows) {
    return res.status(400).send({ message: 'Array size does not match matrix dimensions' });
  }

  const matrixA = [];
  for (let i = 0; i < rows; i++) {
    matrixA.push(arrayA.slice(i * cols, (i + 1) * cols));
  }

  const matrixB = arrayB.slice();

  // Initialize L U
  const L = Array.from({ length: rows }, () => Array(cols).fill(0));
  const U = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i++) {
    // Upper Triangular Matrix
    for (let k = i; k < cols; k++) {
      let sum = 0;
      for (let j = 0; j < i; j++) {
        sum += (L[i][j] * U[j][k]);
      }
      U[i][k] = matrixA[i][k] - sum;
    }

    // Lower Triangular Matrix
    for (let k = i; k < rows; k++) {
      if (i === k) {
        L[i][i] = 1;  // Diagonal as 1
      } else {
        let sum = 0;
        for (let j = 0; j < i; j++) {
          sum += (L[k][j] * U[j][i]);
        }
        L[k][i] = (matrixA[k][i] - sum) / U[i][i];
      }
    }
  }

  // Forward substitution: solve L * y = B
  const y = Array(rows).fill(0);
  for (let i = 0; i < rows; i++) {
    let sum = 0;
    for (let j = 0; j < i; j++) {
      sum += L[i][j] * y[j];
    }
    y[i] = matrixB[i] - sum;
  }

  // Backward substitution: solve U * x = y
  const x = Array(rows).fill(0);
  for (let i = rows - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < cols; j++) {
      sum += U[i][j] * x[j];
    }
    x[i] = (y[i] - sum) / U[i][i];
  }

  let result = {
    "text": "LU decomposition method",
    "L": L,
    "U": U,
    "answer": x
  };

  res.send(result);
});

app.post('/cholesky', (req, res) => {
  const { arrayA, rows, cols, arrayB } = req.body;

  if (!Array.isArray(arrayA) || !Array.isArray(arrayB) || typeof rows !== 'number' || typeof cols !== 'number') {
    return res.status(400).send({ message: 'Invalid input format' });
  }

  if (arrayA.length !== rows * cols || arrayB.length !== rows || rows !== cols) {
    return res.status(400).send({ message: 'Array size does not match matrix dimensions or the matrix is not square' });
  }

  // Convert arrayA into matrixA
  const matrixA = [];
  for (let i = 0; i < rows; i++) {
    matrixA.push(arrayA.slice(i * cols, (i + 1) * cols));
  }

  // Initialize L matrix
  const L = Array.from({ length: rows }, () => Array(cols).fill(0));

  // Perform Cholesky decomposition
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;

      // Summing up the relevant parts of L
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }

      if (i === j) {
        const diagValue = matrixA[i][i] - sum;
        if (diagValue <= 0) {
          return res.status(400).send({ message: 'Matrix is not positive definite' });
        }
        L[i][j] = Math.sqrt(diagValue);
      } else {
        if (L[j][j] === 0) {
          return res.status(400).send({ message: 'Division by zero detected, matrix is not positive definite' });
        }
        L[i][j] = (matrixA[i][j] - sum) / L[j][j];
      }
    }
  }

  // Forward substitution: Solve L * y = B
  const y = Array(rows).fill(0);
  for (let i = 0; i < rows; i++) {
    let sum = 0;
    for (let j = 0; j < i; j++) {
      sum += L[i][j] * y[j];
    }
    y[i] = (arrayB[i] - sum) / L[i][i];
  }

  // Backward substitution: Solve L^T * x = y
  const x = Array(rows).fill(0);
  for (let i = rows - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < rows; j++) {
      sum += L[j][i] * x[j];
    }
    x[i] = (y[i] - sum) / L[i][i];
  }

  let result = {
    "text": "Cholesky decomposition method",
    "L": L,
    "answer": x
  };

  res.send(result);
});

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

//interpolation 
app.post('/newton-divided-difference', (req, res) => {
  let mode = req.body.mode;
  
  switch(mode){
    case "linear" :
      const { x0, x1} = req.body;
      const { fx0, fx1 } = req.body;
      const x = req.body.x; // ค่า x ที่ต้องการหาค่า f(x)

      let fx_l = fx0 + (x - x0) * ((fx1 - fx0) / (x1 - x0));
    
      let result = {
        "text": "Newton divided difference (linear)",
        "answer": fx_l
      };
    
      res.send(result);
      break;
     
    case "quadratic" :
      const { x0: x0_, x1: x1_, x2: x2_ } = req.body;
      const { fx0: fx0_, fx1: fx1_, fx2: fx2_ } = req.body;
      const x_ = req.body.x; // ค่า x ที่ต้องการหาค่า f(x)
    
      let c0 = fx0_;
      let c1 = (fx1_ - fx0_) / (x1_ - x0_);
      let c2 = (((fx2_ - fx1_)/(x2_ - x1_ ))-((fx1_ - fx0_)/(x1_ - x0_ )))/(x2_ - x1_);
    
      let fx_q = c0 + c1 * (x_ - x0_) + c2 * (x_ - x0_) * (x_ - x1_);
    
      let result2 = {
        "text": "Newton divided difference (quadratic)",
        "answer": fx_q
      };
    
      res.send(result2);
      break;

    case "polynomial" :
      const n = req.body.n; // จำนวนจุด
      const x_p = req.body.x; // ค่า x ที่ต้องการหาค่า f(x)
      const xi = req.body.xi; // ค่า x ของจุดที่กำหนด (array)
      const yi = req.body.yi; // ค่า y ของจุดที่กำหนด (array)

      // คำนวณ Newton Divided Differences Table
      let table = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < n; i++) {
        table[i][0] = yi[i];
      }
      
      for (let j = 1; j < n; j++) {
        for (let i = 0; i < n - j; i++) {
          table[i][j] = (table[i + 1][j - 1] - table[i][j - 1]) / (xi[i + j] - xi[i]);
        }
      }

      // คำนวณ f(x) โดยใช้ค่าสัมประสิทธิ์
      let fx_p = table[0][0]; // เริ่มต้นด้วย c0
      for (let i = 1; i < n; i++) {
        let term = table[0][i];
        for (let j = 0; j < i; j++) {
          term *= (x_p - xi[j]);
        }
        fx_p += term;
      }

      let result3 = {
        "text": "Newton divided difference (polynomial)",
        "answer": fx_p
      };

      res.send(result3);
      break;
  }

});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})