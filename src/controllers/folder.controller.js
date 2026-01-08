import Folder from "../models/folder.model.js";
import User from "../models/user.model.js"; 
import Card from "../models/card.model.js";

// List folders (for user and global)
export async function listFolders(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "UserId is required" });
    
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

// Create folder (If admin, it becomes global)
export async function createFolder(req, res) {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) return res.status(400).json({ error: "Name and UserId are required" });

    // Check user role
    const user = await User.findById(userId);
    
    // Determine if folder should be global
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

export async function deleteFolder(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body; 

    const folder = await Folder.findById(id);
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    const user = await User.findById(userId);

    const isOwner = folder.userId.toString() === userId;
    const isAdmin = user && user.role === 'admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Forbidden: You are not the owner or admin." });
    }

    await Card.deleteMany({ folderId: id });

    await folder.deleteOne();

    res.status(200).json({ message: "Folder and content deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}