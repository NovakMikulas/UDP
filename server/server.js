import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDatabase from "./config/database.js";
import deviceRoutes from "./routes/device-routes.js";
import locationRoutes from "./routes/location-routes.js";
import roomRoutes from "./routes/room-routes.js";
import messageRoutes from "./routes/message-routes.js";
import userRoutes from "./routes/user-routes.js";
import globalErrorHandler from "./middleware/error-middleware.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/device", deviceRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/message", messageRoutes);
app.use("/auth", userRoutes);
connectDatabase();

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

app.use(globalErrorHandler);
