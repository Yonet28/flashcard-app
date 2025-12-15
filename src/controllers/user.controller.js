import User from "../models/user.model.js";

export async function register(req, res) {
  try {
    const { username, password } = req.body;
    const newUser = await User.create({ username, password });
    res.status(201).json({ message: "Account created !", id: newUser._id });
  } catch (err) {
    res.status(400).json({ error: "Error or username already taken" });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Incorrect credentials" });
    }
    res.status(200).json({ message: "Login successful", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}