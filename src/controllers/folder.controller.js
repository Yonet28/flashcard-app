import Folder from "../models/folder.model.js";

// List all folders for a user
export async function listFolders(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "UserId is required" });
    
    const folders = await Folder.find({ userId });
    res.status(200).json(folders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Create a folder
export async function createFolder(req, res) {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) return res.status(400).json({ error: "Name and UserId are required" });

    const newFolder = await Folder.create({ name, userId });
    res.status(201).json(newFolder);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}