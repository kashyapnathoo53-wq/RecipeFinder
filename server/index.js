import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import recipeRoutes from "./routes/recipes.js";
import adminRoutes from "./routes/admin.js";
import favoritesRoutes from "./routes/favorites.js";

dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/favorites", favoritesRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Recipe Recommender API is running smoothly!", version: "1.0.0" });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err
  });
});

// Process error listeners to prevent unexpected exits
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Connect to MongoDB with 127.0.0.1 fallback
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/RecipeDB";

mongoose.connect(mongoUri)
.then(() => {
  console.log("✅ MongoDB Connected Successfully");
  const server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  server.on('error', (err) => {
    console.error('❌ Server listen error:', err);
  });
})
.catch((err) => {
  console.error("MongoDB connection error:", err.message);
});
