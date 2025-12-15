import express from "express";
import cors from "cors";
import cardRoutes from "./routes/card.routes.js";
import userRoutes from "./routes/user.routes.js"; 
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import folderRoutes from "./routes/folder.routes.js";

const app = express();

const swaggerDocument = yaml.load("./swagger.yaml");

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/cards", cardRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/folders", folderRoutes);

export default app;