import './index.css'
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { customTheme } from './authTheme';
import SettingsPage from './components/SettingsPage';
import ToolsPage from './components/pages/ToolsPage';
import HomePage from './components/pages/HomePage';
import Navbar from './components/Navbar';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublicKey = import.meta.env.VITE_SUPABASE_PUBLIC_KEY;
const supabase = createClient(supabaseUrl, supabasePublicKey);


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

  // if (!session) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 text-white">
  //       <div className="w-full max-w-md">
  //         <Auth
  //           supabaseClient={supabase}
  //           appearance={{
  //             theme: customTheme,
  //             style: {
  //               button: {
  //                 borderRadius: '8px',
  //                 border: 'none',
  //                 fontWeight: '600',
  //                 transition: 'all 0.2s ease',
  //                 height: '1.875rem'
  //               },
  //               anchor: {
  //                 fontSize: '14px',
  //                 '&:hover': {
  //                   textDecoration: 'underline',
  //                 }
  //               },
  //               input: {
  //                 background: '',
  //                 color: 'white',
  //                 height: "2rem",
  //                 padding: '0.5em'
  //               },
  //               // Add more element styles as needed
  //             },
  //             variables: {
  //               default: {
  //                 fonts: {
  //                   bodyFontFamily: 'Arial, sans-serif',
  //                   buttonFontFamily: 'Arial, sans-serif',
  //                 }
  //               }
  //             }
  //           }}
  //           theme="dark"
  //           providers={['github', 'google']} // Add any providers you want
  //         />
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path='settings' element={<SettingsPage />} />
        </Routes>
      </Router>
    </div>
  );
}