import Folder from "../models/folder.model.js";
import User from "../models/user.model.js"; 

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