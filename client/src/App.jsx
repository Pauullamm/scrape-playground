import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SettingsPage from './components/SettingsPage';
// import HomePage from './components/HomePage';
import ToolBox from './components/ToolBox';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<ToolBox />} />
          <Route path='settings' element={<SettingsPage />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;