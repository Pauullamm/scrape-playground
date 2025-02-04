import './index.css'
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SettingsPage from './components/SettingsPage';
import ToolsPage from './components/pages/ToolsPage';
import HomePage from './components/pages/HomePage';
import Navbar from './components/Navbar';
import LandingPage from './components/pages/LandingPage';
import AuthPage from './components/pages/AuthPage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Router>
        {session ? <Navbar /> : <></>}
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path="/home" element={session ? <HomePage /> : <AuthPage supabaseClient={supabase} />} />
          <Route path="/tools" element={session ? <ToolsPage /> : <AuthPage supabaseClient={supabase} />} />
          <Route path='settings' element={session ? <SettingsPage /> : <AuthPage supabaseClient={supabase} />} />
        </Routes>
      </Router>
    </div>
  );
}