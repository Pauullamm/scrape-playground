import React from 'react';

import Navbar from './components/Navbar';
import ToolsPage from './components/ToolsPage';
import SettingsPage from './components/SettingsPage'
import {  Route, Routes } from 'react-router';

export default function App() {  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Navbar />
      <Routes>
        <Route path='/' element={<ToolsPage />}/>
        <Route path='/settings' element={<SettingsPage />}/>
      </Routes>
    </div>
  );
}