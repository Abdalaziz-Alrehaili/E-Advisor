import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginAndRegister from './LoginAndRegister'; 
import Profile from './Profile';
import Plan from './Plan';
import Explorer from './Explorer';
import AdminDashboard from './AdminDashboard'; 
import SupervisorDashboard from './SupervisorDashboard';
import StudentChat from './StudentChat';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('eadvisor_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // State to hold the number of pending requests for the red badges
  const [adminInboxCount, setAdminInboxCount] = useState(0);
  const [supervisorInboxCount, setSupervisorInboxCount] = useState(0);

  const fetchInboxCounts = () => {
      if (user && user.role === 'admin') {
          fetch('http://localhost:5000/api/admin/advising-requests')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setAdminInboxCount(data.length);
            })
            .catch(err => console.error(err));
      } else if (user && user.role === 'supervisor') {
          fetch(`http://localhost:5000/api/advising-request/${user.user_id}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSupervisorInboxCount(data.filter(req => req.status === 'Pending').length);
                }
            })
            .catch(err => console.error(err));
      }
  };

  useEffect(() => {
      fetchInboxCounts();
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('eadvisor_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('eadvisor_user');
  };

  return (
    <Router>
      <nav className="navbar navbar-dark shadow-sm mb-4" style={{ backgroundColor: '#104929' }}>
        <div className="container d-flex justify-content-between">
          <div className="d-flex align-items-center gap-4">
            <Link to="/" className="text-warning text-decoration-none" style={{color: '#ffffff', fontWeight: 'bold', fontSize: '1.2rem'}}>E-Advisor</Link>
            
            {user && user.role === 'student' && (
              <>
                <Link to="/profile" className="text-white text-decoration-none fw-bold">Profile</Link>
                <Link to="/plan" className="text-white text-decoration-none fw-bold">Plan</Link>
              </>
            )}
            
            {user && user.role === 'admin' && (
              <>
                <Link to="/admin" className="text-white text-decoration-none fw-bold">Admin Dashboard</Link>
                <Link to="/admin/inbox" className="text-white text-decoration-none fw-bold position-relative">
                   Requests Inbox
                   {adminInboxCount > 0 && (
                       <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" style={{ fontSize: '0.65rem' }}>
                         {adminInboxCount}
                       </span>
                   )}
                </Link>
                <Link to="/explorer" className="text-white text-decoration-none fw-bold">DB Explorer</Link>
              </>
            )}

            {user && user.role === 'supervisor' && (
              <>
                <Link to="/supervisor" className="text-white text-decoration-none fw-bold">Supervisor Dashboard</Link>
                <Link to="/supervisor/inbox" className="text-white text-decoration-none fw-bold position-relative">
                   Requests Inbox
                   {supervisorInboxCount > 0 && (
                       <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" style={{ fontSize: '0.65rem' }}>
                         {supervisorInboxCount}
                       </span>
                   )}
                </Link>
              </>
            )}
          </div>

          {user && (
            <div className="d-flex align-items-center gap-3">
               {/* FIXED: Added user.last_name so it doesn't just say "Dr." */}
               <span className="text-white small">Hi, {user.first_name} {user.last_name}</span>
               <button onClick={handleLogout} className="btn btn-outline-light btn-sm fw-bold">Logout</button>
            </div>
          )}
        </div>
      </nav>

      <div className="container-fluid d-flex flex-column align-items-center">
        <div className="w-100">
          <Routes>
            <Route path="/" element={
              !user ? <LoginAndRegister onLogin={handleLogin} /> 
                    : (user.role === 'admin' ? <Navigate to="/admin" /> 
                    : (user.role === 'supervisor' ? <Navigate to="/supervisor" /> 
                    : <Navigate to="/profile" />))
            } />
            
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
            <Route path="/plan" element={user ? <Plan user={user} /> : <Navigate to="/" />} />
            
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard activeView="home" onReqUpdate={fetchInboxCounts} /> : <Navigate to="/" />} />
            <Route path="/admin/inbox" element={user && user.role === 'admin' ? <AdminDashboard activeView="inbox" onReqUpdate={fetchInboxCounts} /> : <Navigate to="/" />} />
            
            <Route path="/explorer" element={user && user.role === 'admin' ? <Explorer /> : <Navigate to="/" />} />
            
            {/* NEW: Passed activeView props to the Supervisor Dashboard */}
            <Route path="/supervisor" element={user && user.role === 'supervisor' ? <SupervisorDashboard user={user} activeView="roster" onReqUpdate={fetchInboxCounts} /> : <Navigate to="/" />} />
            <Route path="/supervisor/inbox" element={user && user.role === 'supervisor' ? <SupervisorDashboard user={user} activeView="inbox" onReqUpdate={fetchInboxCounts} /> : <Navigate to="/" />} />
            
            <Route path="/chat" element={user && user.role === 'student' ? <StudentChat user={user} /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;