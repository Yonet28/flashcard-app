import express from "express";
import { createUser, findUserByUsername } from "../repositories/user.repository.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Pseudo et mot de passe requis" });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: "Ce pseudo est déjà pris" });
    }

    const newUser = { username, password, createdAt: new Date() };
    const result = await createUser(newUser);

    res.status(201).json({ message: "Compte créé !", id: result.insertedId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await findUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    res.status(200).json({ message: "Connexion réussie", userId: user._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;