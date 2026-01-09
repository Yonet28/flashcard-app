import Folder from "../models/folder.model.js";
import User from "../models/user.model.js"; 
import Card from "../models/card.model.js";

// Fetch all folders available to a user, including their own and global ones
export async function listFolders(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "UserId is required" });
    
    // Retrieve folders that belong to the user OR are marked as global/public
    const folders = await Folder.find({
        $or: [
            { userId: userId },
            { isGlobal: true }
        ]
    });

    res.status(200).json(folders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Create a new folder; automatically sets it to global if the creator is an admin
export async function createFolder(req, res) {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) return res.status(400).json({ error: "Name and UserId are required" });

    // Identify the user to check their permission level
    const user = await User.findById(userId);
    
    // If the user has an 'admin' role, the folder is accessible to everyone by default
    const isGlobal = (user && user.role === "admin");

    const newFolder = await Folder.create({ 
        name, 
        userId,
        isGlobal 
    });

    res.status(201).json(newFolder);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// Delete a folder and its associated cards if the user is the owner or an admin
export async function deleteFolder(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body; 

    const folder = await Folder.findById(id);
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    const user = await User.findById(userId);

    // Permission check: ensure the requester is the folder owner or an administrator
    const isOwner = folder.userId.toString() === userId;
    const isAdmin = user && user.role === 'admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Forbidden: You are not the owner or admin." });
    }

    // Cascade delete: remove all cards contained within this folder first
    await Card.deleteMany({ folderId: id });

    // Finalize removal of the folder record
    await folder.deleteOne();

    res.status(200).json({ message: "Folder and content deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}