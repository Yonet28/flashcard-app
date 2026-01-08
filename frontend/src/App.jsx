import { useState, useEffect } from 'react';
import Auth from './Auth';
import './App.css';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [folders, setFolders] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  
  // États pour la création
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [targetFolderId, setTargetFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  
  // États pour l'interface
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [resC, resF] = await Promise.all([
        fetch(`/api/cards?userId=${userId}`),
        fetch(`/api/folders?userId=${userId}`)
      ]);
      setCards(await resC.json());
      setFolders(await resF.json());
    } catch (e) { console.error("Erreur de chargement:", e); }
  };

  useEffect(() => { if (userId) fetchData(); }, [userId]);

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
    window.location.reload();
  };

  // --- ACTIONS SUR LES CARTES ---

  const handleAnswer = async (e, id, isValid) => {
    e.stopPropagation();
    const res = await fetch(`/api/cards/${id}/answer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isValid })
    });
    if (!res.ok) return alert("Trop tôt pour réviser cette carte !");
    setFlippedCardId(null);
    fetchData();
  };

  const saveEdit = async (e, id) => {
    e.stopPropagation();
    await fetch(`/api/cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: editQuestion, answer: editAnswer, userId })
    });
    setEditingId(null); 
    fetchData();
  };

  const deleteCard = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this card?")) return;
    await fetch(`/api/cards/${id}?userId=${userId}`, { method: 'DELETE' });
    fetchData();
  };

  // --- ACTIONS SUR LES DOSSIERS ---

  const createFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName) return;
    await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFolderName, userId })
    });
    setNewFolderName("");
    fetchData();
  };

  // --- FILTRAGE ---

  const filteredCards = cards.filter(c => {
    const inFolder = selectedFolder ? c.folderId === selectedFolder : true;
    const isDue = new Date(c.nextReviewAt) <= new Date();
    return inFolder && (reviewMode ? isDue : true);
  });

  if (!userId) return <Auth onLogin={(id) => { setUserId(id); localStorage.setItem("userId", id); }} />;

  return (
    <div className="app-container">
      <header>
        <h1>FlashMaster</h1>
        <button onClick={handleLogout} className="btn-master btn-danger" style={{position:'absolute', top:20, right:40}}>Logout</button>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <button onClick={() => setReviewMode(!reviewMode)} className={`btn-master ${reviewMode ? 'btn-warning' : 'btn-gradient'}`} style={{ marginBottom: '25px', width: '100%' }}>
            {reviewMode ? "🎯 Exit Review" : "🚀 Start Review Mode"}
          </button>

          {/* Formulaire Dossier */}
          <div className="card-form" style={{marginBottom: '20px'}}>
            <h3>New Folder</h3>
            <form onSubmit={createFolder} style={{display:'flex', gap:'5px'}}>
              <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name..." />
              <button type="submit" className="btn-master btn-success">+</button>
            </form>
          </div>

          {/* Formulaire Carte */}
          <div className="card-form">
            <h3>New Card</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await fetch('/api/cards', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({question, answer, userId, folderId: targetFolderId || selectedFolder}) });
              setQuestion(""); setAnswer(""); fetchData();
            }}>
              <select value={targetFolderId} onChange={e => setTargetFolderId(e.target.value)}>
                <option value="">📂 Root</option>
                {folders.map(f => <option key={f._id} value={f._id}>📁 {f.name}</option>)}
              </select>
              <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Question" required />
              <input value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Answer" required />
              <button type="submit" className="btn-master btn-gradient" style={{width: '100%'}}>Add Card</button>
            </form>
          </div>
        </aside>

        <main className="main-content">
          <div className="folders-bar">
            <button onClick={() => setSelectedFolder(null)} className={`btn-folder ${!selectedFolder ? 'active' : ''}`}>All</button>
            {folders.map(f => (
              <button key={f._id} onClick={() => setSelectedFolder(f._id)} className={`btn-folder ${selectedFolder === f._id ? 'active' : ''}`}>{f.name}</button>
            ))}
          </div>

          <div className="card-grid">
            {filteredCards.map(card => {
              const isEarly = new Date(card.nextReviewAt) > new Date();

              if (editingId === card._id) {
                return (
                  <div key={card._id} className="flashcard">
                    <div className="flashcard-front" style={{border: '2px solid var(--primary)', padding:'15px'}}>
                        <input value={editQuestion} onChange={e => setEditQuestion(e.target.value)} />
                        <input value={editAnswer} onChange={e => setEditAnswer(e.target.value)} />
                        <div style={{display:'flex', gap:'5px', width:'100%'}}>
                          <button onClick={(e) => saveEdit(e, card._id)} className="btn-master btn-success" style={{flex:1}}>Save</button>
                          <button onClick={() => setEditingId(null)} className="btn-master btn-danger" style={{flex:1}}>X</button>
                        </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={card._id} className={`flashcard ${flippedCardId === card._id ? 'flipped' : ''}`} onClick={() => setFlippedCardId(flippedCardId === card._id ? null : card._id)}>
                  <div className="flashcard-inner">
                    <div className="flashcard-front">
                      <span className="badge">LVL {card.category || 1}</span>
                      <p>{card.question}</p>
                      <div className="card-footer-actions">
                        <button onClick={(e) => { e.stopPropagation(); setEditingId(card._id); setEditQuestion(card.question); setEditAnswer(card.answer); }} className="btn-icon">✏️</button>
                        <button onClick={(e) => deleteCard(e, card._id)} className="btn-icon">🗑️</button>
                      </div>
                    </div>
                    <div className="flashcard-back">
                      <p>{card.answer}</p>
                      <div className="review-actions">
                        {isEarly ? <p>⏳ Due {new Date(card.nextReviewAt).toLocaleDateString()}</p> : (
                          <>
                            <button onClick={e => handleAnswer(e, card._id, false)} className="btn-master btn-danger">❌</button>
                            <button onClick={e => handleAnswer(e, card._id, true)} className="btn-master btn-success">✅</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;