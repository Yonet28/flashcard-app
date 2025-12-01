import Card from "../models/card.model.js";

export async function listCards(req, res) {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "UserId manquant" });

    const cards = await Card.find({ userId: userId });
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCard(req, res) {
  try {
    const { question, answer, userId } = req.body;
    const newCard = await Card.create({ question, answer, userId });
    res.status(201).json({ message: "Carte créée", id: newCard._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateCard(req, res) {
  try {
    const { id } = req.params;
    await Card.findByIdAndUpdate(id, req.body);
    res.status(200).json({ message: "Carte mise à jour" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteCard(req, res) {
  try {
    const { id } = req.params;
    await Card.findByIdAndDelete(id);
    res.status(200).json({ message: "Carte supprimée" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}