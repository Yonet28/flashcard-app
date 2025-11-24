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
        throw new Error(data.error || "Une erreur est survenue");
      }

      if (isRegistering) {
        alert("Compte créé avec succès ! Connectez-vous maintenant.");
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
        <h2>{isRegistering ? "🚀 Inscription" : "👋 Connexion"}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pseudo</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-primary">
            {isRegistering ? "S'inscrire" : "Se connecter"}
          </button>
        </form>

        <p className="switch-mode">
          {isRegistering ? "Déjà un compte ?" : "Pas encore de compte ?"}
          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Se connecter" : "Créer un compte"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;