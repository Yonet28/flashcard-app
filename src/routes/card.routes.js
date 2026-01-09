import express from "express";
import { 
    listCards, 
    createCard, 
    updateCard, 
    deleteCard, 
    answerCard,
    submitReview 
} from "../controllers/card.controller.js";

const router = express.Router();

// Get all flashcards (user-owned and global)
router.get("/", listCards);

// Create a new flashcard
router.post("/", createCard);

// Update an existing card's content by its ID
router.put("/:id", updateCard);

// Delete a specific card by its ID
router.delete("/:id", deleteCard);

// Submit a review result to update card progress
router.post("/:id/review", submitReview);

// Specific route to update a card's Leitner progression after an answer
router.patch("/:id/answer", answerCard); 

export default router;