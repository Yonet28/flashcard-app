import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

export const client = new MongoClient(process.env.MONGO_URI);
let db;

export async function connectToDb() {
  try {
    await client.connect();
    db = client.db("flashcardApp"); 
    console.log("Connecté à MongoDB avec succès !");
  } catch (error) {
    console.error("Erreur de connexion MongoDB :", error);
  }
}

export function getDb() {
  return db;
}