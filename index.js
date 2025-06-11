const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// ✅ This line is CRITICAL
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

// ✅ This part is what Render looks for
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



const fs = require('fs');
const DB_FILE = path.join(__dirname, 'students.json');

// Helper: read data from file
function readStudents() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper: write data to file
function writeStudents(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Create student
app.post('/students', (req, res) => {
  const student = req.body;
  if (!student.student_id || !student.full_name || !student.department || !student.email || !student.level || !student.status) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const students = readStudents();
  student.id = Date.now().toString(); // unique ID
  students.push(student);
  writeStudents(students);

  res.status(201).json({ message: 'Student registered' });
});

// Get all students (optionally filtered)
app.get('/students', (req, res) => {
  const { department } = req.query;
  let students = readStudents();
  if (department) {
    students = students.filter(s => s.department.toLowerCase().includes(department.toLowerCase()));
  }
  res.json(students);
});

// Get single student
app.get('/students/:id', (req, res) => {
  const students = readStudents();
  const student = students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

// Update student
app.put('/students/:id', (req, res) => {
  const students = readStudents();
  const index = students.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });

  students[index] = { ...students[index], ...req.body };
  writeStudents(students);
  res.json({ message: 'Student updated' });
});

