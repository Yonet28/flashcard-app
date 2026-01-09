import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Secret key used to sign the authentication tokens
const SECRET_KEY = process.env.JWT_SECRET || "votre_cle_secrete_temporaire";

// Handles new user registration and initial role assignment
export async function register(req, res) {
  try {
    const { username, password } = req.body;
    
    // Automatically assigns the 'admin' role if the username is "admin"
    const role = (username.toLowerCase() === "admin") ? "admin" : "user";

    // Securely hashes the password using bcrypt with a salt factor of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creates the new user record in the database
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

// Authenticates a user and generates a JWT session token
export async function login(req, res) {
  try {
    const { username, password } = req.body;
    
    // Attempts to find the user in the database by their username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compares the submitted plain-text password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Generates a signed JWT containing the user's ID and role, valid for 24 hours
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