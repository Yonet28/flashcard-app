import express from "express";
import { listFolders, createFolder, deleteFolder } from "../controllers/folder.controller.js";

const router = express.Router();

router.get("/", listFolders);

router.post("/", createFolder);

router.delete("/:id", deleteFolder);

export default router;