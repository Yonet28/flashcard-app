import Card from "../models/card.model.js";
import xss from "xss"; // Library for security sanitization

// LIST CARDS 
export async function listCards(req, res) {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing UserId" });

    const cards = await Card.find({ userId: userId }).sort({ createdAt: -1 });
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCard(req, res) {
  try {
    let { question, answer, userId, folderId } = req.body;

    // Check for empty fields
    if (!question || !question.trim() || !answer || !answer.trim()) {
        return res.status(400).json({ error: "Question and answer cannot be empty." });
    }

    // HTML Sanitization for security
    question = xss(question);
    answer = xss(answer);

    const newCard = await Card.create({ 
        question, 
        answer, 
        userId, 
        folderId,
        lastReviewedAt: new Date()  // Initialize review timestamp
    });
    
    res.status(201).json({ message: "Card created", id: newCard._id, card: newCard });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// UPDATE CARD 
export async function updateCard(req, res) {
  try {
    const { id } = req.params;
    let { question, answer, userId } = req.body; // userId is required for authorization

    // Basic Validation
    if (!question && !answer) {
      return res.status(400).json({ error: "No data to update" });
    }

    // Fetch card to check ownership
    const cardToUpdate = await Card.findById(id);
    if (!cardToUpdate) {
        return res.status(404).json({ error: "Card not found" });
    }

    // AUTHORIZATION CHECK
    // Prevent a user from modifying someone else's card
    if (cardToUpdate.userId.toString() !== userId) {
        return res.status(403).json({ error: "Unauthorized action: this is not your card." });
    }

    // XSS Sanitization
    if (question) question = xss(question);
    if (answer) answer = xss(answer);

    // Update with new review date
    const updatedCard = await Card.findByIdAndUpdate(
        id, 
        { 
            question, 
            answer, 
            lastReviewedAt: new Date() // Update review timestamp
        }, 
        { new: true } // Return the updated document
    );

    res.status(200).json({ message: "Card updated", card: updatedCard });
  } catch (err) {
    res.status(500).json({ error: "Update error" });
  }
}

// DELETE CARD 
export async function deleteCard(req, res) {
  try {
    const { id } = req.params;
    
    await Card.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Card deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}