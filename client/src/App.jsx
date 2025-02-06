import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SettingsPage from './components/pages/SettingsPage';
import ToolsPage from './components/pages/ToolsPage';
import DocumentationPage from './components/pages/DocumentationPage';
import Navbar from './components/Navbar';
import LandingPage from './components/pages/LandingPage';
import AuthPage from './components/pages/AuthPage';

import supabase from './supabaseClient/supabaseClient';

export default function App() {
  const [session, setSession] = useState(null);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Router>
        {session ? <Navbar supabaseClient={supabase} setSession={setSession}/> : <></>}
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path="/home" element={session ? <DocumentationPage /> : <AuthPage supabaseClient={supabase} setSession={setSession}/>} />
          <Route path="/tools" element={session ? <ToolsPage /> : <AuthPage supabaseClient={supabase} setSession={setSession}/>} />
          <Route path='/settings' element={session ? <SettingsPage /> : <AuthPage supabaseClient={supabase} setSession={setSession}/>} />
        </Routes>
      </Router>
    </div>
  );
}