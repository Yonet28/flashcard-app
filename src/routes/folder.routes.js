import express from "express";
import { listFolders, createFolder } from "../controllers/folder.controller.js";

const router = express.Router();

router.get("/", listFolders);
router.post("/", createFolder);

export default router;