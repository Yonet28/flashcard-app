import express from "express";
import { listCards, createCard, updateCard, deleteCard } from "../controllers/card.controller.js";

const router = express.Router();

router.get("/", listCards);
router.post("/", createCard);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);

export default router;