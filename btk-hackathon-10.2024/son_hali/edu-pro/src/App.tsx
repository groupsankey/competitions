import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Curriculum from './components/Curriculum';
import Whiteboard from './components/Whiteboard';
import Whiteboardpart from './components/Whiteboardpart';
import CallToAction from './components/CallToAction';
import GetStarted from './components/GetStarted';
import ClassBoardSelector from './components/ClassBoardSelector';
import Login from './components/Login';
import GraphingCalculator from './components/GraphingCalculator';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <div className="pt-16">
              <Hero />
              <Features />
              <Curriculum />
              <Whiteboardpart user={user} />
              <CallToAction />
            </div>
          } />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/class-board-selector" element={<ClassBoardSelector />} />
          <Route path="/whiteboard" element={user ? <Whiteboard user={user} /> : <Login onLogin={handleLogin} />} />
          <Route path="/graphing" element={<GraphingCalculator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;