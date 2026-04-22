const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Teacher Middleware/Upsert ---
// Every request includes teacherId. We ensure the teacher exists in our DB.
const ensureTeacher = async (req, res, next) => {
  const { teacherId } = req.params;
  if (!teacherId || teacherId === 'undefined') {
    return res.status(400).json({ error: 'Teacher ID is required' });
  }
  
  try {
    await prisma.teacher.upsert({
      where: { id: teacherId },
      update: {},
      create: { id: teacherId }
    });
    next();
  } catch (err) {
    console.error('Error ensuring teacher:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// --- Routes ---

// Questions
app.get('/api/:teacherId/questions', ensureTeacher, async (req, res) => {
  const questions = await prisma.question.findMany({
    where: { teacherId: req.params.teacherId }
  });
  // Parse options back to array
  const parsed = questions.map(q => ({ ...q, options: JSON.parse(q.options) }));
  res.json(parsed);
});

app.post('/api/:teacherId/questions/bulk', ensureTeacher, async (req, res) => {
  const { items } = req.body; // Array of questions
  const { teacherId } = req.params;

  try {
    // For simplicity in this migration, we'll clear and re-insert if bulk saving,
    // or we can do a more complex merge. storage.js usually sends the whole list.
    await prisma.question.deleteMany({ where: { teacherId } });
    
    const data = items.map(q => ({
      uid: q.uid,
      text: q.text,
      options: JSON.stringify(q.options),
      correctAnswer: String(q.correctAnswer),
      subject: q.subject || '',
      level: q.level || '',
      teacherId
    }));

    await prisma.question.createMany({ data });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Sessions
app.get('/api/:teacherId/sessions', ensureTeacher, async (req, res) => {
  const sessions = await prisma.session.findMany({
    where: { teacherId: req.params.teacherId },
    orderBy: { createdAt: 'desc' }
  });
  res.json(sessions);
});

app.post('/api/:teacherId/sessions', ensureTeacher, async (req, res) => {
  const { teacherId } = req.params;
  const session = req.body;
  const newSession = await prisma.session.create({
    data: {
      id: session.id,
      name: session.name,
      isActive: session.isActive !== undefined ? session.isActive : true,
      teacherId
    }
  });
  res.json(newSession);
});

app.delete('/api/:teacherId/sessions/:id', ensureTeacher, async (req, res) => {
  await prisma.session.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// Criteria
app.get('/api/:teacherId/criteria', ensureTeacher, async (req, res) => {
  const criteria = await prisma.criteria.findMany({
    where: { teacherId: req.params.teacherId },
    orderBy: { grade: 'desc' }
  });
  res.json(criteria);
});

app.post('/api/:teacherId/criteria/bulk', ensureTeacher, async (req, res) => {
  const { items } = req.body;
  const { teacherId } = req.params;
  await prisma.criteria.deleteMany({ where: { teacherId } });
  await prisma.criteria.createMany({
    data: items.map(c => ({ grade: Number(c.grade), min: Number(c.min), teacherId }))
  });
  res.json({ success: true });
});

// Results
app.get('/api/:teacherId/results', ensureTeacher, async (req, res) => {
  const results = await prisma.result.findMany({
    where: { teacherId: req.params.teacherId },
    orderBy: { date: 'desc' }
  });
  const parsed = results.map(r => ({
    ...r,
    student: JSON.parse(r.student),
    answers: JSON.parse(r.answers)
  }));
  res.json(parsed);
});

app.post('/api/:teacherId/results', ensureTeacher, async (req, res) => {
  const { teacherId } = req.params;
  const r = req.body;
  const newResult = await prisma.result.create({
    data: {
      id: r.id ? String(r.id) : undefined,
      teacherId,
      sessionId: r.sessionId,
      student: JSON.stringify(r.student),
      score: Number(r.score),
      total: Number(r.total),
      answers: JSON.stringify(r.answers || []),
      date: r.date ? new Date(r.date) : new Date()
    }
  });
  res.json(newResult);
});

app.delete('/api/:teacherId/results/all', ensureTeacher, async (req, res) => {
  await prisma.result.deleteMany({ where: { teacherId: req.params.teacherId } });
  res.json({ success: true });
});

// Settings
app.get('/api/:teacherId/settings', ensureTeacher, async (req, res) => {
  const settings = await prisma.settings.findUnique({
    where: { teacherId: req.params.teacherId }
  });
  res.json(settings || { questionsPerTest: 20 });
});

app.post('/api/:teacherId/settings', ensureTeacher, async (req, res) => {
  const { questionsPerTest } = req.body;
  const { teacherId } = req.params;
  const updated = await prisma.settings.upsert({
    where: { teacherId },
    update: { questionsPerTest: Number(questionsPerTest) },
    create: { teacherId, questionsPerTest: Number(questionsPerTest) }
  });
  res.json(updated);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
