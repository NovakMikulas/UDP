import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDatabase from "./config/database";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors);

connectDatabase();

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
