import express from "express";
import { listFolders, createFolder, deleteFolder } from "../controllers/folder.controller.js";

const router = express.Router();

// Route to fetch all folders (personal and global) for a specific user
router.get("/", listFolders);

// Route to create a new folder (handles global status based on user role)
router.post("/", createFolder);

// Route to delete a folder and all its associated flashcards by ID
router.delete("/:id", deleteFolder);

export default router;