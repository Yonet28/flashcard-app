import Card from "../models/card.model.js";
import User from "../models/user.model.js"; 
import Folder from "../models/folder.model.js"; 
import CardProgress from "../models/cardProgress.model.js";
import xss from "xss";

// Retrieves the list of cards (personal and global) along with the associated progress
export async function listCards(req, res) {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing UserId" });

    // Finds folders marked as global to include their cards
    const globalFolders = await Folder.find({ isGlobal: true }).select('_id');
    const globalFolderIds = globalFolders.map(f => f._id.toString());

    // Fetches cards belonging to the user or located in a global folder
    const cards = await Card.find({
        $or: [
            { userId: userId },
            { folderId: { $in: globalFolderIds } }
        ]
    }).sort({ createdAt: -1 }).lean();

    // Fetches the user's learning progress for these cards
    const progresses = await CardProgress.find({ userId: userId }).lean();

    // Merges general card information with specific user progress data
    const personalizedCards = cards.map(card => {
        const userProgress = progresses.find(p => p.cardId.toString() === card._id.toString());

        return {
            ...card, 
            category: userProgress ? userProgress.box : 1, 
            nextReviewAt: userProgress ? userProgress.nextReviewAt : new Date()
        };
    });

    res.status(200).json(personalizedCards);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Creates a new card with XSS sanitization
export async function createCard(req, res) {
    try {
        let { question, answer, userId, folderId } = req.body;
        if (!question || !answer) return res.status(400).json({ error: "Empty fields" });

        const newCard = await Card.create({ 
            question: xss(question), 
            answer: xss(answer), 
            userId, 
            folderId 
        });
        res.status(201).json(newCard);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Updates a card with permission check (Owner or Admin)
export async function updateCard(req, res) {
    try {
        const { id } = req.params;
        let { question, answer, userId, userRole } = req.body; 
    
        if (!question && !answer) return res.status(400).json({ error: "No data to update" });
    
        const cardToUpdate = await Card.findById(id);
        if (!cardToUpdate) return res.status(404).json({ error: "Card not found" });
    
        const isOwner = cardToUpdate.userId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: "Prohibited: You may not touch another person's card." });
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

// Deletes a card after role verification
export async function deleteCard(req, res) {
    try {
        const { id } = req.params;
        const { userId } = req.body; 

        const cardToDelete = await Card.findById(id);
        if (!cardToDelete) return res.status(404).json({ error: "Card not found" });

        const user = await User.findById(userId);
        
        const isOwner = cardToDelete.userId.toString() === userId;
        const isAdmin = user && user.role === 'admin';

        if (!isOwner && !isAdmin) {
             return res.status(403).json({ error: "Prohibited: You do not have the rights." });
        }

        await cardToDelete.deleteOne();
        res.status(200).json({ message: "Card deleted" });

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}

// Processes a card answer and calculates the next review date
export async function answerCard(req, res) {
    try {
        const { id } = req.params;
        const { isValid, userId } = req.body; 

        const card = await Card.findById(id);
        if (!card || card.userId.toString() !== userId) {
            return res.status(403).json({ error: "Non autorisé" });
        }

        const now = new Date();
        const isEarly = now < new Date(card.nextReviewAt);

        if (isValid) {
            // Increases the level if the review is not premature
            if (isEarly) {
                return res.status(400).json({ 
                    error: "Trop tôt ! Vous ne pouvez pas augmenter le niveau avant la date prévue." 
                });
            }
            card.category = Math.min(card.category + 1, 7);
        } else {
            // Resets to level 1 in case of an error
            card.category = 1;
        }

        // Calculates delay based on the Leitner system: 2^(cat-1) days
        const daysToAdd = Math.pow(2, card.category - 1);
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysToAdd);

        card.nextReviewAt = nextDate;
        card.lastReviewedAt = now;

        await card.save();
        res.status(200).json(card);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Specifically handles the individual user progress on a card
export async function submitReview(req, res) {
  try {
    const { id } = req.params; 
    const { userId, isValid } = req.body; 

    let progress = await CardProgress.findOne({ userId: userId, cardId: id });

    // Initializes tracking if this is the first time the user reviews this card
    if (!progress) {
      progress = new CardProgress({ userId: userId, cardId: id, box: 1 });
    }

    if (isValid) {
      progress.box = Math.min(progress.box + 1, 7);
      
      const daysToAdd = Math.pow(2, progress.box - 1); 
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      progress.nextReviewAt = nextDate;
    } else {
      progress.box = 1;
      progress.nextReviewAt = new Date(); 
    }

    await progress.save();

    res.status(200).json({ message: "Progress updated", level: progress.box });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}