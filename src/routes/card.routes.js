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

router.get("/", listCards);
router.post("/", createCard);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);
router.post("/:id/review", submitReview);
// Route pour mettre à jour la progression d'une carte
router.patch("/:id/answer", answerCard); 

export default router;