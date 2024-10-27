import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Curriculum from './components/Curriculum';
import Whiteboard from './components/Whiteboard';
import CallToAction from './components/CallToAction';
import GetStarted from './components/GetStarted';

function App() {
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
              <Whiteboard />
              <CallToAction />
            </div>
          } />
          <Route path="/get-started" element={<GetStarted />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;