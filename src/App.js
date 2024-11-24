import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import PlayPage from './PlayPage'; 
import SettingsPage from './SettingsPage'; 
import Act1 from './Act1'; 

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/act1" element={<Act1 />} />
      </Routes>
    </Router>
  );
};

export default App;
