import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SettingsPage from './components/SettingsPage';
import ToolsPage from './components/pages/ToolsPage';
import HomePage from './components/pages/HomePage';
import Navbar from './components/Navbar';
import LandingPage from './components/pages/LandingPage';
import AuthPage from './components/pages/AuthPage';
import LogoutPage from './components/pages/LogoutPage';

import supabase from './supabaseClient/supabaseClient';

export default function App() {
  const [session, setSession] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Router>
        {session ? <Navbar supabaseClient={supabase} setSession={setSession}/> : <></>}
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path="/home" element={session ? <HomePage /> : <AuthPage supabaseClient={supabase} setSession={setSession}/>} />
          <Route path="/tools" element={session ? <ToolsPage /> : <AuthPage supabaseClient={supabase} setSession={setSession}/>} />
          <Route path='/settings' element={session ? <SettingsPage /> : <AuthPage supabaseClient={supabase} setSession={setSession}/>} />
          <Route path='/logout' element={session? <LogoutPage />: <AuthPage supabaseClient={supabase} setSession={setSession}/>}/>
        </Routes>
      </Router>
    </div>
  );
}