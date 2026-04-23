import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AdminPanel from './pages/AdminPanel';
import StudentEntry from './pages/StudentEntry';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* ENDI BOSH SAHIFA - ADMIN PANEL (LOGIN) */}
          <Route path="/" element={<AdminPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* TALABALAR UCHUN TESTGA KIRISH QISMI */}
          <Route path="/test" element={<LandingPage />} />
          <Route path="/quiz" element={<StudentEntry />} />
          <Route path="/start-quiz" element={<QuizPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
