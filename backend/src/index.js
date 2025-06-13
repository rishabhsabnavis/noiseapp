import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;



app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/upload", (req, res) => {
    res.status(201).json({message: "File uploaded successfully"});
});

app.listen(PORT, () => {console.log(`Server running on port ${PORT}`); connectDB();});
 