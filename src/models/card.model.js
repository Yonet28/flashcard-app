import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    userId: { type: String, required: true },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
    
    lastReviewedAt: { type: Date, default: Date.now } 
  },
  { timestamps: true }
);

export default mongoose.model("Card", cardSchema);