import React, { useState } from 'react';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.userId) {
            onLogin(data.userId); 
        } else {
            setError("Server error: No UserID received");
        }
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Cannot connect to server. Check if backend is running.');
      console.error("Auth Error:", err);
    }
  };

  return (
    <div className="auth-simple-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#000' }}>
      <div style={{ background: '#1a1a1a', padding: '40px', borderRadius: '15px', border: '1px solid #333', width: '100%', maxWidth: '400px' }}>
        
        <h2 style={{ textAlign: 'center', color: '#fff', marginBottom: '30px' }}>
          {isLogin ? '👋 Welcome Back' : '✨ Create Account'}
        </h2>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Your username"
              style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
              style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
          
          <button type="submit" className="btn-master btn-gradient" style={{ width: '100%' }}>
            {isLogin ? 'Login Now' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', color: '#9ca3af' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}
          </p>
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="btn-master btn-dark"
            style={{ padding: '8px 20px', margin: '0 auto' }}
          >
            {isLogin ? 'Go to Register' : 'Go to Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;