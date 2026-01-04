import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "votre_cle_secrete_temporaire";

export async function register(req, res) {
  try {
    const { username, password } = req.body;
    
    const role = (username.toLowerCase() === "admin") ? "admin" : "user";

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ 
        username, 
        password: hashedPassword, 
        role 
    });
    
    res.status(201).json({ 
        message: "Account created successfully!", 
        id: newUser._id, 
        role: newUser.role 
    });
  } catch (err) {
    res.status(400).json({ error: "Username already taken or invalid data" });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign(
        { userId: user._id, role: user.role }, 
        SECRET_KEY, 
        { expiresIn: '24h' }
    );

    res.status(200).json({ 
        message: "Login successful", 
        userId: user._id,
        role: user.role,
        token: token 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}