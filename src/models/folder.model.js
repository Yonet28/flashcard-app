import mongoose from "mongoose";

// Schema definition for the Folder model used to group flashcards
const folderSchema = new mongoose.Schema(
  {
    // The display name of the folder
    name: { type: String, required: true },
    
    // The ID of the user who created the folder
    userId: { type: String, required: true },
    
    // Flag to determine if the folder is public/global (e.g., created by an admin)
    // If true, it is accessible to all users
    isGlobal: { type: Boolean, default: false }
  },
  { 
    // Automatically adds 'createdAt' and 'updatedAt' fields to the document
    timestamps: true 
  }
);

// Exporting the model to perform CRUD operations on the 'folders' collection
export default mongoose.model("Folder", folderSchema);