const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Firebase Config (Copy-pasted from src/utils/firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyBoFQfUOiAJdO8MYp_je8R0NztFoQSRMh8",
  authDomain: "quiz-pro-db.firebaseapp.com",
  projectId: "quiz-pro-db",
  storageBucket: "quiz-pro-db.firebasestorage.app",
  messagingSenderId: "19877031394",
  appId: "1:19877031394:web:7b2b94b2a4d569b7a65dbb",
  measurementId: "G-8P9QX39LF4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  console.log('🚀 Starting migration from Firebase to Postgres...');

  try {
    // 1. Specify Teacher ID
    const teacherIds = ['bGOxiynutTb0UpjTlagpWeaUuI32'];
    console.log(`Migrating for teacher: ${teacherIds[0]}`);

    for (const teacherId of teacherIds) {
      console.log(`--- Migrating Teacher: ${teacherId} ---`);

      // Ensure teacher exists in Postgres
      await prisma.teacher.upsert({
        where: { id: teacherId },
        update: {},
        create: { id: teacherId }
      });

      // 2. Migrate Questions
      const questionsSnap = await getDocs(collection(db, 'Teachers', teacherId, 'Data'));
      const questionsDoc = questionsSnap.docs.find(d => d.id === 'questions');
      if (questionsDoc && questionsDoc.data().items) {
        const items = questionsDoc.data().items;
        console.log(`  Migrating ${items.length} questions...`);
        for (const q of items) {
          await prisma.question.create({
            data: {
              uid: q.uid,
              text: q.text,
              options: JSON.stringify(q.options),
              correctAnswer: String(q.correctAnswer),
              subject: q.subject || '',
              level: q.level || '',
              teacherId
            }
          }).catch(e => console.error(`    Error question: ${e.message}`));
        }
      }

      // 3. Migrate Sessions
      const sessionsDoc = questionsSnap.docs.find(d => d.id === 'sessions');
      if (sessionsDoc && sessionsDoc.data().items) {
        const items = sessionsDoc.data().items;
        console.log(`  Migrating ${items.length} sessions...`);
        for (const s of items) {
          await prisma.session.create({
            data: {
              id: s.id,
              name: s.name,
              isActive: s.isActive !== undefined ? s.isActive : true,
              createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
              teacherId
            }
          }).catch(e => console.error(`    Error session: ${e.message}`));
        }
      }

      // 4. Migrate Results
      const resultsRef = collection(db, 'Teachers', teacherId, 'ResultsCollection');
      const resultsSnap = await getDocs(resultsRef);
      console.log(`  Migrating ${resultsSnap.size} results...`);
      for (const doc of resultsSnap.docs) {
        const r = doc.data();
        await prisma.result.create({
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
        }).catch(e => console.error(`    Error result: ${e.message}`));
      }

      // 5. Migrate Criteria
      const criteriaDoc = questionsSnap.docs.find(d => d.id === 'criteria');
      if (criteriaDoc && criteriaDoc.data().items) {
        const items = criteriaDoc.data().items;
        console.log(`  Migrating criteria...`);
        for (const c of items) {
          await prisma.criteria.create({
            data: {
              grade: Number(c.grade),
              min: Number(c.min),
              teacherId
            }
          });
        }
      }

      // 6. Migrate Settings
      const settingsDoc = questionsSnap.docs.find(d => d.id === 'settings');
      if (settingsDoc && settingsDoc.data().items) {
        const s = settingsDoc.data().items[0];
        console.log(`  Migrating settings...`);
        await prisma.settings.upsert({
          where: { teacherId },
          update: { questionsPerTest: Number(s.questionsPerTest) },
          create: { teacherId, questionsPerTest: Number(s.questionsPerTest) }
        });
      }
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
