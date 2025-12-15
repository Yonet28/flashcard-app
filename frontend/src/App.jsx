import { useState, useEffect } from 'react';
import Auth from './Auth';
import './App.css';

function App() {
  // --- STATES ---
  const [folders, setFolders] = useState([]); 
  const [selectedFolder, setSelectedFolder] = useState(null); 
  const [newFolderName, setNewFolderName] = useState(""); 
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  
  const [cards, setCards] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [flippedCardId, setFlippedCardId] = useState(null);

  const [editingId, setEditingId] = useState(null); 
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  // --- AUTH MANAGEMENT ---
  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id);
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
  };

  // --- API: FETCH DATA ---
  const fetchCards = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/cards?userId=${userId}`);
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  // Fetch user folders
  const fetchFolders = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/folders?userId=${userId}`);
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  // Initial load
  useEffect(() => {
    if (userId) {
      fetchCards();
      fetchFolders();
    }
  }, [userId]);

  // --- API: ACTIONS ---

  // Create a new folder
  const createFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName) return;

    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, userId })
      });
      setNewFolderName(""); // Clear input
      fetchFolders(); // Reload list
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  // Create a card (linked to selected folder)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newCard = { 
        question, 
        answer, 
        userId,
        folderId: selectedFolder 
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
    if (window.confirm("Are you sure you want to delete this card?")) {
        await fetch(`/api/cards/${id}`, { method: 'DELETE' });
        fetchCards();
    }
  };

  // --- EDIT MANAGEMENT ---
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

  // FILTERING: Show only cards from the selected folder
  const filteredCards = selectedFolder 
    ? cards.filter(card => card.folderId === selectedFolder) 
    : cards;

  // --- RENDER ---
  if (!userId) {
    return (
      <div className="app-container">
        <header><h1>🧠 FlashMaster</h1><p>Get connected to study</p></header>
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
        <div><h1>🧠 FlashMaster</h1><p>Welcome to your space</p></div>
        <button onClick={handleLogout} className="btn-delete" style={{marginTop:0, background: '#ef4444'}}>Logout</button>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="card-form">
            <h2>New Card</h2>
            {selectedFolder && <p style={{fontSize: '0.8rem', color: '#00cec9', marginBottom: '10px'}}>In: Selected Folder</p>}
            <form onSubmit={handleSubmit}>
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
            {/* FOLDER NAVIGATION BAR */}
            <div className="folders-bar" style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <button 
                    onClick={() => setSelectedFolder(null)} 
                    style={{ background: selectedFolder === null ? "#00cec9" : "#333", border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', color: 'white' }}
                >
                📂 All
                </button>

                {folders.map(folder => (
                    <button 
                        key={folder._id} 
                        onClick={() => setSelectedFolder(folder._id)}
                        style={{ background: selectedFolder === folder._id ? "#00cec9" : "#333", border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', color: 'white' }}
                    >
                        📁 {folder.name}
                    </button>
                ))}

                <form onSubmit={createFolder} style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
                    <input 
                        type="text" 
                        placeholder="New folder..." 
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        style={{ padding: "8px", borderRadius: "5px", border: "1px solid #444", background: "#222", color: "white" }}
                    />
                    <button type="submit" style={{cursor: 'pointer', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '5px'}}>➕</button>
                </form>
            </div>

            {/* CARD GRID */}
            <div className="card-grid">
            {filteredCards.length === 0 && <p style={{color: '#666', gridColumn: '1 / -1', textAlign: 'center'}}>No cards in this folder.</p>}
            
            {filteredCards.map((card) => (
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
                            placeholder="Modify the question"
                            onClick={(e) => e.stopPropagation()} 
                        />
                        <input 
                            value={editAnswer} 
                            onChange={(e) => setEditAnswer(e.target.value)} 
                            placeholder="Modify the answer"
                            onClick={(e) => e.stopPropagation()}
                        />
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
                        <div className="actions-bar">
                            <button onClick={(e) => startEditing(e, card)} className="btn-icon">Modify</button>
                        </div>
                        <span className="hint">Click to flip ↻</span>
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