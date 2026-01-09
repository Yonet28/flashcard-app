import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from the .env file into process.env
dotenv.config();

// Asynchronous function to establish the connection to the MongoDB database
export async function connectToDb() {
  try {
    // Connect to MongoDB using the URI from environment variables and specify the database name
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'flashcardApp' 
    });
    console.log("Connecté à MongoDB via Mongoose !");
  } catch (error) {
    // Log the error if the connection fails
    console.error("Erreur de connexion MongoDB :", error);
  }
}