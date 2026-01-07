import express from "express";
import { 
    listCards, 
    createCard, 
    updateCard, 
    deleteCard, 
    answerCard 
} from "../controllers/card.controller.js";

const router = express.Router();

router.get("/", listCards);
router.post("/", createCard);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);

// Route pour mettre à jour la progression d'une carte
router.patch("/:id/answer", answerCard); 

export default router;