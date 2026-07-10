import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [view, setView] = useState('landing'); // State management switcher: 'landing' or 'dashboard'
  const [loading, setLoading] = useState(false);

  // 🌟 The missing connector function that binds LandingPage directly to the Dashboard state
  const handleAnalysisComplete = (data) => {
    setAnalysisResult(data);
    setView('dashboard');
  };

  const handleGoBack = () => {
    setAnalysisResult(null);
    setView('landing');
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', width: '100%' }}>
      {/* Universal Navbar Navigation Bar Wrapper */}
      <Navbar />
      
      {/* 📥 1. LANDING/UPLOAD STATE PANEL VIEW */}
      {view === 'landing' && (
        <LandingPage onAnalysisComplete={handleAnalysisComplete} />
      )}

      {/* 📊 2. ANALYTICS METRICS DASHBOARD VIEW */}
      {view === 'dashboard' && analysisResult && (
        <Dashboard data={analysisResult} goBack={handleGoBack} />
      )}
    </div>
  );
}