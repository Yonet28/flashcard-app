import User from "../models/user.model.js";

export async function register(req, res) {
  try {
    const { username, password } = req.body;
    const newUser = await User.create({ username, password });
    res.status(201).json({ message: "Compte créé !", id: newUser._id });
  } catch (err) {
    res.status(400).json({ error: "Erreur ou pseudo déjà pris" });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }
    res.status(200).json({ message: "Connexion réussie", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}