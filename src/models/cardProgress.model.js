import mongoose from "mongoose";

// Schema to track individual user progress on specific cards
const cardProgressSchema = mongoose.Schema({
  // Reference to the user studying the card
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Reference to the specific card being studied
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  
  // Represents the current Leitner level (typically 1 to 7)
  box: { type: Number, default: 1 }, 
  
  // The scheduled date and time for the user's next review of this card
  nextReviewAt: { type: Date, default: Date.now } 
}, { 
  // Automatically adds and manages 'createdAt' and 'updatedAt' fields
  timestamps: true 
});

// Ensures a user can only have one unique progress record per card
cardProgressSchema.index({ userId: 1, cardId: 1 }, { unique: true });

const CardProgress = mongoose.model("CardProgress", cardProgressSchema);

export default CardProgress;