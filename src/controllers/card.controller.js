import Card from "../models/card.model.js";
import Folder from "../models/folder.model.js"; 
import xss from "xss";

export async function listCards(req, res) {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing UserId" });

    const globalFolders = await Folder.find({ isGlobal: true }).select('_id');
    
    const globalFolderIds = globalFolders.map(f => f._id.toString());

    const cards = await Card.find({
        $or: [
            { userId: userId },
            { folderId: { $in: globalFolderIds } }
        ]
    }).sort({ createdAt: -1 });

    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCard(req, res) {
    try {
        let { question, answer, userId, folderId } = req.body;
    
        if (!question || !question.trim() || !answer || !answer.trim()) {
            return res.status(400).json({ error: "Question and answer cannot be empty." });
        }
    
        question = xss(question);
        answer = xss(answer);
    
        const newCard = await Card.create({ 
            question, 
            answer, 
            userId, 
            folderId, 
            lastReviewedAt: new Date()
        });
        
        res.status(201).json({ message: "Card created", id: newCard._id, card: newCard });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
}

export async function updateCard(req, res) {
    try {
        const { id } = req.params;
        let { question, answer, userId } = req.body; 
    
        if (!question && !answer) return res.status(400).json({ error: "No data to update" });
    
        const cardToUpdate = await Card.findById(id);
        if (!cardToUpdate) return res.status(404).json({ error: "Card not found" });
    
        if (cardToUpdate.userId.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized action" });
        }
    
        if (question) question = xss(question);
        if (answer) answer = xss(answer);
    
        const updatedCard = await Card.findByIdAndUpdate(
            id, 
            { question, answer, lastReviewedAt: new Date() }, 
            { new: true }
        );
    
        res.status(200).json({ message: "Card updated", card: updatedCard });
      } catch (err) {
        res.status(500).json({ error: "Update error" });
      }
}

export async function deleteCard(req, res) {
    try {
        const { id } = req.params;
        await Card.findByIdAndDelete(id);
        res.status(200).json({ message: "Card deleted" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}