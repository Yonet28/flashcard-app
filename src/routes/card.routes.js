import express from "express";
import { getAllCards, createCard, getCardById, deleteCard, updateCard } from "../repositories/card.repository.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: "UserId manquant" });
    }

    const cards = await getAllCards(userId);
    res.status(200).json(cards);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { question, answer, userId } = req.body;
    
    if (!question || !answer || !userId) {
        return res.status(400).json({ error: "Données manquantes (question, réponse ou userId)" });
    }

    const newCard = { 
      question, 
      answer, 
      userId,
      reviewDate: new Date() 
    };
    
    const result = await createCard(newCard);
    res.status(201).json({ message: "Carte créée", id: result.insertedId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question && !answer) {
      return res.status(400).json({ error: "Aucune donnée à modifier" });
    }

    await updateCard(req.params.id, { question, answer });
    res.status(200).json({ message: "Carte mise à jour" });
  } catch (e) {
    res.status(500).json({ error: "Erreur modification" });
  }
});

router.delete("/:id", async (req, res) => {
    try {
        await deleteCard(req.params.id);
        res.status(200).json({ message: "Carte supprimée" });
    } catch (e) {
        res.status(500).json({ error: "Erreur suppression" });
    }
});

export default router;