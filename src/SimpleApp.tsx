import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TestPage from './pages/TestPage';

console.log("SimpleApp.tsx loading");

function SimpleApp() {
  console.log("SimpleApp rendering");
  
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="*" element={<TestPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default SimpleApp; 