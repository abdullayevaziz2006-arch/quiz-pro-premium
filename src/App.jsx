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
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/quiz" element={<StudentEntry />} />
          <Route path="/start-quiz" element={<QuizPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
