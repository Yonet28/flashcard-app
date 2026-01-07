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

export async function updateCard(req, res) {
    try {
        const { id } = req.params;
        let { question, answer, userId } = req.body; 
        const card = await Card.findById(id);
        if (!card || card.userId.toString() !== userId) return res.status(403).json({ error: "Unauthorized" });

        const updated = await Card.findByIdAndUpdate(id, { 
            question: xss(question), 
            answer: xss(answer) 
        }, { new: true });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteCard(req, res) {
    try {
        await Card.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

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
            // BLOQUAGE : On ne peut pas monter de niveau si on est en avance
            if (isEarly) {
                return res.status(400).json({ 
                    error: "Trop tôt ! Vous ne pouvez pas augmenter le niveau avant la date prévue." 
                });
            }
            card.category = Math.min(card.category + 1, 7);
        } else {
            // On peut toujours réinitialiser si on a oublié, même en avance
            card.category = 1;
        }

        // Calcul du nouveau délai : 2^(cat-1) jours
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