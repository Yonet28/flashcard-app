import React, { useState } from 'react';

// This component handles user login and registration
function Auth({ onLogin }) {
  // State to toggle between Login (true) and Register (false)
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Function to handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page refresh
    setError(''); // Resets error message
    // Selection of the API endpoint based on the mode
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) { 
        onLogin(data.userId); // Successful login, pass userId to parent
      } 
      else { 
        setError(data.error || 'Erreur d\'identification'); // Error from server
      }
    } catch (err) { 
      setError('Erreur serveur'); // Connection or server error
    }
  };

  return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', minHeight:'80vh'}}>
      <div className="card-form" style={{width:'100%', maxWidth:'400px'}}>
        <h2 style={{textAlign:'center', marginBottom:'30px'}}>{isLogin ? '👋 Welcome Back' : '✨ Create Account'}</h2>
        {error && <div style={{color:'var(--danger)', textAlign:'center', marginBottom:'15px'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={{color:'var(--text-muted)'}}>Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          <label style={{color:'var(--text-muted)'}}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn-master btn-gradient" style={{width:'100%', marginTop:'10px'}}>
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        {/* Button to toggle between login and registration modes */}
        <button onClick={() => setIsLogin(!isLogin)} style={{background:'none', border:'none', color:'var(--primary)', cursor:'pointer', width:'100%', marginTop:'20px'}}>
          {isLogin ? "Need an account? Register" : "Have an account? Login"}
        </button>
      </div>
    </div>
  );
}

export default Auth;