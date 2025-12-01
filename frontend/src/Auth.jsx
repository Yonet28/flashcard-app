import { useState } from 'react';

function Auth({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 

    const endpoint = isRegistering ? '/api/users/register' : '/api/users/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred");
      }

      if (isRegistering) {
        alert("Account created successfully! Please log in now.");
        setIsRegistering(false);
      } else {
        onLogin(data.userId);
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isRegistering ? "Registration" : "👋 Login"}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-primary">
            {isRegistering ? "Register" : "Login"}
          </button>
        </form>

        <p className="switch-mode">
          {isRegistering ? "Already have an account?" : "Don't have an account yet?"}
          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;