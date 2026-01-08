import 'dotenv/config'; 
import app from "./app.js";
import { connectToDb } from "./db/mongo.js";

// Maintenant, PORT vaudra bien 5000
const PORT = process.env.PORT || 5000; 

async function startServer() {
  await connectToDb();
  app.listen(PORT, () => {
    console.log(`Serveur en écoute sur http://localhost:${PORT}`);
  });
}
startServer();