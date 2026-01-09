import 'dotenv/config'; 
import app from "./app.js";
import { connectToDb } from "./db/mongo.js";

// Define the server port using environment variables or a fallback value
const PORT = process.env.PORT || 5000; 

/**
 * Initializes the backend services.
 * Ensures the database connection is established before the server starts accepting requests.
 */
async function startServer() {
  // Connect to the MongoDB database via Mongoose
  await connectToDb();
  
  // Start the Express application and listen for incoming traffic on the specified port
  app.listen(PORT, () => {
    console.log(`Serveur en écoute sur http://localhost:${PORT}`);
  });
}

// Execute the startup function
startServer();