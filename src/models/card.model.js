import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
    
    // Logique Leitner (Niveaux 1 à 7)
    category: { 
      type: Number, 
      default: 1, 
      min: 1, 
      max: 7 
    },
    nextReviewAt: { 
      type: Date, 
      default: Date.now 
    },
    lastReviewedAt: { type: Date, default: null } 
  },
  { timestamps: true }
);

export default mongoose.model("Card", cardSchema);