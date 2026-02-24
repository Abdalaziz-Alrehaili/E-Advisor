import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginAndRegister from './LoginAndRegister'; 
import Profile from './Profile';
import Plan from './Plan';
import Explorer from './Explorer';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <nav className="navbar navbar-dark shadow-sm mb-4" style={{ backgroundColor: '#104929' }}>
        <div className="container d-flex justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <span className="navbar-brand h1 mb-0">E-Advisor</span>
            {user && (
              <>
                <Link to="/profile" className="text-white text-decoration-none">Profile</Link>
                <Link to="/plan" className="text-white text-decoration-none">Plan</Link>
              </>
            )}
            <Link to="/admin" className="text-warning text-decoration-none" style={{fontSize: '0.8rem'}}>Explorer</Link>
          </div>
          {user && (
            <div className="d-flex align-items-center gap-3">
               <span className="text-white small">Hi, {user.first_name}</span>
               <button onClick={() => setUser(null)} className="btn btn-outline-light btn-sm">Logout</button>
            </div>
          )}
        </div>
      </nav>

      <div className="container d-flex flex-column align-items-center">
        <div className="w-100" style={{ maxWidth: '1100px' }}>
          <Routes>
            <Route path="/" element={!user ? <LoginAndRegister onLogin={handleLogin} /> : <Navigate to="/profile" />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
            <Route path="/plan" element={user ? <Plan user={user} /> : <Navigate to="/" />} />
            <Route path="/admin" element={<Explorer />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;