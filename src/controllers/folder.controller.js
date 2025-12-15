import Folder from "../models/folder.model.js";

export async function listFolders(req, res) {
  try {
    const { userId } = req.query;
    const folders = await Folder.find({ userId });
    res.status(200).json(folders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function createFolder(req, res) {
  try {
    const { name, userId } = req.body;
    const newFolder = await Folder.create({ name, userId });
    res.status(201).json(newFolder);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}