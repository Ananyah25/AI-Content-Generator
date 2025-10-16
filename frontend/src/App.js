// src/App.js
import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import BlogGenerator from './components/BlogGenerator';
import SocialMediaGenerator from './components/SocialMediaGenerator';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [contentType, setContentType] = useState('general');

  const handleNavigate = (view, type = 'general') => {
    setCurrentView(view);
    setContentType(type);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatInterface contentType={contentType} onBack={() => setCurrentView('landing')} />;
      case 'blog':
        return <BlogGenerator onBack={() => setCurrentView('landing')} />;
      case 'social':
        return <SocialMediaGenerator onBack={() => setCurrentView('landing')} />;
      
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <Navbar currentView={currentView} onNavigate={handleNavigate} />
        <main className="main-content">
          {renderCurrentView()}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
