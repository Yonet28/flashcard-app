import { useState, useEffect } from 'react';
import Auth from './Auth';
import './App.css';

/**
 * MAIN APPLICATION COMPONENT
 * This is the core of the FlashMaster app. It handles:
 * 1. User Authentication state.
 * 2. Data synchronization with the backend (Folders & Cards).
 * 3. The Spaced Repetition (Leitner) logic.
 * 4. UI state for navigation and card interaction.
 */
function App() {
  // --- STATE MANAGEMENT: USER AUTH ---
  // Retrieves the logged-in user's ID from local storage to maintain the session
  const [userId, setUserId] = useState(localStorage.getItem("userId"));

  // --- STATE MANAGEMENT: CONTENT DATA ---
  // Stores the list of folders owned by the user
  const [folders, setFolders] = useState([]);
  // Stores all flashcards associated with the user's account
  const [cards, setCards] = useState([]);
  // Tracks which folder is currently selected (null means we are in the Main Menu)
  const [selectedFolder, setSelectedFolder] = useState(null); 
  
  // --- STATE MANAGEMENT: INPUT FORMS ---
  // Temporary storage for text entered in the "New Card" or "New Folder" forms
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  
  // --- STATE MANAGEMENT: UI INTERACTION ---
  // Keeps track of the ID of the card that is currently flipped to its back side
  const [flippedCardId, setFlippedCardId] = useState(null);
  // Toggle switch: if true, only show cards that are due for review today
  const [reviewMode, setReviewMode] = useState(false);
  // Stores the ID of the card being edited to show input fields instead of plain text
  const [editingId, setEditingId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  // --- DATA FETCHING LOGIC ---
  /**
   * Syncs the frontend state with the MongoDB database via the backend API.
   * Uses Promise.all to fetch both cards and folders simultaneously for better performance.
   */
  const fetchData = async () => {
    if (!userId) return; // Do not attempt to fetch data if the user isn't logged in
    try {
      const [resC, resF] = await Promise.all([
        fetch(`/api/cards?userId=${userId}`),
        fetch(`/api/folders?userId=${userId}`)
      ]);
      setCards(await resC.json());
      setFolders(await resF.json());
    } catch (e) { 
      console.error("API Error: Unable to sync with database.", e); 
    }
  };

  /**
   * USEEFFECT HOOK:
   * This runs automatically every time the 'userId' changes.
   * If a user logs in, it immediately triggers the data fetch.
   */
  useEffect(() => { 
    if (userId) fetchData(); 
  }, [userId]);

  // --- AUTHENTICATION HANDLER ---
  /**
   * Wipes the session data from memory and local storage.
   * Reloading the window ensures all sensitive data is cleared and the Auth screen is shown.
   */
  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
    window.location.reload(); 
  };

  // --- FOLDER OPERATIONS ---
  /**
   * Deletes a folder from the database.
   * stopPropagation is used to prevent the app from "entering" the folder while clicking the delete icon.
   */
  const deleteFolder = async (e, folderId) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure? This will delete all cards inside this folder.")) return;

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

    // If the currently viewed folder was the one deleted, return to the Main Menu
    if (selectedFolder === folderId) setSelectedFolder(null);
    fetchData(); // Refresh list
  };

  // --- CARD REVISION SYSTEM (LEITNER ALGORITHM) ---
  /**
   * Handles the "True/False" logic during a study session.
   * CRITICAL SECURITY: Checks if the card is ready for review based on its scheduled date.
   */
  const handleAnswer = async (e, card, isValid) => {
    e.stopPropagation(); // Prevents the card from flipping back over instantly

    // Calculate if the card is "due" (current time >= review time)
    const isDue = new Date(card.nextReviewAt) <= new Date();
    if (!isDue) {
        alert("Patience! This card is scheduled for a later review.");
        return;
    }

    // Sends the review result (correct/incorrect) to the backend to calculate the next date
    const res = await fetch(`/api/cards/${card._id}/review`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isValid })
    });

    if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Failed to update review status.");
    }

    setFlippedCardId(null); // Return card to front state
    fetchData(); // Sync the updated 'nextReviewAt' and 'category' from server
  };

  // --- CARD CRUD (CREATE, UPDATE, DELETE) ---
  /**
   * Submits an update to an existing card.
   */
  const saveEdit = async (e, id) => {
    e.stopPropagation();
    await fetch(`/api/cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: editQuestion, answer: editAnswer, userId })
    });
    setEditingId(null); // Exit edit mode
    fetchData();
  };

  /**
   * Removes a specific card from a folder.
   */
  const deleteCard = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Permanently delete this card?")) return;

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

  // --- DYNAMIC FILTERING LOGIC ---
  /**
   * Filters the master 'cards' array based on two criteria:
   * 1. Is it in the currently selected folder?
   * 2. If 'Review Mode' is ON, is the card currently due?
   */
  const filteredCards = cards.filter(c => {
    const inFolder = selectedFolder ? c.folderId === selectedFolder : true;
    const isDue = new Date(c.nextReviewAt) <= new Date();
    return inFolder && (reviewMode ? isDue : true);
  });

  // Helper to get information about the folder we are currently viewing
  const currentFolder = folders.find(f => f._id === selectedFolder);

  // --- CONDITIONAL RENDERING ---
  // If no user is authenticated, we block the app and show the Auth (Login/Register) screen
  if (!userId) return <Auth onLogin={(id) => { setUserId(id); localStorage.setItem("userId", id); }} />;

  return (
    <div className="app-container">
      {/* GLOBAL HEADER: Visible on all pages */}
      <header className="main-header">
        <h1 onClick={() => setSelectedFolder(null)} style={{cursor:'pointer'}}>FlashMaster</h1>
        <button onClick={handleLogout} className="btn-master btn-danger" style={{position:'absolute', top:20, right:40}}>Logout</button>
      </header>

      {/* DYNAMIC BANNER: Only shows when inside a specific folder */}
      {selectedFolder && currentFolder && (
        <div className="folder-banner" style={{marginBottom: '20px'}}>
            <h1>📂 {currentFolder.name}</h1>
        </div>
      )}

      {/* CONDITIONAL VIEW: Toggle between Main Menu (Folders) and Dashboard (Cards) */}
      {!selectedFolder && !reviewMode ? (
        /* --- VIEW A: THE FOLDER SELECTION SCREEN --- */
        <div className="main-menu-container">
          <h2 style={{textAlign: 'center', marginBottom: '40px', fontSize: '2rem'}}>My Library</h2>
          <div className="folder-grid">
            {/* Map through existing folders */}
            {folders.map(f => (
              <div 
                key={f._id} 
                className={`folder-item card-form ${f.isGlobal ? 'global' : ''}`} 
                onClick={() => setSelectedFolder(f._id)}
              >
                <div style={{fontSize: '3rem', marginBottom: '10px'}}>📁</div>
                <h3 style={{margin: '10px 0'}}>
                  {f.isGlobal ? `⭐ ${f.name}` : f.name}
                </h3>
                <button 
                  className="delete-btn-icon" 
                  onClick={(e) => { e.stopPropagation(); deleteFolder(e, f._id); }}
                >
                  🗑️
                </button>
              </div>
            ))}
            
            {/* THE "ADD NEW FOLDER" INTERFACE */}
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
        /* --- VIEW B: THE CARD DASHBOARD --- */
        <div className="dashboard-layout">
          {/* SIDEBAR: Navigation and Controls */}
          <aside className="sidebar">
            <button onClick={() => setSelectedFolder(null)} className="btn-master btn-dark" style={{width:'100%', marginBottom:'10px'}}>← Back to Library</button>
            <button onClick={() => setReviewMode(!reviewMode)} className={`btn-master ${reviewMode ? 'btn-warning' : 'btn-gradient'}`} style={{ marginBottom: '25px', width: '100%' }}>
              {reviewMode ? "🎯 Finish Session" : "🚀 Start Review Mode"}
            </button>

            {/* QUICK-ADD CARD FORM: Hidden during active review sessions to maintain focus */}
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

          {/* MAIN GRID: Displays the filtered list of flashcards */}
          <main className="main-content">
            <div className="card-grid">
              {filteredCards.map(card => {
                // LEITNER CHECK: Determine if this specific card can be validated
                const isDue = new Date(card.nextReviewAt) <= new Date();

                return (
                  <div 
                    key={card._id} 
                    className={`flashcard ${flippedCardId === card._id ? 'flipped' : ''}`} 
                    onClick={() => setFlippedCardId(flippedCardId === card._id ? null : card._id)}
                  >
                    <div className="flashcard-inner">
                      
                      {/* --- CARD FRONT (QUESTION SIDE) --- */}
                      <div className="flashcard-front">
                        <span className="badge">LVL {card.category || 1}</span>
                        {/* CONDITIONAL RENDER: Edit Form vs Display Text */}
                        {editingId === card._id ? (
                          <div onClick={e => e.stopPropagation()} style={{width:'100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                            <input value={editQuestion} onChange={e => setEditQuestion(e.target.value)} />
                            <input value={editAnswer} onChange={e => setEditAnswer(e.target.value)} />
                            <button onClick={(e) => saveEdit(e, card._id)} className="btn-master btn-success">Update</button>
                          </div>
                        ) : (
                          <>
                            <p className="card-text">{card.question}</p>
                            <div className="card-actions-text">
                              <button onClick={(e) => { e.stopPropagation(); setEditingId(card._id); setEditQuestion(card.question); setEditAnswer(card.answer); }} className="text-btn edit">edit</button>
                              <button onClick={(e) => deleteCard(e, card._id)} className="text-btn delete">Delete</button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* --- CARD BACK (ANSWER SIDE) --- */}
                      <div className="flashcard-back">
                        <p className="card-text">{card.answer}</p>

                        {/* SCHEDULING MESSAGE: Shows when the next review is possible */}
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: isDue ? '#fff' : '#ff4444', marginBottom: '5px' }}>
                            {isDue ? `✅ Study Session Ready` : `⏳ Next: ${new Date(card.nextReviewAt).toLocaleDateString()}`}
                        </p>

                        {/* INTERACTIVE ACTION BUTTONS: Disabled if the card is not due */}
                        <div className="review-actions" style={{display:'flex', gap:'10px'}}>
                          <button 
                            onClick={e => handleAnswer(e, card, false)} 
                            className="btn-master btn-danger" 
                            style={{flex: 1, opacity: isDue ? 1 : 0.4}}
                            disabled={!isDue}
                          >
                            Incorrect
                          </button>
                          <button 
                            onClick={e => handleAnswer(e, card, true)} 
                            className="btn-master btn-success" 
                            style={{flex: 1, opacity: isDue ? 1 : 0.4}}
                            disabled={!isDue}
                          >
                            Correct
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;