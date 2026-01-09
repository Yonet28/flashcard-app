import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";

import cardRoutes from "./routes/card.routes.js";
import userRoutes from "./routes/user.routes.js";
import folderRoutes from "./routes/folder.routes.js"; 

// Initialize the Express application instance
const app = express();

// Load the OpenAPI/Swagger specification from the YAML file
const swaggerDocument = yaml.load("./swagger.yaml");

// Enable CORS (Cross-Origin Resource Sharing) for all requests
app.use(cors());

// Middleware to parse incoming request bodies as JSON
app.use(express.json());

// Routes dedicated specifically to authentication (login/register)
app.use('/auth', userRoutes);

// Mount the Swagger UI documentation at the /api-docs endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount domain-specific resource routes
app.use("/cards", cardRoutes);
app.use("/users", userRoutes);
app.use("/folders", folderRoutes);

export default app;