import express from "express";
import cors from "cors";
import cardRoutes from "./routes/card.routes.js";
import userRoutes from "./routes/user.routes.js"; 

const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/cards", cardRoutes);
app.use("/api/users", userRoutes); 

export default app;