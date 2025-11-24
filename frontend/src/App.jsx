import { useState, useEffect } from 'react';
import Auth from './Auth';
import './App.css';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  
  const [cards, setCards] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [flippedCardId, setFlippedCardId] = useState(null);

  const [editingId, setEditingId] = useState(null); 
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id);
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
  };

  const fetchCards = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/cards?userId=${userId}`);
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  useEffect(() => {
    if (userId) fetchCards();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newCard = { question, answer, userId };
    await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCard)
    });
    setQuestion("");
    setAnswer("");
    fetchCards();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Voulez-vous vraiment supprimer cette carte ?")) {
        await fetch(`/api/cards/${id}`, { method: 'DELETE' });
        fetchCards();
    }
  };

  const startEditing = (e, card) => {
    e.stopPropagation(); 
    setEditingId(card._id);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
    setFlippedCardId(null); 
  };

  const saveEdit = async (e, id) => {
    e.stopPropagation();
    await fetch(`/api/cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: editQuestion, answer: editAnswer })
    });
    setEditingId(null); 
    fetchCards();
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleCardClick = (id) => {
    if (editingId === id) return; 
    setFlippedCardId(flippedCardId === id ? null : id);
  };

  if (!userId) {
    return (
      <div className="app-container">
        <header><h1>🧠 FlashMaster</h1><p>Connectez-vous pour réviser</p></header>
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
        <div><h1>🧠 FlashMaster</h1><p>Bienvenue dans votre espace</p></div>
        <button onClick={handleLogout} className="btn-delete" style={{marginTop:0, background: '#ef4444'}}>Déconnexion</button>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="card-form">
            <h2>✨ Nouvelle Carte</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question</label>
                <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ex: Capitale de la France ?" required />
              </div>
              <div className="form-group">
                <label>Réponse</label>
                <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Ex: Paris" required />
              </div>
              <button type="submit" className="btn-add">Ajouter la carte</button>
            </form>
          </div>
        </aside>

        <main className="card-grid">
          {cards.map((card) => (
            <div 
              key={card._id} 
              className={`flashcard ${flippedCardId === card._id ? 'flipped' : ''} ${editingId === card._id ? 'editing-mode' : ''}`}
              onClick={() => handleCardClick(card._id)}
            >
              {editingId === card._id ? (
                <div className="card-edit-form">
                    <input 
                        value={editQuestion} 
                        onChange={(e) => setEditQuestion(e.target.value)} 
                        placeholder="Modifier la question"
                        onClick={(e) => e.stopPropagation()} 
                    />
                    <input 
                        value={editAnswer} 
                        onChange={(e) => setEditAnswer(e.target.value)} 
                        placeholder="Modifier la réponse"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="edit-actions">
                        <button onClick={(e) => saveEdit(e, card._id)} className="btn-save">💾</button>
                        <button onClick={cancelEdit} className="btn-cancel">❌</button>
                    </div>
                </div>
              ) : (
                <div className="flashcard-inner">
                  <div className="flashcard-front">
                    <span className="badge question">Question</span>
                    <p className="card-text">{card.question}</p>
                    <div className="actions-bar">
                        <button onClick={(e) => startEditing(e, card)} className="btn-icon">✏️</button>
                    </div>
                    <span className="hint">Cliquez pour retourner ↻</span>
                  </div>
                  <div className="flashcard-back">
                    <span className="badge answer">Réponse</span>
                    <p className="card-text">{card.answer}</p>
                    <button onClick={(e) => handleDelete(e, card._id)} className="btn-delete">Supprimer</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

export default App;