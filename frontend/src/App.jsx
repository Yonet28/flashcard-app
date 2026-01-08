import { useState, useEffect } from 'react';
import Auth from './Auth';
import './App.css';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [folders, setFolders] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [targetFolderId, setTargetFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  
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
    } catch (e) { console.error("Fetch error:", e); }
  };

  useEffect(() => { if (userId) fetchData(); }, [userId]);

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
    window.location.reload();
  };

  const handleAnswer = async (e, id, isValid) => {
    e.stopPropagation();
    const res = await fetch(`/api/cards/${id}/answer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isValid })
    });
    if (!res.ok) return alert("It's too early to review!");
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
        <p>Master your knowledge with spaced repetition</p>
        <button onClick={handleLogout} className="btn-master btn-danger" style={{position:'absolute', top:20, right:40, padding: '8px 15px'}}>Logout</button>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <button onClick={() => setReviewMode(!reviewMode)} className={`btn-master ${reviewMode ? 'btn-warning' : 'btn-gradient'}`} style={{ marginBottom: '25px', width: '100%' }}>
            {reviewMode ? "🎯 Finish Review" : "🚀 Start Review Mode"}
          </button>
          <div className="card-form">
            <h2>New Card</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await fetch('/api/cards', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({question, answer, userId, folderId: targetFolderId || selectedFolder}) });
              setQuestion(""); setAnswer(""); fetchData();
            }}>
              <div className="form-group">
                <label>Folder</label>
                <select value={targetFolderId} onChange={e => setTargetFolderId(e.target.value)}>
                  <option value="">📂 Root</option>
                  {folders.map(f => <option key={f._id} value={f._id}>📁 {f.name}</option>)}
                </select>
              </div>
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
                    <div className="flashcard-front" style={{border: '2px solid var(--primary)'}}>
                      <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <input value={editQuestion} onChange={e => setEditQuestion(e.target.value)} style={{margin: 0}} />
                        <input value={editAnswer} onChange={e => setEditAnswer(e.target.value)} style={{margin: 0}} />
                        <div style={{display: 'flex', gap: '10px'}}>
                          <button onClick={(e) => saveEdit(e, card._id)} className="btn-master btn-success" style={{flex: 1}}>Save</button>
                          <button onClick={() => setEditingId(null)} className="btn-master btn-danger" style={{flex: 1}}>Cancel</button>
                        </div>
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
                      <p className="card-text">{card.question}</p>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditingId(card._id); 
                          setEditQuestion(card.question); 
                          setEditAnswer(card.answer); 
                          setFlippedCardId(null);
                        }} 
                        className="btn-master btn-dark"
                        style={{marginTop: 'auto', padding: '5px 10px', fontSize: '0.8rem'}}
                      >
                        Modify ✏️
                      </button>
                    </div>
                    <div className="flashcard-back">
                      <p className="card-text">{card.answer}</p>
                      <div className="review-actions" style={{width: '100%', justifyContent: 'center'}}>
                        {isEarly ? (
                          <p style={{fontSize:'0.8rem', opacity:0.8, background: 'rgba(0,0,0,0.2)', padding: '5px 10px', borderRadius: '5px'}}>
                            ⏳ Due {new Date(card.nextReviewAt).toLocaleDateString()}
                          </p>
                        ) : (
                          <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={e => handleAnswer(e, card._id, false)} className="btn-master btn-danger">❌ Forgot</button>
                            <button onClick={e => handleAnswer(e, card._id, true)} className="btn-master btn-success">✅ Got it</button>
                          </div>
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