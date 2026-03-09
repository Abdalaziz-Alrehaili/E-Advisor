import React, { useState } from 'react';

function LoginAndRegister({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user); // Pass user data back to App
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Cannot connect to server");
    }
  };

  return (
    <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: 'linear-gradient(135deg, #dce5df 0%, #b8c9bc 100%)', 
        zIndex: 9999
    }}>
      
      {/* Official Top Header Bar */}
      <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '70px',
          backgroundColor: '#104929',
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
         <h4 className="text-white m-0 fw-bold" style={{ letterSpacing: '1px' }}>KAU E-Advisor Portal</h4>
      </div>

      {/* The Login Card */}
      <div className="rounded" style={{ 
          width: '100%', 
          maxWidth: '520px', 
          padding: '60px', 
          backgroundColor: '#ffffff', 
          borderTop: '8px solid #1a9044',
          boxShadow: '0 25px 50px rgba(16, 73, 41, 0.2)'
      }}>
        
        <div className="kau-header mb-5 text-center">
          {/* Sleek, bold, single title */}
          <h2 className="fw-bold m-0" style={{ color: '#104929', fontSize: '2.2rem' }}>
            E-Advisor Login Portal
          </h2>
        </div>
        
        {error && <div className="alert alert-danger p-2 small text-center fw-bold">{error}</div>}

        <form onSubmit={handleLoginSubmit}>
          {/* USERNAME FIELD */}
          <div className="mb-4 text-start w-100">
            <label className="form-label fw-bold" style={{ color: '#104929' }}>Username</label>
            <input 
              type="text" 
              className="form-control form-control-lg w-100" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', padding: '15px', color: '#000000' }}
            />
          </div>
          
          {/* PASSWORD FIELD */}
          <div className="mb-4 text-start w-100">
            <label className="form-label fw-bold" style={{ color: '#104929' }}>Password</label>
            <input 
              type="password" 
              className="form-control form-control-lg w-100" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', padding: '15px', color: '#000000' }}
            />
          </div>
          
          <button type="submit" className="btn btn-success w-100 py-3 fs-5 mt-3 shadow-sm" style={{ borderRadius: '30px', fontWeight: 'bold' }}>
            {isLogin ? 'Login / دخول' : 'Register'}
          </button>
        </form>
      </div>

      {/* Standard University Footer */}
      <div style={{
          position: 'absolute',
          bottom: '20px',
          color: '#5a6268',
          fontSize: '0.85rem',
          fontWeight: '600'
      }}>
        © 2026 King Abdulaziz University. All Rights Reserved.
      </div>

    </div>
  );
}

export default LoginAndRegister;