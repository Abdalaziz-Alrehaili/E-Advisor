import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginAndRegister from './LoginAndRegister'; 
import Profile from './Profile';
import Plan from './Plan';
import Explorer from './Explorer';
import AdminDashboard from './AdminDashboard'; 
import './App.css';

function App() {
  // Logic: Check the browser's memory for a saved user session
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('eadvisor_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    // Save session to browser memory
    localStorage.setItem('eadvisor_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    // Clear browser memory
    localStorage.removeItem('eadvisor_user');
  };

  return (
    <Router>
      <nav className="navbar navbar-dark shadow-sm mb-4" style={{ backgroundColor: '#104929' }}>
        <div className="container d-flex justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="text-warning text-decoration-none" style={{color: '#ffffff', fontWeight: 'bold'}}>E-Advisor</Link>
            
            {user && user.role === 'student' && (
              <>
                <Link to="/profile" className="text-white text-decoration-none">Profile</Link>
                <Link to="/plan" className="text-white text-decoration-none">Plan</Link>
              </>
            )}
            
            {user && user.role === 'admin' && (
              <>
                <Link to="/admin" className="text-white text-decoration-none">Admin Dashboard</Link>
                <Link to="/explorer" className="text-white text-decoration-none">DB Explorer</Link>
              </>
            )}
          </div>

          {user && (
            <div className="d-flex align-items-center gap-3">
               <span className="text-white small">Hi, {user.first_name}</span>
               <button onClick={handleLogout} className="btn btn-outline-light btn-sm">Logout</button>
            </div>
          )}
        </div>
      </nav>

      <div className="container d-flex flex-column align-items-center">
        <div className="w-100" style={{ maxWidth: '1100px' }}>
          <Routes>
            <Route path="/" element={
              !user ? <LoginAndRegister onLogin={handleLogin} /> 
                    : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/profile" />)
            } />
            
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
            <Route path="/plan" element={user ? <Plan user={user} /> : <Navigate to="/" />} />
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/explorer" element={user && user.role === 'admin' ? <Explorer /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;