import { useState, useEffect } from 'react';
import Auth from './Auth';
import './App.css';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [folders, setFolders] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null); // null = Menu Principal
  
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
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
    } catch (e) { console.error("Loading error:", e); }
  };

  useEffect(() => { if (userId) fetchData(); }, [userId]);

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
    window.location.reload();
  };

  // --- ACTIONS DOSSIERS ---
  const deleteFolder = async (e, folderId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this folder ?")) return;

    const response = await fetch(`/api/folders/${folderId}`, { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }) 
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error); 
        return; 
    }

    if (selectedFolder === folderId) setSelectedFolder(null);
    fetchData();
};

  // --- ACTIONS CARTES ---
  const handleAnswer = async (e, id, isValid) => {
    e.stopPropagation();
    const res = await fetch(`/api/cards/${id}/answer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isValid })
    });
    if (!res.ok) return alert("Too early to revise!");
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
    if (!window.confirm("Delete this card ?")) return;

    const response = await fetch(`/api/cards/${id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }) 
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error); 
        return; 
    }

    fetchData();
};

  const filteredCards = cards.filter(c => {
    const inFolder = selectedFolder ? c.folderId === selectedFolder : true;
    const isDue = new Date(c.nextReviewAt) <= new Date();
    return inFolder && (reviewMode ? isDue : true);
  });

  const currentFolder = folders.find(f => f._id === selectedFolder);

  if (!userId) return <Auth onLogin={(id) => { setUserId(id); localStorage.setItem("userId", id); }} />;

  return (
    <div className="app-container">
      <header>
        <h1 onClick={() => setSelectedFolder(null)} style={{cursor:'pointer'}}>FlashMaster</h1>
        <button onClick={handleLogout} className="btn-master btn-danger" style={{position:'absolute', top:20, right:40}}>Logout</button>
      </header>

      {selectedFolder && currentFolder && (
        <div className="folder-banner">
            <h1>📂 {currentFolder.name}</h1>
            <span className="folder-badge">
            </span>
            </div>
      )}


      {!selectedFolder && !reviewMode ? (
        /* --- MENU PRINCIPAL --- */
        <div className="main-menu-container">
          <h2 style={{textAlign: 'center', marginBottom: '40px', fontSize: '2rem'}}>My Folders</h2>
          <div className="folder-grid">
            {folders.map(f => (
              <div 
                key={f._id} 
                // CORRECTION 1 : On utilise les backticks `` et on vérifie 'isGlobal'
                className={`folder-item card-form ${f.isGlobal ? 'global' : ''}`} 
                onClick={() => setSelectedFolder(f._id)}
              >
                <div style={{fontSize: '3rem', marginBottom: '10px'}}>📁</div>
                
                <h3 style={{margin: '10px 0'}}>
                  {/* CORRECTION 2 : On remplace 'isAdmin' par 'isGlobal' */}
                  {f.isGlobal ? `⭐ ${f.name}` : f.name}
                </h3>
                
                <button 
                  className="delete-btn-icon" 
                  onClick={(e) => { e.stopPropagation(); deleteFolder(e, f._id); }}
                  title="Delete folder"
                >
                  🗑️
                </button>
              </div>
            ))}
            <div className="folder-item card-form add-folder">
              <form onSubmit={async (e) => {
                e.preventDefault();
                await fetch('/api/folders', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name: newFolderName, userId}) });
                setNewFolderName(""); fetchData();
              }}>
                <input value={newFolderName} onChange={e=>setNewFolderName(e.target.value)} placeholder="Folder name..." />
                <button type="submit" className="btn-master btn-success" style={{width:'100%'}}>Create</button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* --- VUE DASHBOARD --- */
        <div className="dashboard-layout">
          <aside className="sidebar">
            <button onClick={() => setSelectedFolder(null)} className="btn-master btn-dark" style={{width:'100%', marginBottom:'10px'}}>← Main Menu</button>
            <button onClick={() => setReviewMode(!reviewMode)} className={`btn-master ${reviewMode ? 'btn-warning' : 'btn-gradient'}`} style={{ marginBottom: '25px', width: '100%' }}>
              {reviewMode ? "🎯 Exit Review" : "🚀 Start Review Mode"}
            </button>

            {!reviewMode && (
              <div className="card-form">
                <h3 style={{marginTop:0}}>New Card</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  await fetch('/api/cards', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({question, answer, userId, folderId: selectedFolder}) });
                  setQuestion(""); setAnswer(""); fetchData();
                }}>
                  <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Question" required />
                  <input value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Answer" required />
                  <button type="submit" className="btn-master btn-gradient" style={{width: '100%'}}>Add Card</button>
                </form>
              </div>
            )}
          </aside>

          <main className="main-content">
            <div className="card-grid">
              {filteredCards.map(card => (
                  <div key={card._id} className={`flashcard ${flippedCardId === card._id ? 'flipped' : ''}`} onClick={() => setFlippedCardId(flippedCardId === card._id ? null : card._id)}>
                    <div className="flashcard-inner">
                      
                      <div className="flashcard-front" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                        
                        <span className="badge">LVL {card.category || 1}</span>
                        
                        {editingId === card._id ? (
                          <div onClick={e => e.stopPropagation()} style={{width:'100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                            <input value={editQuestion} onChange={e => setEditQuestion(e.target.value)} style={{marginBottom: '10px'}} />
                            <input value={editAnswer} onChange={e => setEditAnswer(e.target.value)} style={{marginBottom: '10px'}} />
                            <button onClick={(e) => saveEdit(e, card._id)} className="btn-master btn-success" style={{width:'100%'}}>Save</button>
                          </div>
                        ) : (
                          <>
                            <p className="card-text" style={{
                                flex: 1, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                margin: 0, 
                                textAlign: 'center'
                            }}>
                                {card.question}
                            </p>
                            
                            <div className="card-actions-text">
                              <button onClick={(e) => { e.stopPropagation(); setEditingId(card._id); setEditQuestion(card.question); setEditAnswer(card.answer); }} className="text-btn edit">edit</button>
                              <button onClick={(e) => deleteCard(e, card._id)} className="text-btn delete">Delete</button>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flashcard-back" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                        <p className="card-text" style={{
                            flex: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: 0,
                            textAlign: 'center'
                        }}>
                            {card.answer}
                        </p>

                        <p style={{
                            textAlign: 'center', 
                            fontSize: '0.85rem', 
                            color: '#aaa', 
                            marginBottom: '5px',
                            marginTop: '0'
                        }}>
                             Scheduled for : {new Date(card.nextReviewAt).toLocaleDateString()}
                        </p>

                        <div className="review-actions" style={{display:'flex', gap:'10px', marginTop:'5px'}}>
                          <button onClick={e => handleAnswer(e, card._id, false)} className="btn-master btn-danger" style={{flex: 1}}>
                              False
                          </button>
                          <button onClick={e => handleAnswer(e, card._id, true)} className="btn-master btn-success" style={{flex: 1}}>
                              True
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;