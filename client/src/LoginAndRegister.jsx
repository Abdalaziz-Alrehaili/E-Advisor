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
    /* Removed .container class to hide the outer white box */
    <div className="w-100 d-flex justify-content-center" style={{ marginTop: '10vh' }}>
      <div className="login-form">
        <div className="kau-header mb-4 text-center">
          <img src="https://verification.kau.edu.sa/images/logo2.png" alt="KAU Logo" style={{height: '70px'}} />
          <h2 className="mt-3">جامعة الملك عبدالعزيز</h2>
          <h5 className="text-muted mt-2">{isLogin ? 'Login' : 'Register'}</h5>
        </div>
        
        {error && <div className="alert alert-danger p-2 small">{error}</div>}

        <form onSubmit={handleLoginSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          
          <div className="mb-4 text-start">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-success w-100 py-2">
            {isLogin ? 'Login / دخول' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginAndRegister;