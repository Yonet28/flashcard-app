import express from "express";
import { register, login } from "../controllers/user.controller.js";

const router = express.Router();

// Route to register a new user account and assign initial roles
router.post("/register", register);

// Route to authenticate a user and generate a JWT session token
router.post("/login", login);

export default router;