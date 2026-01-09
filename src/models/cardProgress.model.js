import mongoose from "mongoose";

const cardProgressSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  box: { type: Number, default: 1 }, // Le niveau Leitner (1 à 7)
  nextReviewAt: { type: Date, default: Date.now } // La prochaine date
}, { timestamps: true });

cardProgressSchema.index({ userId: 1, cardId: 1 }, { unique: true });

const CardProgress = mongoose.model("CardProgress", cardProgressSchema);

export default CardProgress;