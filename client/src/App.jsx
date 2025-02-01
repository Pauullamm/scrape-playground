import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SettingsPage from './components/SettingsPage';
import ToolsPage from './components/pages/ToolsPage';
import HomePage from './components/pages/HomePage';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<HomePage />}/>
          <Route path="/tools" element={<ToolsPage />} />
          <Route path='settings' element={<SettingsPage />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;