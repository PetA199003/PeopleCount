import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CameraConfig from './components/CameraConfig';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import { PersonCountProvider } from './context/PersonCountContext';

function App() {
  return (
    <PersonCountProvider>
      <Router>
        <div className="flex h-screen bg-gray-900">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cameras" element={<CameraConfig />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PersonCountProvider>
  );
}

export default App;