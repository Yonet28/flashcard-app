import mongoose from "mongoose";

// Schema definition for the flashcard model
const cardSchema = new mongoose.Schema(
  {
    // The front and back content of the flashcard
    question: { type: String, required: true },
    answer: { type: String, required: true },
    
    // Ownership and organization references
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
    
    // Leitner System Logic (Levels 1 to 7)
    // Tracks the current 'box' or difficulty level of the card
    category: { 
      type: Number, 
      default: 1, 
      min: 1, 
      max: 7 
    },
    
    // Scheduled date for the next study session
    nextReviewAt: { 
      type: Date, 
      default: Date.now 
    },
    
    // Tracks the last time the user interacted with this card
    lastReviewedAt: { type: Date, default: null } 
  },
  { 
    // Automatically generates 'createdAt' and 'updatedAt' fields
    timestamps: true 
  }
);

// Exporting the model to interact with the 'cards' collection in MongoDB
export default mongoose.model("Card", cardSchema);