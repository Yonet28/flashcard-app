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
      if (response.ok) { onLogin(data.userId); } 
      else { setError(data.error || 'Erreur d\'identification'); }
    } catch (err) { setError('Erreur serveur'); }
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
        <button onClick={() => setIsLogin(!isLogin)} style={{background:'none', border:'none', color:'var(--primary)', cursor:'pointer', width:'100%', marginTop:'20px'}}>
          {isLogin ? "Need an account? Register" : "Have an account? Login"}
        </button>
      </div>
    </div>
  );
}

export default Auth;