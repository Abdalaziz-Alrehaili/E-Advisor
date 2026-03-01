import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginAndRegister from './LoginAndRegister'; 
import Profile from './Profile';
import Plan from './Plan';
import Explorer from './Explorer';
import AdminDashboard from './AdminDashboard'; // Import the new dashboard
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
            <Link to="/" className="text-warning text-decoration-none" style={{color: '#000000'}}>E-Advisor </Link>
            
            {/* Show Profile/Plan links only for students (optional, but cleaner for the Admin) */}
            {user && user.role === 'student' && (
              <>
                <Link to="/profile" className="text-white text-decoration-none">Profile</Link>
                <Link to="/plan" className="text-white text-decoration-none">Plan</Link>
              </>
            )}
            
            {/* Show Admin tools only if the user is an admin */}
            {user && user.role === 'admin' && (
              <>
                <Link to="/admin" className="text-warning fw-bold text-decoration-none ms-3">Admin Panel</Link>
                <Link to="/explorer" className="text-white-50 text-decoration-none" style={{fontSize: '0.8rem'}}>DB Explorer</Link>
              </>
            )}
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
            {/* UPDATED ROOT ROUTE: 
              If not logged in -> Login Page
              If logged in as admin -> Admin Dashboard
              If logged in as student -> Profile Page
            */}
            <Route path="/" element={
              !user ? <LoginAndRegister onLogin={handleLogin} /> 
                    : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/profile" />)
            } />
            
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
            <Route path="/plan" element={user ? <Plan user={user} /> : <Navigate to="/" />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/explorer" element={user && user.role === 'admin' ? <Explorer /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;