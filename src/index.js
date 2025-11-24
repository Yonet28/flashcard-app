import app from "./app.js";
import { connectToDb } from "./db/mongo.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectToDb();

  app.listen(PORT, () => {
    console.log(`Serveur en écoute sur http://localhost:${PORT}`);
  });
}

startServer();