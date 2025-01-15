import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SettingsPage from './components/SettingsPage';
import HomePage from './components/HomePage';
import ApiTestPage from './components/ApiTestPage';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path='/settings' element={<SettingsPage />} />
          <Route path='/api-test' element={<ApiTestPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;