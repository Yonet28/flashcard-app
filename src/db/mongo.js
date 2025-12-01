import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'flashcardApp' 
    });
    console.log("Connecté à MongoDB via Mongoose !");
  } catch (error) {
    console.error("Erreur de connexion MongoDB :", error);
  }
}