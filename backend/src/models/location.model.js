import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number,
    
});

