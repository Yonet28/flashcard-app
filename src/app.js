import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";

import cardRoutes from "./routes/card.routes.js";
import userRoutes from "./routes/user.routes.js";
import folderRoutes from "./routes/folder.routes.js"; 

const app = express();

const swaggerDocument = yaml.load("./swagger.yaml");

app.use(cors());
app.use(express.json());
app.use('/auth', userRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/cards", cardRoutes);
app.use("/users", userRoutes);

app.use("/folders", folderRoutes);

export default app;