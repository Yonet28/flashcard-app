import { useState, useEffect } from 'react';
import Auth from './Auth';
import './App.css';

function App() {
  // STATES 
  const [folders, setFolders] = useState([]); 
  const [selectedFolder, setSelectedFolder] = useState(null); 
  const [targetFolderId, setTargetFolderId] = useState("");   
  const [newFolderName, setNewFolderName] = useState(""); 
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  
  const [cards, setCards] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [flippedCardId, setFlippedCardId] = useState(null);

  const [editingId, setEditingId] = useState(null); 
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  // AUTH 
  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id);
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
  };

  // API FETCH 
  const fetchCards = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/cards?userId=${userId}`);
      const data = await response.json();
      setCards(data);
    } catch (error) { console.error("Error fetching cards:", error); }
  };

  const fetchFolders = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/folders?userId=${userId}`);
      const data = await response.json();
      setFolders(data);
    } catch (error) { console.error("Error fetching folders:", error); }
  };

  useEffect(() => {
    if (userId) {
      fetchCards();
      fetchFolders();
    }
  }, [userId]);

  // ACTIONS 

  const createFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName) return;
    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, userId })
      });
      setNewFolderName("");
      fetchFolders();
    } catch (error) { console.error("Error creating folder:", error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const folderToUse = targetFolderId || selectedFolder;

    const newCard = { 
        question, 
        answer, 
        userId,
        folderId: folderToUse || null 
    };

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
    if (window.confirm("Delete this card?")) {
        await fetch(`/api/cards/${id}`, { method: 'DELETE' });
        fetchCards();
    }
  };

  // EDIT 
  const saveEdit = async (e, id) => {
    e.stopPropagation();
    await fetch(`/api/cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: editQuestion, answer: editAnswer, userId })
    });
    setEditingId(null); 
    fetchCards();
  };

  const startEditing = (e, card) => { e.stopPropagation(); setEditingId(card._id); setEditQuestion(card.question); setEditAnswer(card.answer); setFlippedCardId(null); };
  const cancelEdit = (e) => { e.stopPropagation(); setEditingId(null); };
  const handleCardClick = (id) => { if (editingId === id) return; setFlippedCardId(flippedCardId === id ? null : id); };

  // Filter logic
  const filteredCards = selectedFolder 
    ? cards.filter(card => card.folderId === selectedFolder) 
    : cards;

  // RENDER 
  if (!userId) return <div className="app-container"><Auth onLogin={handleLogin} /></div>;

  return (
    <div className="app-container">
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>🧠 FlashMaster</h1>
        <button onClick={handleLogout} className="btn-delete" style={{marginTop:0, background: '#ef4444'}}>Logout</button>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="card-form">
            <h2>New Card</h2>
            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label>Folder</label>
                <select 
                    value={targetFolderId} 
                    onChange={(e) => setTargetFolderId(e.target.value)}
                    style={{width: '100%', padding: '8px', borderRadius: '5px', background: '#333', color: 'white', border: '1px solid #555'}}
                >
                    <option value="">📂 No Folder (Root)</option>
                    {folders.map(folder => (
                        <option key={folder._id} value={folder._id}>📁 {folder.name}</option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Question</label>
                <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ex: Capital of France?" required />
              </div>
              <div className="form-group">
                <label>Answer</label>
                <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Ex: Paris" required />
              </div>
              <button type="submit" className="btn-add">Add Card</button>
            </form>
          </div>
        </aside>

        <main className="main-content">
            <div className="folders-bar" style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <button 
                    onClick={() => { setSelectedFolder(null); setTargetFolderId(""); }} 
                    style={{ background: selectedFolder === null ? "#00cec9" : "#333", border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', color: 'white' }}
                >
                📂 All Cards
                </button>

                {folders.map(folder => (
                    <button 
                        key={folder._id} 
                        onClick={() => { setSelectedFolder(folder._id); setTargetFolderId(folder._id); }}
                        style={{ background: selectedFolder === folder._id ? "#00cec9" : "#333", border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', color: 'white' }}
                    >
                        📁 {folder.name}
                    </button>
                ))}

                <form onSubmit={createFolder} style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
                    <input type="text" placeholder="New folder..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} style={{ padding: "8px", borderRadius: "5px", border: "1px solid #444", background: "#222", color: "white" }} />
                    <button type="submit" style={{cursor: 'pointer', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '5px'}}>➕</button>
                </form>
            </div>

            <div className="card-grid">
            {filteredCards.length === 0 && <p style={{color: '#666', gridColumn: '1 / -1', textAlign: 'center'}}>No cards here.</p>}
            
            {filteredCards.map((card) => (
                <div key={card._id} className={`flashcard ${flippedCardId === card._id ? 'flipped' : ''}`} onClick={() => handleCardClick(card._id)}>
                    {editingId === card._id ? (
                        <div className="card-edit-form">
                            <input value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)} onClick={(e) => e.stopPropagation()} />
                            <input value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} onClick={(e) => e.stopPropagation()} />
                            <div className="edit-actions">
                                <button onClick={(e) => saveEdit(e, card._id)} className="btn-save">Save</button>
                                <button onClick={cancelEdit} className="btn-cancel">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flashcard-inner">
                            <div className="flashcard-front">
                                <span className="badge question">Question</span>
                                <p className="card-text">{card.question}</p>
                                <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '10px' }}>
                                    Last reviewed: {card.lastReviewedAt ? new Date(card.lastReviewedAt).toLocaleDateString('en-US') : "Never"}
                                </p>
                                <div className="actions-bar"><button onClick={(e) => startEditing(e, card)} className="btn-icon">Modify</button></div>
                            </div>
                            <div className="flashcard-back">
                                <span className="badge answer">Answer</span>
                                <p className="card-text">{card.answer}</p>
                                <button onClick={(e) => handleDelete(e, card._id)} className="btn-delete">Delete</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            </div>
        </main>
      </div>
    </div>
  );
}

export default App;